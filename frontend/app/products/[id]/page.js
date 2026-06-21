'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import { getProductById, getRelatedProducts } from '@/lib/products'
import { api } from '@/lib/api'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useProductChat } from '@/context/ProductChatContext'
import ProductCard from '@/components/ProductCard'
import StarRating from '@/components/StarRating'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)

  // Fetch the product from the backend; fall back to bundled demo data if it's unavailable.
  useEffect(() => {
    let active = true
    setLoading(true)
    api
      .product(id)
      .then(async (p) => {
        if (!active) return
        setProduct(p)
        try {
          const all = await api.products()
          if (active) setRelated(all.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4))
        } catch {}
      })
      .catch(() => {
        if (!active) return
        const mock = getProductById(id)
        if (mock) {
          setProduct(mock)
          setRelated(getRelatedProducts(mock))
        } else {
          setMissing(true)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full" />
      </div>
    )
  }
  if (missing || !product) return notFound()

  return <ProductDetail product={product} related={related} />
}

function ProductDetail({ product, related }) {
  const { addItem } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const { setCurrentProduct } = useProductChat()
  const [activeImage, setActiveImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product.variants?.colors?.[0] || null)
  const [selectedSize, setSelectedSize] = useState(product.variants?.sizes?.[0] || null)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [imgErrors, setImgErrors] = useState({})

  // Publish the full product to the chat widget so support can answer about it and
  // the customer can add it to the cart straight from chat; clear on leave.
  useEffect(() => {
    setCurrentProduct(product)
    return () => setCurrentProduct(null)
  }, [product, setCurrentProduct])

  const discount = calculateDiscount(product.originalPrice, product.price)
  const wishlisted = isWishlisted(product.id)

  function handleAddToCart() {
    addItem(product, quantity, { color: selectedColor, size: selectedSize })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  function getImageSrc(index) {
    if (imgErrors[index]) return `https://picsum.photos/seed/fallback${product.id}${index}/600/600`
    return product.images[index]
  }

  const badgeMap = {
    Sale: 'badge-sale',
    New: 'badge-new',
    Hot: 'badge-hot',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-black transition-colors">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-black transition-colors capitalize">{product.category}</Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">
        {/* Image gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-50 overflow-hidden group">
            <Image
              src={getImageSrc(activeImage)}
              alt={`${product.name} - image ${activeImage + 1}`}
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgErrors((prev) => ({ ...prev, [activeImage]: true }))}
            />
            {product.badge && (
              <div className="absolute top-4 left-4">
                <span className={badgeMap[product.badge]}>
                  {product.badge === 'Sale' ? `-${discount}%` : product.badge}
                </span>
              </div>
            )}
            {/* Nav arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((p) => (p > 0 ? p - 1 : product.images.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setActiveImage((p) => (p < product.images.length - 1 ? p + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 overflow-x-auto hide-scrollbar">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative w-20 h-20 flex-shrink-0 overflow-hidden border-2 transition-colors ${
                  activeImage === i ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <Image
                  src={getImageSrc(i)}
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  onError={() => setImgErrors((prev) => ({ ...prev, [i]: true }))}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product info */}
        <div>
          <div className="mb-1">
            <Link
              href={`/products?category=${product.category}`}
              className="text-xs font-bold uppercase tracking-widest text-teal-600 hover:text-teal-700"
            >
              {product.category}
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating} reviews={product.reviews} size="sm" />
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                <span className="badge-sale">Save {discount}%</span>
              </>
            )}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

          {/* Color selector */}
          {product.variants?.colors && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Color: <span className="font-normal text-gray-600">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-sm border-2 transition-all duration-150 ${
                      selectedColor === color
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size selector */}
          {product.variants?.sizes && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900">
                  Size: <span className="font-normal text-gray-600">{selectedSize}</span>
                </p>
                <button className="text-xs text-teal-600 hover:text-teal-700 underline">Size guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[44px] px-3 py-2 text-sm border-2 transition-all duration-150 ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Actions */}
          <div className="flex gap-3 mb-6">
            <div className="flex items-center border border-gray-300">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
              >
                −
              </button>
              <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                className="w-10 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 py-3 font-bold text-sm tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                addedToCart
                  ? 'bg-teal-600 text-white'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {product.stock === 0 ? 'Out of Stock' : addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
            </button>

            <button
              onClick={() => toggle(product)}
              className={`w-12 h-12 flex items-center justify-center border-2 transition-all duration-200 ${
                wishlisted ? 'border-red-400 text-red-500' : 'border-gray-300 text-gray-600 hover:border-gray-600'
              }`}
              aria-label="Add to wishlist"
            >
              <svg
                className="w-5 h-5"
                fill={wishlisted ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Free shipping banner */}
          {product.price >= 75 && (
            <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 px-4 py-3 mb-6 text-sm text-teal-800">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              This item qualifies for <strong className="ml-1">free shipping</strong>
            </div>
          )}

          {/* Features */}
          <div className="border-t border-gray-200 pt-5">
            <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
            <ul className="space-y-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 border-t border-gray-200 mt-5 pt-5">
            {[
              { icon: '🔒', label: 'Secure checkout' },
              { icon: '↩️', label: '30-day returns' },
              { icon: '🚚', label: 'Fast delivery' },
            ].map((b) => (
              <div key={b.label} className="text-center">
                <span className="text-xl block mb-1">{b.icon}</span>
                <span className="text-[11px] text-gray-500">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-20 pt-12 border-t border-gray-200">
          <div className="flex items-end justify-between mb-8">
            <h2 className="section-title">You Might Also Like</h2>
            <Link href={`/products?category=${product.category}`} className="hidden sm:flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700">
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
