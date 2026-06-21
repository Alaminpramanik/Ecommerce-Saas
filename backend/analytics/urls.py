from django.urls import path
from .views import SalesProfitView, MerchantDashboardView

urlpatterns = [
    path('profit/', SalesProfitView.as_view(), name='sales_profit'),
    path('merchant/', MerchantDashboardView.as_view(), name='merchant_dashboard'),
]
