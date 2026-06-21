from rest_framework import serializers
from .models import User, ShippingAddress

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone_number', 'address', 'is_merchant', 'is_superuser', 'password')
        extra_kwargs = {
            'password': {'write_only': True},
            'is_superuser': {'read_only': True},
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = (
            'first_name', 'last_name', 'email', 'phone', 'address',
            'apartment', 'city', 'state', 'zip_code', 'country',
        )
