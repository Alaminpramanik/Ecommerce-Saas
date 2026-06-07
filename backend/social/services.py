import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class MetaServiceClient:
    """
    Handles interactions with the Meta Graph API for Facebook and Instagram.
    """
    BASE_URL = "https://graph.facebook.com/v18.0"

    def __init__(self, access_token=None):
        self.access_token = access_token

    def post_to_page(self, page_id, message, link=None):
        """
        Posts a message to a Facebook Page.
        """
        # MOCK IMPLEMENTATION
        logger.info(f"MOCK: Posting to Facebook Page {page_id}: {message}")
        return {"id": f"mock_post_id_{page_id}"}

    def send_message(self, recipient_id, text):
        """
        Sends a message to a Facebook user via the Messenger API.
        """
        # MOCK IMPLEMENTATION
        logger.info(f"MOCK: Sending Facebook message to {recipient_id}: {text}")
        return {"message_id": f"mock_msg_id_{recipient_id}"}

    def reply_to_comment(self, comment_id, text):
        """
        Replies to a comment on a Facebook post.
        """
        # MOCK IMPLEMENTATION
        logger.info(f"MOCK: Replying to comment {comment_id}: {text}")
        return {"id": f"mock_reply_id_{comment_id}"}

class AIServiceClient:
    """
    Uses AI to generate responses for customer inquiries.
    """
    def generate_reply(self, incoming_message, product_context=None):
        """
        Generates an AI reply based on the incoming message and optionally product context.
        """
        # In a real scenario, this would call Gemini or another LLM
        # For now, we provide a smart mock reply
        
        reply = f"Hello! Thank you for your interest. "
        if product_context:
            reply += f"Regarding our {product_context['name']}, it is currently priced at {product_context['price']}."
        else:
            reply += "How can we help you today?"
            
        logger.info(f"MOCK: Generated AI reply: {reply}")
        return reply
