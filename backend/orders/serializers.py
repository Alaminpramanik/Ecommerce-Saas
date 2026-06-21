from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'quantity', 'price')
        read_only_fields = ('id',)

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('user', 'status', 'parcel_tracking_id', 'parcel_service')

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        order = Order.objects.create(**validated_data)
        for item in items_data:
            order_item = OrderItem.objects.create(order=order, **item)
            # Reduce the product's stock and track units sold.
            product = order_item.product
            product.stock_quantity = max(0, (product.stock_quantity or 0) - order_item.quantity)
            product.sold_quantity = (product.sold_quantity or 0) + order_item.quantity
            product.save(update_fields=['stock_quantity', 'sold_quantity', 'updated_at'])
        return order
