import requests
from django.conf import settings

class ParcelClient:
    def __init__(self):
        pass

class PathaoClient(ParcelClient):
    BASE_URL = "https://merchant-api.pathao.com/api/v1"
    
    def create_parcel(self, order_data):
        # Implementation for Pathao
        return {"status": "success", "tracking_id": "PT-MOCK-123"}

class SteadfastClient(ParcelClient):
    BASE_URL = "https://portal.steadfast.com.bd/api/v1"
    
    def create_parcel(self, order_data):
        # Implementation for Steadfast
        return {"status": "success", "tracking_id": "SF-MOCK-456"}

class RedXClient(ParcelClient):
    BASE_URL = "https://api.redx.com.bd/api/v1"
    
    def create_parcel(self, order_data):
        # Implementation for RedX
        return {"status": "success", "tracking_id": "RX-MOCK-789"}
