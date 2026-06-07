from django.urls import path
from .views import FacebookWebhookView

urlpatterns = [
    path('facebook/webhook/', FacebookWebhookView.as_view(), name='facebook_webhook'),
]
