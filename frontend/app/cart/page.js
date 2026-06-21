'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, shipping, total, clearCart } = useCart()
  const [coupon, setCoupon] = useState('')
  const [couponStatus, setCouponStatus] = useState(null)
  const [discount, setDiscount] = useState(0)
  const [imgErrors, setImgErrors] = useState({})

  function handleCoupon(e) {
    e.preventDefault()
    if (coupon.toUpperCase() === 'LUXE15') {
      setDiscount(subtotal * 0.15)
      setCouponStatus({ type: 'success', msg: 'Coupon applied! 15% off your order.' })
    } else {
      setCouponStatus({ type: 'error', msg: 'Invalid coupon code.' })
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-6">🛍️</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven&apos;t added anything yet. Start shopping to fill it up!</p>
        <Link href="/products" className="btn-primary inline-block">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Shopping Cart
          <span className="ml-3 text-lg font-normal text-gray-400">({items.length} item{items.length !== 1 ? 's' : ''})</span>
        </h1>
        <button onClick={clearCart} className="text-sm text-gray-500 hover:text-red-600 transition-colors">
          Clear cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.key} className="flex gap-4 bg-white border border-gray-100 p-4 hover:border-gray-200 transition-colors">
              {/* Image */}
              <Link href={`/products/${item.id}`} className="relative w-24 h-24 flex-shrink-0 bg-gray-50 overflow-hidden">
                <Image
                  src={imgErrors[item.key] ? `https://picsum.photos/seed/cart${item.id}/200/200` : item.image}
                  alt={item.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  onError={() => setImgErrors((prev) => ({ ...prev, [item.key]: true }))}
                />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/products/${item.id}`} className="font-medium text-gray-900 text-sm hover:text-teal-600 transition-colors line-clamp-2">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.key)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                    aria-label="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Variants */}
                {(item.variant?.color || item.variant?.size) && (
                  <div className="flex gap-2 mt-1">
                    {item.variant.color && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5">{item.variant.color}</span>
                    )}
                    {item.variant.size && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5">{item.variant.size}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-gray-200">
                    <button
                      onClick={() => {
                        if (item.quantity === 1) removeItem(item.key)
                        else updateQuantity(item.key, item.quantity - 1)
                      }}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-sm disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Continue shopping */}
          <Link href="/products" className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors mt-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-gray-50 border border-gray-200 p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 text-lg mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-teal-600">
                  <span>Discount (LUXE15)</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={shipping === 0 ? 'text-teal-600 font-medium' : 'font-medium'}>
                  {shipping === 0 ? 'Free' : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 px-3 py-2">
                  Add {formatPrice(75 - subtotal)} more for free shipping
                </p>
              )}
            </div>

            <div className="flex justify-between items-center font-bold text-lg border-t border-gray-200 pt-4 mb-5">
              <span>Total</span>
              <span>{formatPrice(total - discount)}</span>
            </div>

            {/* Coupon */}
            <form onSubmit={handleCoupon} className="mb-5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => { setCoupon(e.target.value); setCouponStatus(null) }}
                  placeholder="Coupon code"
                  className="flex-1 border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                />
                <button type="submit" className="bg-gray-900 text-white px-4 py-2.5 text-sm font-semibold hover:bg-black transition-colors">
                  Apply
                </button>
              </div>
              {couponStatus && (
                <p className={`text-xs mt-1.5 ${couponStatus.type === 'success' ? 'text-teal-600' : 'text-red-500'}`}>
                  {couponStatus.msg}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">Try: LUXE15</p>
            </form>

            <Link href="/checkout" className="btn-primary w-full text-center block py-4 text-base">
              Proceed to Checkout
            </Link>

            <div className="flex items-center justify-center gap-2 mt-4">
              {['VISA', 'MC', 'AMEX', 'PayPal'].map((p) => (
                <span key={p} className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-1 rounded">
                  {p}
                </span>
              ))}
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">Secure, encrypted checkout</p>
          </div>
        </div>
      </div>
    </div>
  )
}
