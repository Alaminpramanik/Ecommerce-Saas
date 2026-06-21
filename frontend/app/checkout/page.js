'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/utils'

const STEPS = ['Shipping', 'Payment', 'Review']

const initialShipping = {
  firstName: '', lastName: '', email: '', phone: '',
  address: '', apartment: '', city: '', state: '', zip: '', country: 'US',
}

const initialPayment = { method: 'card', cardNumber: '', expiry: '', cvv: '', nameOnCard: '' }

export default function CheckoutPage() {
  const router = useRouter()
  const { user, updateProfile } = useAuth()
  const { items, subtotal, shipping, total, clearCart } = useCart()
  const [step, setStep] = useState(0)
  const [shippingInfo, setShippingInfo] = useState(initialShipping)
  const [paymentInfo, setPaymentInfo] = useState(initialPayment)
  const [errors, setErrors] = useState({})
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [placedId, setPlacedId] = useState(null)
  const [orderError, setOrderError] = useState('')
  const [placing, setPlacing] = useState(false)
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [imgErrors, setImgErrors] = useState({})

  // Prefill shipping: instant from localStorage, then authoritative from the saved DB address.
  useEffect(() => {
    let saved = null
    try {
      saved = JSON.parse(localStorage.getItem('shippingInfo') || 'null')
    } catch {}
    if (saved) {
      setShippingInfo((prev) => ({ ...prev, ...saved }))
    } else if (user) {
      setShippingInfo((prev) => ({
        ...prev,
        email: user.email || prev.email,
        phone: user.phone_number || prev.phone,
      }))
    }

    if (!user) return
    api
      .getShipping()
      .then((s) => {
        if (s && (s.firstName || s.address || s.city || s.zip)) {
          setShippingInfo((prev) => ({ ...prev, ...s }))
        }
      })
      .catch(() => {})
  }, [user])

  function validateShipping() {
    const e = {}
    if (!shippingInfo.firstName) e.firstName = 'Required'
    if (!shippingInfo.lastName) e.lastName = 'Required'
    if (!shippingInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) e.email = 'Valid email required'
    if (!shippingInfo.address) e.address = 'Required'
    if (!shippingInfo.city) e.city = 'Required'
    if (!shippingInfo.state) e.state = 'Required'
    if (!shippingInfo.zip) e.zip = 'Required'
    return e
  }

  function validatePayment() {
    const e = {}
    if (paymentInfo.method === 'card') {
      if (!paymentInfo.nameOnCard) e.nameOnCard = 'Required'
      if (!/^\d{16}$/.test(paymentInfo.cardNumber.replace(/\s/g, ''))) e.cardNumber = 'Enter a valid 16-digit card number'
      if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiry)) e.expiry = 'MM/YY format required'
      if (!/^\d{3,4}$/.test(paymentInfo.cvv)) e.cvv = '3 or 4 digits required'
    }
    return e
  }

  function handleNext() {
    if (step === 0) {
      const e = validateShipping()
      if (Object.keys(e).length) { setErrors(e); return }
    }
    if (step === 1) {
      const e = validatePayment()
      if (Object.keys(e).length) { setErrors(e); return }
    }
    setErrors({})
    setStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handlePlaceOrder() {
    // The backend requires an authenticated user to create an order.
    if (!user) {
      router.push('/login?next=/checkout')
      return
    }
    setPlacing(true)
    setOrderError('')
    const fullAddress = [shippingInfo.address, shippingInfo.apartment, shippingInfo.city, shippingInfo.state, shippingInfo.zip]
      .filter(Boolean)
      .join(', ')
    try {
      const order = await api.createOrder({
        full_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
        phone: shippingInfo.phone || 'N/A',
        address: fullAddress,
        total_price: total.toFixed(2),
        items: items.map((i) => ({
          product: Number(i.id),
          quantity: i.quantity,
          price: Number(i.price).toFixed(2),
        })),
      })
      // Remember the shipping info for next time — in the DB (cross-device) and locally (instant).
      try {
        localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo))
      } catch {}
      api.saveShipping(shippingInfo).catch(() => {})
      updateProfile({ phone_number: shippingInfo.phone, address: fullAddress }).catch(() => {})
      setPlacedId(order.id)
      setOrderPlaced(true)
      clearCart()
    } catch (err) {
      setOrderError(err.message || 'Could not place the order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  function formatCard(val) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(val) {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
        <Link href="/products" className="btn-primary inline-block mt-4">Shop Now</Link>
      </div>
    )
  }

  if (orderPlaced) {
    const orderId = placedId ? `#${placedId}` : 'Confirmed'
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center animate-scale-in">
        <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-2">Thank you, {shippingInfo.firstName}! Your order has been placed.</p>
        <p className="text-sm font-semibold text-gray-900 mb-8">
          Order ID: <span className="text-teal-600">{orderId}</span>
        </p>
        <div className="bg-gray-50 border border-gray-200 p-5 text-left mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">Delivery Details</h3>
          <p className="text-sm text-gray-700">{shippingInfo.firstName} {shippingInfo.lastName}</p>
          <p className="text-sm text-gray-700">{shippingInfo.address}</p>
          <p className="text-sm text-gray-700">{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}</p>
          <p className="text-sm text-gray-500 mt-2">Estimated delivery: 3–5 business days</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/account?tab=orders" className="btn-outline flex-1 text-center py-3">View Orders</Link>
          <Link href="/products" className="btn-primary flex-1 text-center py-3">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Progress steps */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 group ${i < step ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i < step ? 'bg-teal-600 text-white' :
                i === step ? 'bg-black text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-gray-900' : i < step ? 'text-teal-600' : 'text-gray-400'}`}>
                {s}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-teal-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Forms */}
        <div className="lg:col-span-2">
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="animate-fade-in">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Shipping Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'firstName', label: 'First Name', col: 1 },
                  { key: 'lastName', label: 'Last Name', col: 1 },
                  { key: 'email', label: 'Email Address', col: 2, type: 'email' },
                  { key: 'phone', label: 'Phone (optional)', col: 2, type: 'tel' },
                  { key: 'address', label: 'Street Address', col: 2 },
                  { key: 'apartment', label: 'Apartment, suite, etc. (optional)', col: 2 },
                  { key: 'city', label: 'City', col: 1 },
                ].map((field) => (
                  <div key={field.key} className={field.col === 2 ? 'col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                      {field.label}
                    </label>
                    <input
                      type={field.type || 'text'}
                      value={shippingInfo[field.key]}
                      onChange={(e) => {
                        setShippingInfo((p) => ({ ...p, [field.key]: e.target.value }))
                        setErrors((e2) => ({ ...e2, [field.key]: '' }))
                      }}
                      className={`input-field ${errors[field.key] ? 'border-red-400' : ''}`}
                    />
                    {errors[field.key] && <p className="text-red-500 text-xs mt-1">{errors[field.key]}</p>}
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">State</label>
                  <select
                    value={shippingInfo.state}
                    onChange={(e) => { setShippingInfo((p) => ({ ...p, state: e.target.value })); setErrors((e2) => ({ ...e2, state: '' })) }}
                    className={`input-field ${errors.state ? 'border-red-400' : ''}`}
                  >
                    <option value="">Select state</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">ZIP Code</label>
                  <input
                    type="text"
                    value={shippingInfo.zip}
                    onChange={(e) => { setShippingInfo((p) => ({ ...p, zip: e.target.value })); setErrors((e2) => ({ ...e2, zip: '' })) }}
                    className={`input-field ${errors.zip ? 'border-red-400' : ''}`}
                  />
                  {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Payment Method</h2>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
                  { id: 'paypal', label: 'PayPal', icon: '🅿️' },
                  { id: 'apple', label: 'Apple Pay', icon: '🍎' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentInfo((p) => ({ ...p, method: m.id }))}
                    className={`flex flex-col items-center justify-center p-4 border-2 text-sm font-medium transition-all duration-150 ${
                      paymentInfo.method === m.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-2xl mb-1">{m.icon}</span>
                    <span className="text-xs text-center leading-tight">{m.label}</span>
                  </button>
                ))}
              </div>

              {paymentInfo.method === 'card' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Name on Card</label>
                    <input
                      type="text"
                      value={paymentInfo.nameOnCard}
                      onChange={(e) => { setPaymentInfo((p) => ({ ...p, nameOnCard: e.target.value })); setErrors((e2) => ({ ...e2, nameOnCard: '' })) }}
                      className={`input-field ${errors.nameOnCard ? 'border-red-400' : ''}`}
                    />
                    {errors.nameOnCard && <p className="text-red-500 text-xs mt-1">{errors.nameOnCard}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Card Number</label>
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => { setPaymentInfo((p) => ({ ...p, cardNumber: formatCard(e.target.value) })); setErrors((e2) => ({ ...e2, cardNumber: '' })) }}
                      className={`input-field font-mono ${errors.cardNumber ? 'border-red-400' : ''}`}
                      maxLength={19}
                    />
                    {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentInfo.expiry}
                      onChange={(e) => { setPaymentInfo((p) => ({ ...p, expiry: formatExpiry(e.target.value) })); setErrors((e2) => ({ ...e2, expiry: '' })) }}
                      className={`input-field font-mono ${errors.expiry ? 'border-red-400' : ''}`}
                      maxLength={5}
                    />
                    {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={paymentInfo.cvv}
                      onChange={(e) => { setPaymentInfo((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })); setErrors((e2) => ({ ...e2, cvv: '' })) }}
                      className={`input-field font-mono ${errors.cvv ? 'border-red-400' : ''}`}
                      maxLength={4}
                    />
                    {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                  </div>
                </div>
              )}

              {paymentInfo.method !== 'card' && (
                <div className="animate-fade-in bg-gray-50 border border-gray-200 p-6 text-center">
                  <p className="text-gray-600 text-sm">
                    You will be redirected to {paymentInfo.method === 'paypal' ? 'PayPal' : 'Apple Pay'} to complete your payment.
                  </p>
                </div>
              )}

              <label className="flex items-center gap-2.5 mt-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={(e) => setSameAsBilling(e.target.checked)}
                  className="w-4 h-4 accent-teal-600"
                />
                <span className="text-sm text-gray-700">Billing address same as shipping</span>
              </label>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Review Your Order</h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-3 p-3 bg-gray-50 border border-gray-100">
                    <div className="relative w-16 h-16 flex-shrink-0 bg-white overflow-hidden">
                      <Image
                        src={imgErrors[item.key] ? `https://picsum.photos/seed/review${item.id}/200/200` : item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        onError={() => setImgErrors((prev) => ({ ...prev, [item.key]: true }))}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.name}</p>
                      {item.variant?.color && <p className="text-xs text-gray-500">{item.variant.color}{item.variant.size ? ` · ${item.variant.size}` : ''}</p>}
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-sm text-gray-900 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm text-gray-900">Shipping to</h3>
                    <button onClick={() => setStep(0)} className="text-xs text-teal-600 hover:text-teal-700">Edit</button>
                  </div>
                  <p className="text-sm text-gray-700">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                  <p className="text-sm text-gray-600">{shippingInfo.address}</p>
                  <p className="text-sm text-gray-600">{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}</p>
                  <p className="text-sm text-gray-600">{shippingInfo.email}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm text-gray-900">Payment</h3>
                    <button onClick={() => setStep(1)} className="text-xs text-teal-600 hover:text-teal-700">Edit</button>
                  </div>
                  {paymentInfo.method === 'card' ? (
                    <>
                      <p className="text-sm text-gray-700">Credit / Debit Card</p>
                      <p className="text-sm text-gray-600 font-mono">•••• •••• •••• {paymentInfo.cardNumber.slice(-4) || '????'}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-700 capitalize">{paymentInfo.method}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order error */}
          {orderError && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {orderError}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => step > 0 ? setStep((s) => s - 1) : null}
              className={`flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition-colors ${step === 0 ? 'invisible' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            {step < 2 ? (
              <button onClick={handleNext} className="btn-primary px-8 py-3">
                Continue to {STEPS[step + 1]}
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="btn-accent px-8 py-3 disabled:opacity-70"
              >
                {placing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                    </svg>
                    Placing Order...
                  </span>
                ) : `Place Order · ${formatPrice(total)}`}
              </button>
            )}
          </div>
        </div>

        {/* Order summary sidebar */}
        <div>
          <div className="bg-gray-50 border border-gray-200 p-5 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">
              Order Summary
              <span className="ml-2 text-sm font-normal text-gray-500">({items.length} items)</span>
            </h3>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={shipping === 0 ? 'text-teal-600' : ''}>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-3">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
