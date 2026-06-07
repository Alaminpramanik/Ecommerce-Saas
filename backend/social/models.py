from django.db import models
from django.conf import settings

class SocialAccount(models.Model):
    PLATFORM_CHOICES = [
        ('facebook', 'Facebook'),
        ('instagram', 'Instagram'),
    ]
    merchant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='social_accounts')
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    platform_account_id = models.CharField(max_length=255)
    access_token = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.merchant.username} - {self.platform}"

class SocialPost(models.Model):
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='social_posts')
    social_account = models.ForeignKey(SocialAccount, on_delete=models.CASCADE, related_name='posts')
    platform_post_id = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=20, default='pending') # pending, success, failed
    error_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post for {self.product.name} on {self.social_account.platform}"
