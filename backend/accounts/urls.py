from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserDetailView, ShippingAddressView,
    StoreView, EmployeeListCreateView, EmployeeDetailView, MyEmployeeProfileView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserDetailView.as_view(), name='user_detail'),
    path('shipping/', ShippingAddressView.as_view(), name='shipping_address'),

    # Store
    path('store/', StoreView.as_view(), name='store_detail'),

    # Employees
    path('employees/', EmployeeListCreateView.as_view(), name='employee_list_create'),
    path('employees/me/', MyEmployeeProfileView.as_view(), name='my_employee_profile'),
    path('employees/<int:pk>/', EmployeeDetailView.as_view(), name='employee_detail'),
]
