from celery import shared_task
from orders.models import Order
from parcels.models import Parcel
from parcels.clients import PathaoClient, SteadfastClient, RedXClient

@shared_task
def create_parcel_task(order_id, service_name):
    try:
        order = Order.objects.get(id=order_id)
        
        # Select client based on service name
        if service_name == 'pathao':
            client = PathaoClient()
        elif service_name == 'steadfast':
            client = SteadfastClient()
        elif service_name == 'redx':
            client = RedXClient()
        else:
            return "Invalid service"

        response = client.create_parcel(order)
        
        if response.get('status') == 'success':
            Parcel.objects.create(
                order=order,
                tracking_id=response['tracking_id'],
                service=service_name,
                raw_response=response
            )
            order.parcel_tracking_id = response['tracking_id']
            order.parcel_service = service_name
            order.status = 'picked'
            order.save()
            return f"Parcel created: {response['tracking_id']}"
    except Exception as e:
        return str(e)
