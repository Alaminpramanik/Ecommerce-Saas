'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import StarRating from './StarRating'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const wishlisted = isWishlisted(product.id)
  const discount = calculateDiscount(product.originalPrice, product.price)

  function handleAddToCart(e) {
    e.preventDefault()
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  function handleWishlist(e) {
    e.preventDefault()
    toggle(product)
  }

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white border border-gray-100 overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all duration-300">
        {/* Image container */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <Image
            src={imgError ? `https://picsum.photos/seed/fallback${product.id}/600/600` : product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.badge === 'Sale' && discount > 0 && (
              <span className="badge-sale">-{discount}%</span>
            )}
            {product.badge === 'New' && <span className="badge-new">New</span>}
            {product.badge === 'Hot' && <span className="badge-hot">Hot</span>}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white shadow-md
              transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110
              ${wishlisted ? 'opacity-100' : ''}`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg
              className={`w-4 h-4 transition-colors ${wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
              fill={wishlisted ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          {/* Quick add overlay */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className={`w-full py-3 text-sm font-semibold tracking-wide transition-all duration-200
                ${added
                  ? 'bg-teal-600 text-white'
                  : 'bg-black text-white hover:bg-gray-800'
                }`}
            >
              {added ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Added to Cart
                </span>
              ) : (
                'Quick Add'
              )}
            </button>
          </div>

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-gray-900 text-white text-xs font-bold px-4 py-2 uppercase tracking-wider">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-[11px] text-teal-600 font-semibold uppercase tracking-wider mb-1">
            {product.category}
          </p>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-black">
            {product.name}
          </h3>
          <StarRating rating={product.rating} reviews={product.reviews} size="sm" />
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-xs text-orange-600 font-medium mt-1">Only {product.stock} left!</p>
          )}
        </div>
      </div>
    </Link>
  )
}
