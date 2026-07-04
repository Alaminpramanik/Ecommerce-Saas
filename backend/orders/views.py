from rest_framework import viewsets, permissions
from .models import Order, OrderItem
from .serializers import OrderSerializer
from accounts.permissions import CanManageOrders


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [CanManageOrders]

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
        # Superuser and merchant see all orders
        if user.is_superuser or user.is_merchant:
            return Order.objects.all()
        # Store employee sees all orders (order_handler, manager, viewer)
        if hasattr(user, 'employee_profile') and user.employee_profile.is_active:
            return Order.objects.all()
        # Regular customer sees only their own orders
        return Order.objects.filter(user=user)
