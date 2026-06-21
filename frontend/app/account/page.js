'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { api } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import StarRating from '@/components/StarRating'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'orders', label: 'Orders' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'profile', label: 'Profile' },
]

const mockAddresses = [
  {
    id: 1,
    label: 'Home',
    name: 'Alex Johnson',
    address: '123 Maple Street, Apt 4B',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'United States',
    default: true,
  },
  {
    id: 2,
    label: 'Office',
    name: 'Alex Johnson',
    address: '456 Business Ave, Suite 200',
    city: 'New York',
    state: 'NY',
    zip: '10016',
    country: 'United States',
    default: false,
  },
]

const statusColors = {
  Delivered: 'bg-green-100 text-green-700',
  'In Transit': 'bg-blue-100 text-blue-700',
  Processing: 'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-700',
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full" /></div>}>
      <AccountContent />
    </Suspense>
  )
}

function AccountContent() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') || 'overview'
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [orders, setOrders] = useState([])
  const { items: wishlistItems, remove: removeFromWishlist } = useWishlist()
  const { addItem } = useCart()

  // Gate the account area behind authentication.
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?next=/account')
  }, [authLoading, user, router])

  // Load this user's real orders from the backend.
  useEffect(() => {
    if (!user) return
    let active = true
    api
      .myOrders()
      .then((data) => {
        if (active) setOrders(data)
      })
      .catch(() => {
        if (active) setOrders([])
      })
    return () => {
      active = false
    }
  }, [user])

  const [profile, setProfile] = useState({
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 123-4567',
    birthday: '1990-06-15',
  })
  const [profileSaved, setProfileSaved] = useState(false)

  // Hydrate the profile form from the logged-in user.
  useEffect(() => {
    if (user) {
      setProfile((p) => ({
        ...p,
        firstName: user.username || p.firstName,
        email: user.email || p.email,
        phone: user.phone_number || p.phone,
      }))
    }
  }, [user])

  function handleSignOut() {
    logout()
    router.replace('/login')
  }

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full" />
      </div>
    )
  }

  function saveProfile(e) {
    e.preventDefault()
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2500)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-2xl font-bold">{profile.firstName[0]}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile.firstName}!
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{profile.email} · Member since Jan 2024</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar tabs */}
        <nav className="lg:w-52 flex-shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto hide-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-left whitespace-nowrap transition-all duration-150 ${
                  activeTab === tab.id
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
              >
                {tab.label}
                {tab.id === 'wishlist' && wishlistItems.length > 0 && (
                  <span className={`ml-auto text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${activeTab === tab.id ? 'bg-white text-black' : 'bg-teal-100 text-teal-700'}`}>
                    {wishlistItems.length}
                  </span>
                )}
              </button>
            ))}
            <div className="hidden lg:block mt-4 pt-4 border-t border-gray-200">
              <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors w-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Orders', value: orders.length, icon: '📦' },
                  { label: 'Wishlist Items', value: wishlistItems.length, icon: '❤️' },
                  { label: 'Saved Addresses', value: mockAddresses.length, icon: '📍' },
                  { label: 'Loyalty Points', value: '1,240', icon: '⭐' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-50 border border-gray-100 p-4">
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">Recent Orders</h2>
                  <button onClick={() => setActiveTab('orders')} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 2).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 hover:border-gray-200 transition-colors">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{order.id}</p>
                        <p className="text-xs text-gray-500">{formatDate(order.date)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                        <span className="font-bold text-sm">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Order History</h2>
              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="text-gray-500">No orders yet.</p>
                  <Link href="/products" className="btn-primary inline-block mt-4">Start Shopping</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 overflow-hidden">
                      <div
                        className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-bold text-sm text-gray-900">{order.id}</p>
                            <p className="text-xs text-gray-500">{formatDate(order.date)}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{formatPrice(order.total)}</span>
                          <svg
                            className={`w-4 h-4 text-gray-500 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {expandedOrder === order.id && (
                        <div className="p-4 animate-slide-down">
                          <div className="space-y-3">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex gap-3 items-center">
                                <div className="relative w-12 h-12 bg-gray-100 flex-shrink-0 overflow-hidden">
                                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                                </div>
                                <p className="text-sm font-semibold">{formatPrice(item.price * item.qty)}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
                            <button className="text-xs font-semibold text-teal-600 hover:text-teal-700 border border-teal-200 px-3 py-1.5">
                              Track Order
                            </button>
                            {order.status === 'Delivered' && (
                              <button className="text-xs font-semibold text-gray-700 hover:text-black border border-gray-200 px-3 py-1.5">
                                Return Items
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addresses */}
          {activeTab === 'addresses' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Saved Addresses</h2>
                <button className="btn-outline text-xs px-4 py-2">+ Add Address</button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {mockAddresses.map((addr) => (
                  <div key={addr.id} className={`border p-4 relative ${addr.default ? 'border-black' : 'border-gray-200'}`}>
                    {addr.default && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold bg-black text-white px-2 py-0.5 uppercase">
                        Default
                      </span>
                    )}
                    <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-2">{addr.label}</p>
                    <p className="font-semibold text-sm text-gray-900">{addr.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{addr.address}</p>
                    <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                    <p className="text-sm text-gray-600">{addr.country}</p>
                    <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                      <button className="text-xs text-teal-600 hover:text-teal-700 font-medium">Edit</button>
                      {!addr.default && <button className="text-xs text-gray-500 hover:text-black font-medium">Set Default</button>}
                      {!addr.default && <button className="text-xs text-red-500 hover:text-red-600 font-medium">Delete</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="animate-fade-in">
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                My Wishlist
                {wishlistItems.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">({wishlistItems.length} items)</span>
                )}
              </h2>
              {wishlistItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">💝</div>
                  <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
                  <Link href="/products" className="btn-primary inline-block">Browse Products</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="group border border-gray-100 hover:border-gray-300 transition-all">
                      <Link href={`/products/${item.id}`} className="relative block aspect-square bg-gray-50 overflow-hidden">
                        <Image
                          src={item.image || `https://picsum.photos/seed/wish${item.id}/400/400`}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      <div className="p-3">
                        <Link href={`/products/${item.id}`} className="font-medium text-sm text-gray-900 line-clamp-2 hover:text-teal-600 transition-colors">
                          {item.name}
                        </Link>
                        <StarRating rating={item.rating} showCount={false} size="sm" />
                        <p className="font-bold text-sm text-gray-900 mt-1">{formatPrice(item.price)}</p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => addItem({ id: item.id, name: item.name, price: item.price, images: [item.image], stock: 99 })}
                            className="flex-1 btn-primary text-xs py-2"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="p-2 border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in max-w-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Profile Settings</h2>
              <form onSubmit={saveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Birthday</label>
                  <input
                    type="date"
                    value={profile.birthday}
                    onChange={(e) => setProfile((p) => ({ ...p, birthday: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" className="btn-primary px-8 py-3">
                    {profileSaved ? '✓ Saved!' : 'Save Changes'}
                  </button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-3">
                  <input type="password" placeholder="Current password" className="input-field" />
                  <input type="password" placeholder="New password" className="input-field" />
                  <input type="password" placeholder="Confirm new password" className="input-field" />
                  <button className="btn-outline px-6 py-2.5">Update Password</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
