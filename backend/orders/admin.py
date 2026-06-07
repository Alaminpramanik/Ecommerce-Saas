from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'status', 'total_price', 'parcel_service', 'created_at')
    list_filter = ('status', 'parcel_service', 'created_at')
    search_fields = ('full_name', 'phone', 'parcel_tracking_id')
    inlines = [OrderItemInline]
