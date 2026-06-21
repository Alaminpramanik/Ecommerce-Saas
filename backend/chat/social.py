"""Auto-post newly added products to Facebook Page + Instagram via the Graph API.

Configure via env: FB_PAGE_ACCESS_TOKEN, FB_PAGE_ID, IG_USER_ID.
Instagram requires a PUBLIC image URL (it cannot fetch localhost); Facebook uploads
the image bytes directly, so it works even in local dev.
"""
import os
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)
GRAPH_URL = 'https://graph.facebook.com/v19.0'


def build_caption(product):
    lines = [f"🛍️ {product.name}", f"💵 Price: ${product.sale_price}"]
    if product.description:
        lines += ["", product.description[:300]]
    lines += ["", "📩 DM us to order!"]
    return "\n".join(lines)


def post_to_facebook(product, image_path):
    """Upload the product photo to the Facebook Page. Returns the post_id, or None."""
    token = getattr(settings, 'FB_PAGE_ACCESS_TOKEN', '')
    page_id = getattr(settings, 'FB_PAGE_ID', '')
    if not (token and page_id and image_path and os.path.exists(image_path)):
        return None
    try:
        with open(image_path, 'rb') as f:
            resp = requests.post(
                f'{GRAPH_URL}/{page_id}/photos',
                data={'message': build_caption(product), 'access_token': token},
                files={'source': f},
                timeout=30,
            )
        data = resp.json()
        if 'error' in data:
            logger.error('Facebook post failed: %s', data['error'])
            return None
        # /photos returns 'post_id' (the feed story) and 'id' (the photo).
        return data.get('post_id') or data.get('id')
    except Exception as e:
        logger.error('Facebook post exception: %s', e)
        return None


def post_to_instagram(product, image_url):
    """Publish the product to Instagram (needs a PUBLIC image_url). Returns media id, or None."""
    token = getattr(settings, 'FB_PAGE_ACCESS_TOKEN', '')
    ig_user_id = getattr(settings, 'IG_USER_ID', '')
    if not (token and ig_user_id and image_url):
        return None
    try:
        create = requests.post(
            f'{GRAPH_URL}/{ig_user_id}/media',
            data={'image_url': image_url, 'caption': build_caption(product), 'access_token': token},
            timeout=30,
        ).json()
        creation_id = create.get('id')
        if not creation_id:
            return None
        publish = requests.post(
            f'{GRAPH_URL}/{ig_user_id}/media_publish',
            data={'creation_id': creation_id, 'access_token': token},
            timeout=30,
        ).json()
        return publish.get('id')
    except Exception:
        return None


def auto_post_product(product, image_field, public_image_url=None):
    """Post a product to FB + IG and save the FB post id back (so comments auto-reply)."""
    if not getattr(settings, 'FB_PAGE_ACCESS_TOKEN', ''):
        return

    image_path = getattr(image_field, 'path', None)
    fb_post_id = post_to_facebook(product, image_path)
    if fb_post_id:
        product.fb_post_id = fb_post_id
        product.save(update_fields=['fb_post_id'])

    post_to_instagram(product, public_image_url)
