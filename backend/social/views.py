from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .tasks import process_facebook_message_task
import logging

logger = logging.getLogger(__name__)

class FacebookWebhookView(APIView):
    """
    Endpoint for Facebook Messenger Webhooks.
    """
    permission_classes = [] # Publicly accessible for Meta's verification and notifications

    def get(self, request):
        """
        Handles the webhook verification challenge from Meta.
        """
        mode = request.query_params.get('hub.mode')
        token = request.query_params.get('hub.verify_token')
        challenge = request.query_params.get('hub.challenge')

        # Use a setting for verify_token in production
        VERIFY_TOKEN = "ecommerce_saas_verify_token" 
        
        if mode == 'subscribe' and token == VERIFY_TOKEN:
            return Response(int(challenge), status=status.HTTP_200_OK)
        return Response("Verification failed", status=status.HTTP_403_FORBIDDEN)

    def post(self, request):
        """
        Receives incoming messages and comments from Facebook.
        """
        data = request.data
        if data.get('object') == 'page':
            for entry in data.get('entry', []):
                # Handle Messaging (Messenger)
                for messaging_event in entry.get('messaging', []):
                    if messaging_event.get('message'):
                        sender_id = messaging_event['sender']['id']
                        message_text = messaging_event['message'].get('text')
                        logger.info(f"Received Facebook message from {sender_id}: {message_text}")
                        from .tasks import process_facebook_message_task
                        process_facebook_message_task.delay(sender_id, message_text, merchant_id=None)
                
                # Handle Feed Changes (Comments)
                for change in entry.get('changes', []):
                    if change.get('field') == 'feed':
                        value = change.get('value', {})
                        if value.get('item') == 'comment' and value.get('verb') == 'add':
                            comment_id = value.get('comment_id')
                            comment_text = value.get('message')
                            logger.info(f"Received Facebook comment {comment_id}: {comment_text}")
                            from .tasks import process_facebook_comment_task
                            process_facebook_comment_task.delay(comment_id, comment_text, merchant_id=None)
                        
            return Response("EVENT_RECEIVED", status=status.HTTP_200_OK)
        return Response(status=status.HTTP_404_NOT_FOUND)
