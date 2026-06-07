from django.urls import path
from .views import SalesProfitView

urlpatterns = [
    path('profit/', SalesProfitView.as_view(), name='sales_profit'),
]
