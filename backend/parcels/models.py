from django.db import models

class Parcel(models.Model):
    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, related_name='parcel')
    tracking_id = models.CharField(max_length=100, unique=True)
    service = models.CharField(max_length=50) # pathao, steadfast, redx
    raw_response = models.JSONField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ParcelLog(models.Model):
    parcel = models.ForeignKey(Parcel, on_delete=models.CASCADE, related_name='logs')
    status = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    raw_webhook_data = models.JSONField(null=True, blank=True)
