from django.contrib import admin
from .models import SocialAccount, SocialPost

@admin.register(SocialAccount)
class SocialAccountAdmin(admin.ModelAdmin):
    list_display = ('merchant', 'platform', 'platform_account_id', 'is_active', 'created_at')
    list_filter = ('platform', 'is_active')
    search_fields = ('merchant__username', 'platform_account_id')

@admin.register(SocialPost)
class SocialPostAdmin(admin.ModelAdmin):
    list_display = ('product', 'social_account', 'platform_post_id', 'status', 'created_at')
    list_filter = ('status', 'social_account__platform')
    search_fields = ('product__name', 'platform_post_id')
    readonly_fields = ('created_at',)
