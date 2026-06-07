from django.contrib import admin
from .models import Parcel, ParcelLog

class ParcelLogInline(admin.TabularInline):
    model = ParcelLog
    extra = 0
    readonly_fields = ('timestamp', 'status', 'raw_webhook_data')

@admin.register(Parcel)
class ParcelAdmin(admin.ModelAdmin):
    list_display = ('tracking_id', 'order', 'service', 'created_at')
    list_filter = ('service', 'created_at')
    search_fields = ('tracking_id', 'order__id', 'order__full_name')
    inlines = [ParcelLogInline]
