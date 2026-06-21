'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/products?category=electronics', label: 'Electronics' },
  { href: '/products?category=clothing', label: 'Clothing' },
  { href: '/products?badge=Sale', label: 'Deals' },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { totalItems } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-black text-white text-center py-2 px-4 text-xs font-medium tracking-wider">
        Free shipping on orders over $75 &nbsp;·&nbsp; Use code{' '}
        <span className="text-teal-400 font-bold">LUXE15</span> for 15% off
      </div>

      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
          scrolled ? 'shadow-md' : 'border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-700 hover:text-black transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <span className="bg-black text-white px-2 py-0.5 text-lg">LUXE</span>
              <span className="hidden sm:inline text-gray-400 text-xs font-normal tracking-widest uppercase">
                Commerce
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 relative group ${
                    pathname === link.href ? 'text-black' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {link.label}
                  {link.label === 'Deals' && (
                    <span className="ml-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-none">
                      HOT
                    </span>
                  )}
                  <span
                    className={`absolute bottom-0 left-4 right-4 h-0.5 bg-black transition-transform duration-200 origin-left ${
                      pathname === link.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 text-gray-700 hover:text-black transition-colors rounded-none"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Wishlist */}
              <Link
                href="/account?tab=wishlist"
                className="relative p-2.5 text-gray-700 hover:text-black transition-colors hidden sm:flex"
                aria-label="Wishlist"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-teal-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Merchant dashboard */}
              {(user?.is_merchant || user?.is_superuser) && (
                <Link
                  href="/merchant"
                  className="hidden lg:flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                >
                  Dashboard
                </Link>
              )}

              {/* Account */}
              <Link
                href={user ? '/account' : '/login'}
                className="p-2.5 text-gray-700 hover:text-black transition-colors hidden sm:flex items-center gap-1.5"
                aria-label={user ? 'Account' : 'Sign in'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden lg:inline text-sm font-medium max-w-[7rem] truncate">
                  {user ? user.username : 'Sign In'}
                </span>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2.5 text-gray-700 hover:text-black transition-colors"
                aria-label={`Cart (${totalItems} items)`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-scale-in">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="border-t border-gray-100 py-3 animate-slide-down">
              <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, categories..."
                  className="flex-1 border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                />
                <button type="submit" className="bg-black text-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors">
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-2.5 text-gray-500 hover:text-black transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="absolute left-0 top-0 bottom-0 w-80 bg-white animate-slide-in-left flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/" className="font-bold text-xl">
                <span className="bg-black text-white px-2 py-0.5">LUXE</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-gray-700 hover:text-black"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-6 py-3.5 text-base font-medium border-b border-gray-50 transition-colors ${
                    pathname === link.href ? 'text-black bg-gray-50' : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  {link.label}
                  {link.label === 'Deals' && (
                    <span className="ml-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5">HOT</span>
                  )}
                </Link>
              ))}
            </div>
            <div className="p-4 border-t space-y-3">
              <Link href="/account" className="flex items-center gap-3 py-2 text-sm text-gray-700 hover:text-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Account
              </Link>
              <Link href="/account?tab=wishlist" className="flex items-center gap-3 py-2 text-sm text-gray-700 hover:text-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
