from rest_framework import generics, permissions
from .models import User, ShippingAddress
from .serializers import UserSerializer, ShippingAddressSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)

class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class ShippingAddressView(generics.RetrieveUpdateAPIView):
    """Get or save the logged-in user's saved shipping address."""
    serializer_class = ShippingAddressSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        obj, _ = ShippingAddress.objects.get_or_create(user=self.request.user)
        return obj
