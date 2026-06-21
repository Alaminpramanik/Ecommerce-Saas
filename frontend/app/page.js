'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { products, categories, getFeaturedProducts } from '@/lib/products'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import ProductCard from '@/components/ProductCard'
import Newsletter from '@/components/Newsletter'
import StarRating from '@/components/StarRating'

const heroSlides = [
  {
    id: 1,
    tag: 'New Collection',
    title: 'Elevate Your\nEveryday',
    subtitle: 'Curated products for the modern lifestyle. Quality you can feel.',
    cta: 'Shop Now',
    ctaHref: '/products',
    cta2: 'View Deals',
    cta2Href: '/products?badge=Sale',
    bg: 'from-gray-900 via-gray-800 to-black',
    accentBg: 'bg-teal-600',
  },
  {
    id: 2,
    tag: 'Limited Time',
    title: 'Up to 40%\nOff Sale',
    subtitle: 'Flash deals on top electronics, fashion, and home essentials.',
    cta: 'Shop Sale',
    ctaHref: '/products?badge=Sale',
    cta2: 'All Products',
    cta2Href: '/products',
    bg: 'from-teal-900 via-teal-800 to-black',
    accentBg: 'bg-orange-500',
  },
]

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Verified Buyer',
    text: 'Amazing quality! The headphones I ordered exceeded my expectations. Fast shipping and beautifully packaged.',
    rating: 5,
    product: 'WH-1000XM5 Headphones',
  },
  {
    name: 'James K.',
    role: 'Verified Buyer',
    text: 'LUXE has become my go-to for everything. The curation is spot on — every product I\'ve ordered has been perfect.',
    rating: 5,
    product: 'Smart Watch Series X',
  },
  {
    name: 'Priya L.',
    role: 'Verified Buyer',
    text: 'The velvet chair is stunning in person. Customer service was incredibly helpful when I had questions about delivery.',
    rating: 5,
    product: 'Velvet Accent Chair',
  },
]

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0)
  const slide = heroSlides[activeSlide]
  const featured = getFeaturedProducts(8)
  const bestSellers = products.filter((p) => p.reviews > 1000).slice(0, 4)

  return (
    <div>
      {/* Hero */}
      <section className={`relative min-h-[85vh] bg-gradient-to-br ${slide.bg} flex items-center overflow-hidden`}>
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <span className={`inline-block ${slide.accentBg} text-white text-xs font-bold tracking-widest uppercase px-3 py-1.5 mb-6`}>
                {slide.tag}
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6 whitespace-pre-line">
                {slide.title}
              </h1>
              <p className="text-gray-300 text-lg mb-10 max-w-md leading-relaxed">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={slide.ctaHref}
                  className="bg-white text-black px-8 py-4 font-bold text-sm tracking-widest uppercase hover:bg-gray-100 transition-colors duration-200"
                >
                  {slide.cta}
                </Link>
                <Link
                  href={slide.cta2Href}
                  className="border-2 border-white/40 text-white px-8 py-4 font-bold text-sm tracking-widest uppercase hover:border-white transition-colors duration-200"
                >
                  {slide.cta2}
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
                {[
                  { num: '50K+', label: 'Happy Customers' },
                  { num: '2K+', label: 'Products' },
                  { num: '4.9', label: 'Avg Rating' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-white">{stat.num}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4 h-[480px]">
              {products.slice(0, 4).map((p, i) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className={`relative overflow-hidden group ${i === 0 ? 'row-span-2' : ''}`}
                >
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white text-xs font-semibold line-clamp-1">{p.name}</p>
                    <p className="text-teal-400 text-sm font-bold">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`h-1 transition-all duration-300 ${i === activeSlide ? 'w-8 bg-white' : 'w-4 bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      {/* Category grid */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Find exactly what you&apos;re looking for</p>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="group relative overflow-hidden aspect-square bg-gray-100"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500 brightness-75 group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-white">
                <span className="text-2xl mb-1">{cat.icon}</span>
                <p className="font-bold text-sm text-center">{cat.name}</p>
                <p className="text-[11px] text-white/70 mt-0.5">{cat.count} items</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="bg-orange-500 py-8 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">⚡</span>
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-widest">Flash Sale</p>
              <h3 className="text-white text-2xl font-bold">Up to 40% off selected items</h3>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-3 text-center">
              {[{ n: '03', l: 'HRS' }, { n: '47', l: 'MIN' }, { n: '22', l: 'SEC' }].map((t) => (
                <div key={t.l} className="bg-black/20 px-3 py-2 min-w-[50px]">
                  <p className="text-white text-xl font-bold">{t.n}</p>
                  <p className="text-white/70 text-[10px] font-medium">{t.l}</p>
                </div>
              ))}
            </div>
            <Link
              href="/products?badge=Sale"
              className="bg-white text-orange-600 px-6 py-3 font-bold text-sm tracking-wide hover:bg-orange-50 transition-colors whitespace-nowrap"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Handpicked by our curation team</p>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">Best Sellers</h2>
              <p className="section-subtitle">What everyone&apos;s buying right now</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((p, i) => (
              <Link key={p.id} href={`/products/${p.id}`} className="flex gap-4 bg-white p-4 group hover:shadow-md transition-shadow duration-200 border border-gray-100">
                <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 overflow-hidden">
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold text-gray-200">#{i + 1}</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{p.name}</h3>
                  <StarRating rating={p.rating} reviews={p.reviews} size="sm" />
                  <p className="font-bold text-gray-900 mt-1 text-sm">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Over 50,000 happy customers and counting</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <StarRating rating={t.rating} showCount={false} size="sm" />
              <p className="text-gray-700 mt-4 mb-6 leading-relaxed text-sm">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3 border-t border-gray-50 pt-4">
                <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center rounded-full flex-shrink-0">
                  <span className="text-white text-sm font-bold">{t.name[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role} · {t.product}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Newsletter />
    </div>
  )
}
