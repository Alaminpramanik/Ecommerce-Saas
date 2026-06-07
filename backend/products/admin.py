from django.contrib import admin
from .models import Category, Product, ProductImage

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'merchant', 'category', 'sale_price', 'stock_quantity', 'sold_quantity', 'created_at')
    list_filter = ('category', 'is_on_sale', 'created_at')
    search_fields = ('name', 'description')
    inlines = [ProductImageInline]
