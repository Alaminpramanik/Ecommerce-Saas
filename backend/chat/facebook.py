"""Facebook Page webhook: auto-reply to comments on product posts.

Flow: FB sends a 'feed' change when someone comments -> we find the product linked to
that post (Product.fb_post_id) -> analyze the comment with Gemini -> post a reply
back to the comment via the Graph API.

Configure via env: FB_VERIFY_TOKEN, FB_PAGE_ACCESS_TOKEN, FB_APP_SECRET, FB_PAGE_ID.
"""
import json
import hmac
import hashlib
import logging
import requests
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)
GRAPH_URL = 'https://graph.facebook.com/v19.0'


def _verify_signature(request):
    """Validate the X-Hub-Signature-256 header against the app secret (skipped if unset)."""
    secret = getattr(settings, 'FB_APP_SECRET', '')
    if not secret:
        return True
    sig = request.headers.get('X-Hub-Signature-256', '')
    if not sig.startswith('sha256='):
        return False
    expected = 'sha256=' + hmac.new(secret.encode(), request.body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, sig)


def _get_product_for_post(post_id):
    from products.models import Product
    if not post_id:
        return None
    p = Product.objects.filter(fb_post_id=post_id).first()
    if not p:
        return None
    return {'name': p.name, 'sale_price': str(p.sale_price), 'in_stock': p.stock_quantity > 0}


def _generate_reply(comment, product):
    """Analyze the comment and craft a reply (Gemini if configured, else a canned fallback)."""
    key = getattr(settings, 'GEMINI_API_KEY', '')
    if key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            details = ''
            if product:
                details = (
                    f"Product: {product['name']}\nPrice: ${product['sale_price']}\n"
                    f"In stock: {'yes' if product['in_stock'] else 'no'}\n"
                )
            prompt = (
                "You are a friendly e-commerce Facebook Page assistant. A customer left a comment "
                "on a product post. Analyze the comment and reply in 1-2 short, helpful sentences. "
                "If they ask price or availability, answer using the details. Encourage them to order via DM.\n\n"
                f"{details}\nCustomer comment: {comment}"
            )
            resp = model.generate_content(prompt)
            text = (resp.text or '').strip()
            if text:
                return text
        except Exception:
            pass

    if product:
        stock = 'in stock' if product['in_stock'] else 'currently out of stock'
        return (
            f"Thanks for your comment! \"{product['name']}\" is ${product['sale_price']} and {stock}. "
            "Please DM us to place an order. 🛍️"
        )
    return "Thanks for reaching out! Please DM us and we'll help you right away. 🛍️"


def generate_dm_reply(text):
    """Analyze a Messenger message and craft a reply (Gemini if configured, else canned)."""
    key = getattr(settings, 'GEMINI_API_KEY', '')
    if key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = (
                "You are a friendly e-commerce store assistant replying to a Facebook Messenger "
                "message. Reply in 1-2 short, helpful sentences. If they ask about ordering, "
                "tell them to share the product name and their address.\n\n"
                f"Customer message: {text}"
            )
            resp = model.generate_content(prompt)
            t = (resp.text or '').strip()
            if t:
                return t
        except Exception:
            pass
    return "Thanks for messaging us! 🛍️ How can we help — product info, price, or placing an order?"


def send_message(psid, text):
    """Send a Messenger message to a user (PSID) via the Send API."""
    token = getattr(settings, 'FB_PAGE_ACCESS_TOKEN', '')
    if not (token and psid and text):
        return None
    try:
        r = requests.post(
            f'{GRAPH_URL}/me/messages',
            params={'access_token': token},
            json={'recipient': {'id': psid}, 'message': {'text': text}, 'messaging_type': 'RESPONSE'},
            timeout=15,
        )
        data = r.json()
        if 'error' in data:
            logger.error('Messenger send failed: %s', data['error'])
        return data
    except Exception as e:
        logger.error('Messenger send exception: %s', e)
        return None


def _reply_to_comment(comment_id, message):
    token = getattr(settings, 'FB_PAGE_ACCESS_TOKEN', '')
    if not token or not comment_id:
        return
    try:
        requests.post(
            f'{GRAPH_URL}/{comment_id}/comments',
            data={'message': message, 'access_token': token},
            timeout=10,
        )
    except Exception:
        pass


@csrf_exempt
def webhook(request):
    # 1) Verification handshake (FB calls this once when you register the webhook).
    if request.method == 'GET':
        verify_token = getattr(settings, 'FB_VERIFY_TOKEN', '')
        if verify_token and request.GET.get('hub.verify_token') == verify_token:
            return HttpResponse(request.GET.get('hub.challenge', ''))
        return HttpResponse('Verification failed', status=403)

    # 2) Event delivery.
    if not _verify_signature(request):
        return HttpResponse('Invalid signature', status=403)

    try:
        data = json.loads(request.body or b'{}')
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'status': 'bad request'}, status=400)

    page_id = getattr(settings, 'FB_PAGE_ID', '')

    for entry in data.get('entry', []):
        # --- Messenger DMs (pages_messaging) ---
        for ev in entry.get('messaging', []):
            msg = ev.get('message', {})
            if msg.get('is_echo'):
                continue  # skip the page's own outgoing messages
            text = msg.get('text')
            psid = (ev.get('sender') or {}).get('id')
            if text and psid:
                send_message(psid, generate_dm_reply(text))

        # --- Page post comments (pages_read_engagement) ---
        for change in entry.get('changes', []):
            value = change.get('value', {})
            # Only react to newly-added comments.
            if value.get('item') != 'comment' or value.get('verb') != 'add':
                continue
            # Skip the page's own comments to avoid reply loops.
            from_id = (value.get('from') or {}).get('id')
            if page_id and from_id == page_id:
                continue

            comment_id = value.get('comment_id')
            comment_text = value.get('message', '') or ''
            post_id = value.get('post_id')

            product = _get_product_for_post(post_id)
            reply = _generate_reply(comment_text, product)
            _reply_to_comment(comment_id, reply)

    # Always 200 so Facebook doesn't retry/disable the webhook.
    return JsonResponse({'status': 'ok'})
