from django.contrib import admin
from .models import ChatSession, ChatMessage

class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ('timestamp', 'sender_type', 'message')

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'product', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('session_id', 'product__name', 'user__username')
    inlines = [ChatMessageInline]
