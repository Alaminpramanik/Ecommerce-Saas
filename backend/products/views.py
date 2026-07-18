from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product, Category, ProductImage
from .serializers import ProductSerializer, CategorySerializer, ProductImageSerializer
from accounts.permissions import CanManageProducts


def _can_edit_product(user, product):
    """True if user is allowed to modify this specific product."""
    if user.is_superuser or product.merchant_id == user.id:
        return True
    if hasattr(user, 'employee_profile') and user.employee_profile.is_active:
        emp = user.employee_profile
        if emp.role in ('manager', 'product_editor'):
            try:
                return product.merchant.store == emp.store
            except Exception:
                return False
    return False


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Only the owning merchant or eligible employee may modify a product."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return _can_edit_product(request.user, obj)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [CanManageProducts, IsOwnerOrReadOnly]

    def _get_merchant(self):
        user = self.request.user
        if user.is_merchant or user.is_superuser:
            return user
        if hasattr(user, 'employee_profile') and user.employee_profile.is_active:
            return user.employee_profile.store.merchant
        return user

    def perform_create(self, serializer):
        serializer.save(merchant=self._get_merchant())

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def upload_image(self, request, pk=None):
        product = self.get_object()
        if not _can_edit_product(request.user, product):
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        file = request.FILES.get('image')
        if not file:
            return Response({'detail': 'No image provided.'}, status=status.HTTP_400_BAD_REQUEST)
        image = ProductImage.objects.create(
            product=product, image=file, is_feature=not product.images.exists()
        )
        if not product.fb_post_id:
            from chat.tasks import auto_post_product_task
            public_url = request.build_absolute_uri(image.image.url)
            auto_post_product_task.delay(product.id, public_url)
        return Response(
            ProductImageSerializer(image, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def upload_hero_image(self, request, pk=None):
        """Set the transparent-background cutout used only by the homepage hero slider."""
        product = self.get_object()
        if not _can_edit_product(request.user, product):
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        file = request.FILES.get('image')
        if not file:
            return Response({'detail': 'No image provided.'}, status=status.HTTP_400_BAD_REQUEST)
        product.hero_image = file
        product.save(update_fields=['hero_image', 'updated_at'])
        return Response(
            ProductSerializer(product, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_stock(self, request, pk=None):
        """Restock an existing product by adding to its current stock quantity."""
        product = self.get_object()
        if not _can_edit_product(request.user, product):
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            qty = int(request.data.get('quantity', 0))
        except (TypeError, ValueError):
            qty = 0
        if qty <= 0:
            return Response({'detail': 'Quantity must be a positive number.'}, status=status.HTTP_400_BAD_REQUEST)
        product.stock_quantity = (product.stock_quantity or 0) + qty
        product.save(update_fields=['stock_quantity', 'updated_at'])
        return Response({'id': product.id, 'stock_quantity': product.stock_quantity}, status=status.HTTP_200_OK)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [CanManageProducts]
