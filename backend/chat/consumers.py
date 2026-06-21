import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.conf import settings


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f'chat_{self.session_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message', '')
        context = data.get('context') or {}

        # Broadcast the user's message to the room.
        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'chat_message', 'message': message, 'sender': 'user'}
        )

        # Build a context-aware support reply based on the page/product the user is on.
        reply, actions = await self.build_reply(message, context)
        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'chat_message', 'message': reply, 'sender': 'support', 'actions': actions}
        )

    PURCHASE_KEYWORDS = (
        'buy', 'order', 'purchase', 'checkout', 'add to cart', 'cart',
        'kinbo', 'kinte', 'kine', 'kinr', 'nibo', 'kena', 'kinben', 'kinte chai',
    )

    def wants_to_buy(self, message):
        low = (message or '').lower()
        return any(k in low for k in self.PURCHASE_KEYWORDS)

    async def build_reply(self, message, context):
        # Prefer the product details the page sent (works for any product); else look it up by id.
        product = context.get('product')
        if not (isinstance(product, dict) and product.get('name')):
            product = await self.get_product(context.get('product_id'))

        # Purchase intent: walk the customer through the buying steps (+ quick actions).
        if self.wants_to_buy(message):
            if product:
                steps = (
                    f"Great choice! Here's how to order \"{product['name']}\" "
                    f"(${product.get('sale_price')}):\n"
                    "1) Add it to your cart — use the button below or 'Add to Cart' on the page.\n"
                    "2) Open your cart and review the items & quantity.\n"
                    "3) Go to Checkout, enter your shipping details, and place the order.\n"
                    "You'll need to be signed in to place an order. Shipping is free over $75!"
                )
                return steps, ['add_to_cart', 'checkout']
            return (
                "Happy to help you order! Open a product page, add the item to your cart, "
                "then head to Checkout to place your order. Tap below to go to checkout.",
                ['checkout'],
            )

        if product:
            # Prefer a real AI answer when a Gemini key is configured.
            ai = await self.gemini_reply(message, product)
            if ai:
                return ai, []
            try:
                in_stock = int(product.get('stock_quantity') or 0) > 0
            except (TypeError, ValueError):
                in_stock = False
            stock = 'in stock' if in_stock else 'currently out of stock'
            desc = (product.get('description') or '')[:160].strip()
            return (
                f"You're viewing \"{product['name']}\" — it's priced at "
                f"${product.get('sale_price')} and {stock}. {desc} "
                "Want to know about shipping, returns, or how to order this item?",
                [],
            )

        path = context.get('path', '') or ''
        if '/cart' in path or '/checkout' in path:
            return (
                "Need help checking out? Shipping is free on orders over $75, and you can "
                "review your items before placing the order. Tell me what's blocking you.",
                ['checkout'],
            )
        if '/account' in path or '/merchant' in path:
            return (
                "I can help with your account or orders. You'll find your order history under "
                "Account → Orders. What do you need?",
                [],
            )
        return (
            "Thanks for reaching out! Open a product page and ask me about it — I'll share its "
            "price, stock, and how to order.",
            [],
        )

    @sync_to_async
    def get_product(self, product_id):
        if not product_id:
            return None
        from products.models import Product
        try:
            p = Product.objects.get(pk=product_id)
        except (Product.DoesNotExist, ValueError, TypeError):
            return None
        return {
            'name': p.name,
            'sale_price': str(p.sale_price),
            'stock_quantity': p.stock_quantity,
            'description': p.description or '',
        }

    @sync_to_async
    def gemini_reply(self, message, product):
        key = getattr(settings, 'GEMINI_API_KEY', '')
        if not key:
            return None
        try:
            import google.generativeai as genai
            genai.configure(api_key=key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = (
                "You are a friendly e-commerce support agent. Answer the customer's question "
                "in 2-3 concise sentences using only the product details below. If unsure, "
                "suggest contacting support.\n\n"
                f"Product: {product['name']}\n"
                f"Price: ${product['sale_price']}\n"
                f"In stock: {product['stock_quantity']}\n"
                f"Description: {product['description']}\n\n"
                f"Customer question: {message}"
            )
            resp = model.generate_content(prompt)
            return (resp.text or '').strip() or None
        except Exception:
            return None

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'actions': event.get('actions', [])
        }))
