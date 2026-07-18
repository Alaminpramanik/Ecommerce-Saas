from rest_framework import serializers
from .models import Product, Category, ProductImage

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('merchant', 'sold_quantity', 'ai_extracted_data', 'hero_image')
        # cost_price and last_price are merchant accounting fields — accept on write, never expose publicly.
        extra_kwargs = {
            'cost_price': {'write_only': True},
            'last_price': {'write_only': True},
        }
