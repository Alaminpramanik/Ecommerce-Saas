from celery import shared_task
from .models import Product, SocialAccount, SocialPost
from .services import MetaServiceClient, AIServiceClient
import logging

logger = logging.getLogger(__name__)

@shared_task
def post_product_to_social_task(product_id):
    """
    Task to post product to all active social accounts of the merchant.
    """
    try:
        from products.models import Product # Avoid circular import
        product = Product.objects.get(id=product_id)
        merchant = product.merchant
        social_accounts = SocialAccount.objects.filter(merchant=merchant, is_active=True)
        
        for account in social_accounts:
            client = MetaServiceClient(access_token=account.access_token)
            message = f"New Product Alert: {product.name}\n\n{product.description}\n\nPrice: {product.sale_price} BDT\nBuy now!"
            
            # Create a post record
            post_record = SocialPost.objects.create(
                product=product,
                social_account=account,
                status='pending'
            )
            
            try:
                response = client.post_to_page(account.platform_account_id, message)
                post_record.platform_post_id = response.get('id')
                post_record.status = 'success'
                post_record.save()
            except Exception as e:
                post_record.status = 'failed'
                post_record.error_message = str(e)
                post_record.save()
                logger.error(f"Failed to post to {account.platform}: {str(e)}")
                
    except Product.DoesNotExist:
        logger.error(f"Product with id {product_id} not found.")

@shared_task
def process_facebook_message_task(sender_id, message_text, merchant_id):
    """
    Task to process an incoming Facebook message, generate an AI reply, and send it.
    """
    ai_client = AIServiceClient()
    meta_client = MetaServiceClient() # In real scenario, would need merchant's token
    
    # Generate reply
    reply_text = ai_client.generate_reply(message_text)
    
    # Send reply
    meta_client.send_message(sender_id, reply_text)

@shared_task
def process_facebook_comment_task(comment_id, comment_text, merchant_id):
    """
    Task to process an incoming Facebook comment, generate an AI reply, and post it.
    """
    ai_client = AIServiceClient()
    meta_client = MetaServiceClient()
    
    # Generate reply
    reply_text = ai_client.generate_reply(comment_text)
    
    # Reply to comment
    meta_client.reply_to_comment(comment_id, reply_text)
