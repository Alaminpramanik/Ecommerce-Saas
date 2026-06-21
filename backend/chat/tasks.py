from celery import shared_task


@shared_task
def auto_post_product_task(product_id, public_image_url=None):
    """Background job: post a newly added product to Facebook + Instagram."""
    from products.models import Product
    from .social import auto_post_product

    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return

    feature = product.images.first()
    image_field = feature.image if feature else None
    auto_post_product(product, image_field, public_image_url)
