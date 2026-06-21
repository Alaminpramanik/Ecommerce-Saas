'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-lg text-center animate-scale-in">
        {/* Giant 404 */}
        <div className="relative mb-8">
          <p className="text-[10rem] font-black text-gray-100 leading-none select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl">🔍</div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <button
            onClick={() => router.back()}
            className="btn-outline px-6 py-3 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>
          <Link href="/" className="btn-primary px-6 py-3 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Quick links */}
        <div className="border-t border-gray-100 pt-8">
          <p className="text-sm font-semibold text-gray-700 mb-4">Popular destinations</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { href: '/products', label: 'All Products' },
              { href: '/products?category=electronics', label: 'Electronics' },
              { href: '/products?category=clothing', label: 'Clothing' },
              { href: '/products?badge=Sale', label: 'Sale' },
              { href: '/cart', label: 'Cart' },
              { href: '/account', label: 'Account' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 bg-gray-50 border border-gray-200 text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
