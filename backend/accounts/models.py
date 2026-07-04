from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    is_merchant = models.BooleanField(default=False)

    def __str__(self):
        return self.username


class Store(models.Model):
    merchant = models.OneToOneField(User, on_delete=models.CASCADE, related_name='store')
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Employee(models.Model):
    ROLE_CHOICES = [
        ('manager', 'Manager'),
        ('product_editor', 'Product Editor'),
        ('order_handler', 'Order Handler'),
        ('viewer', 'Viewer'),
    ]

    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='employees')
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('store', 'user')

    def __str__(self):
        return f"{self.user.username} — {self.role} at {self.store.name}"


class ShippingAddress(models.Model):
    """A customer's saved shipping details, prefilled at checkout."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='shipping_address')
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True)
    apartment = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True, default='US')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Shipping for {self.user.username}"
