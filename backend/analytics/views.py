from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, F
from orders.models import Order, OrderItem

class SalesProfitView(APIView):
    def get(self, request):
        total_sales = Order.objects.filter(status='delivered').aggregate(total=Sum('total_price'))['total'] or 0
        
        # Simplified profit calculation
        # Profit = (sale_price - cost_price) * quantity
        profit = OrderItem.objects.filter(order__status='delivered').aggregate(
            total_profit=Sum((F('price') - F('product__cost_price')) * F('quantity'))
        )['total_profit'] or 0
        
        return Response({
            'total_sales': total_sales,
            'total_profit': profit,
            'order_count': Order.objects.count()
        })
