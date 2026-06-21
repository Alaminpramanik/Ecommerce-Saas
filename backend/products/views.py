from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product, Category, ProductImage
from .serializers import ProductSerializer, CategorySerializer, ProductImageSerializer


class IsMerchantOrReadOnly(permissions.BasePermission):
    """Reads are open to everyone; writes require an authenticated merchant account."""
    message = 'Only merchant accounts can manage products.'

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and (user.is_merchant or user.is_superuser))


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Only the merchant who owns a product may modify or delete it."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.merchant_id == request.user.id or request.user.is_superuser


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsMerchantOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(merchant=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def upload_image(self, request, pk=None):
        if not (request.user.is_merchant or request.user.is_superuser):
            return Response({'detail': 'Only merchant accounts can manage products.'}, status=status.HTTP_403_FORBIDDEN)
        product = self.get_object()
        if product.merchant_id != request.user.id and not request.user.is_superuser:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        file = request.FILES.get('image')
        if not file:
            return Response({'detail': 'No image provided.'}, status=status.HTTP_400_BAD_REQUEST)
        image = ProductImage.objects.create(
            product=product, image=file, is_feature=not product.images.exists()
        )
        # Auto-post to Facebook + Instagram the first time an image is added (once per product).
        if not product.fb_post_id:
            from chat.tasks import auto_post_product_task
            public_url = request.build_absolute_uri(image.image.url)
            auto_post_product_task.delay(product.id, public_url)
        return Response(
            ProductImageSerializer(image, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_stock(self, request, pk=None):
        """Restock an existing product by adding to its current stock quantity."""
        if not (request.user.is_merchant or request.user.is_superuser):
            return Response({'detail': 'Only merchant accounts can manage products.'}, status=status.HTTP_403_FORBIDDEN)
        product = self.get_object()
        if product.merchant_id != request.user.id and not request.user.is_superuser:
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
    permission_classes = [IsMerchantOrReadOnly]
