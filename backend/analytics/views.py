from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, F, DecimalField
from django.db.models.functions import Coalesce
from django.utils import timezone
from orders.models import Order, OrderItem
from products.models import Product

# Orders that count toward realized/expected revenue (everything except cancelled/returned).
ACTIVE_STATUSES = ['pending', 'picked', 'in_transit', 'delivered']


def aggregate_items(qs):
    """Sales, profit and units for an OrderItem queryset."""
    data = qs.aggregate(
        sales=Coalesce(Sum(F('price') * F('quantity'), output_field=DecimalField()), 0, output_field=DecimalField()),
        profit=Coalesce(
            Sum((F('price') - F('product__cost_price')) * F('quantity'), output_field=DecimalField()),
            0, output_field=DecimalField(),
        ),
        units=Coalesce(Sum('quantity'), 0),
    )
    return {
        'sales': str(data['sales']),
        'profit': str(data['profit']),
        'units': data['units'],
        'orders': qs.values('order').distinct().count(),
    }


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


class MerchantDashboardView(APIView):
    """Per-merchant breakdown: each of the merchant's products with stock, units sold,
    revenue and profit, plus an overall summary."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        products = Product.objects.filter(merchant=user).order_by('-created_at')

        rows = []
        total_revenue = 0
        total_profit = 0
        total_stock = 0
        total_units = 0

        for p in products:
            agg = OrderItem.objects.filter(
                product=p, order__status__in=ACTIVE_STATUSES
            ).aggregate(
                units=Coalesce(Sum('quantity'), 0),
                revenue=Coalesce(
                    Sum(F('price') * F('quantity'), output_field=DecimalField()),
                    0, output_field=DecimalField()
                ),
            )
            units = agg['units']
            revenue = agg['revenue']
            profit = revenue - (p.cost_price * units)

            rows.append({
                'id': p.id,
                'name': p.name,
                'stock': p.stock_quantity,
                'units_sold': units,
                'revenue': str(revenue),
                'profit': str(profit),
                'is_on_sale': p.is_on_sale,
                'last_price': str(p.last_price) if p.last_price is not None else None,
                'cost_price': str(p.cost_price),
            })

            total_revenue += revenue
            total_profit += profit
            total_stock += p.stock_quantity
            total_units += units

        # Time-based sales & profit across ALL of this merchant's products.
        items = OrderItem.objects.filter(product__merchant=user, order__status__in=ACTIVE_STATUSES)
        today = timezone.localtime().date()
        today_items = items.filter(order__created_at__date=today)
        month_items = items.filter(order__created_at__year=today.year, order__created_at__month=today.month)

        daily = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            day = aggregate_items(items.filter(order__created_at__date=d))
            day['date'] = d.isoformat()
            daily.append(day)

        return Response({
            'summary': {
                'product_count': products.count(),
                'total_stock': total_stock,
                'total_units_sold': total_units,
                'total_revenue': str(total_revenue),
                'total_profit': str(total_profit),
            },
            'sales': {
                'today': aggregate_items(today_items),
                'month': aggregate_items(month_items),
                'daily': daily,
            },
            'products': rows,
        })
