from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from .models import User, ShippingAddress, Store, Employee
from .serializers import UserSerializer, ShippingAddressSerializer, StoreSerializer, EmployeeSerializer
from .permissions import IsMerchantOnly, CanManageEmployees


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


class StoreView(generics.RetrieveUpdateAPIView):
    """Merchant এর store info দেখা ও update করা।"""
    serializer_class = StoreSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        user = self.request.user
        if hasattr(user, 'employee_profile') and user.employee_profile.is_active:
            return user.employee_profile.store
        if user.is_merchant or user.is_superuser:
            store, _ = Store.objects.get_or_create(
                merchant=user,
                defaults={'name': f"{user.username}'s Store"}
            )
            return store
        return None

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj is None:
            return Response({'detail': 'No store found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(self.get_serializer(obj).data)

    def update(self, request, *args, **kwargs):
        user = request.user
        if not (user.is_merchant or user.is_superuser):
            return Response({'detail': 'Only the store owner can update store info.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class EmployeeListCreateView(generics.ListCreateAPIView):
    """Employee list দেখা ও নতুন employee add করা।"""
    serializer_class = EmployeeSerializer
    permission_classes = (permissions.IsAuthenticated, CanManageEmployees)

    def _get_store(self):
        user = self.request.user
        if user.is_merchant or user.is_superuser:
            store, _ = Store.objects.get_or_create(
                merchant=user,
                defaults={'name': f"{user.username}'s Store"}
            )
            return store
        if hasattr(user, 'employee_profile') and user.employee_profile.is_active:
            return user.employee_profile.store
        return None

    def get_queryset(self):
        store = self._get_store()
        if store is None:
            return Employee.objects.none()
        return Employee.objects.filter(store=store).select_related('user')

    def perform_create(self, serializer):
        store = self._get_store()
        if store is None:
            raise PermissionDenied('No store found.')
        serializer.save(store=store)


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Single employee এর info দেখা, role বা status পরিবর্তন, বা remove করা।"""
    serializer_class = EmployeeSerializer
    permission_classes = (permissions.IsAuthenticated, CanManageEmployees)

    def get_queryset(self):
        user = self.request.user
        if user.is_merchant or user.is_superuser:
            try:
                store = user.store
            except Store.DoesNotExist:
                return Employee.objects.none()
            return Employee.objects.filter(store=store)
        if hasattr(user, 'employee_profile') and user.employee_profile.is_active:
            return Employee.objects.filter(store=user.employee_profile.store)
        return Employee.objects.none()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {k: v for k, v in request.data.items() if k != 'employee_email'}
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class MyEmployeeProfileView(APIView):
    """Logged-in employee নিজের profile দেখতে পারবে।"""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        if not hasattr(user, 'employee_profile'):
            return Response({'detail': 'You are not an employee.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = EmployeeSerializer(user.employee_profile)
        return Response(serializer.data)
