from rest_framework import serializers
from .models import User, ShippingAddress, Store, Employee


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


class StoreSerializer(serializers.ModelSerializer):
    merchant_username = serializers.CharField(source='merchant.username', read_only=True)

    class Meta:
        model = Store
        fields = ('id', 'name', 'phone', 'address', 'created_at', 'merchant_username')
        read_only_fields = ('id', 'created_at', 'merchant_username')


class EmployeeSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)
    employee_email = serializers.EmailField(write_only=True)

    class Meta:
        model = Employee
        fields = ('id', 'employee_email', 'username', 'email', 'phone_number', 'role', 'is_active', 'added_at')
        read_only_fields = ('id', 'username', 'email', 'phone_number', 'added_at')

    def create(self, validated_data):
        employee_email = validated_data.pop('employee_email')
        store = validated_data['store']

        try:
            user = User.objects.get(email=employee_email)
        except User.DoesNotExist:
            import secrets
            import string
            alphabet = string.ascii_letters + string.digits
            temp_password = ''.join(secrets.choice(alphabet) for _ in range(12))
            base_username = employee_email.split('@')[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            user = User.objects.create_user(username=username, email=employee_email, password=temp_password)

        if Employee.objects.filter(store=store, user=user).exists():
            raise serializers.ValidationError({'employee_email': 'This user is already an employee of this store.'})

        validated_data['user'] = user
        return super().create(validated_data)
