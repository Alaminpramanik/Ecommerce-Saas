'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { products as mockProducts, categories as mockCategories } from '@/lib/products'
import { sortProducts, SORT_OPTIONS, formatPrice } from '@/lib/utils'
import { api } from '@/lib/api'
import ProductCard from '@/components/ProductCard'

const PRICE_RANGES = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $250', min: 100, max: 250 },
  { label: '$250 - $500', min: 250, max: 500 },
  { label: 'Over $500', min: 500, max: Infinity },
]

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full" /></div>}>
      <ProductsContent />
    </Suspense>
  )
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [sortBy, setSortBy] = useState('featured')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedPriceRange, setSelectedPriceRange] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const ITEMS_PER_PAGE = 12

  // Fetch products from the backend; fall back to bundled demo data if it's empty/unreachable.
  useEffect(() => {
    let active = true
    api
      .products()
      .then((data) => {
        if (active) setAllProducts(data.length ? data : mockProducts)
      })
      .catch(() => {
        if (active) setAllProducts(mockProducts)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Derive the category filter list (with counts) from the loaded products.
  const categories = useMemo(() => {
    const map = new Map()
    for (const p of allProducts) {
      const entry = map.get(p.category) || { id: p.category, name: p.categoryLabel || p.category, count: 0 }
      entry.count += 1
      map.set(p.category, entry)
    }
    return map.size ? Array.from(map.values()) : mockCategories
  }, [allProducts])

  const queryCategory = searchParams.get('category')
  const querySearch = searchParams.get('q')
  const queryBadge = searchParams.get('badge')

  useEffect(() => {
    if (queryCategory) setSelectedCategories([queryCategory])
    else setSelectedCategories([])
  }, [queryCategory])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategories, selectedPriceRange, sortBy, querySearch])

  const filtered = useMemo(() => {
    let list = [...allProducts]

    if (querySearch) {
      const q = querySearch.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)) ||
          p.category.includes(q)
      )
    }

    if (queryBadge) {
      list = list.filter((p) => p.badge === queryBadge)
    }

    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category))
    }

    if (selectedPriceRange !== null) {
      const range = PRICE_RANGES[selectedPriceRange]
      list = list.filter((p) => p.price >= range.min && p.price < range.max)
    }

    return sortProducts(list, sortBy)
  }, [allProducts, querySearch, queryBadge, selectedCategories, selectedPriceRange, sortBy])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  function toggleCategory(id) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
    router.push('/products', { scroll: false })
  }

  function clearFilters() {
    setSelectedCategories([])
    setSelectedPriceRange(null)
    setSortBy('featured')
    router.push('/products', { scroll: false })
  }

  const hasFilters = selectedCategories.length > 0 || selectedPriceRange !== null || querySearch || queryBadge

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {querySearch ? `Results for "${querySearch}"` : queryBadge ? `${queryBadge} Products` : 'All Products'}
        </h1>
        <p className="text-gray-500 mt-1">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters - desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Filters</h2>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                  Clear all
                </button>
              )}
            </div>

            {/* Category filter */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Category</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="w-4 h-4 accent-teal-600"
                    />
                    <span className={`text-sm transition-colors ${selectedCategories.includes(cat.id) ? 'text-teal-600 font-medium' : 'text-gray-700 group-hover:text-black'}`}>
                      {cat.name}
                    </span>
                    <span className="ml-auto text-xs text-gray-400">{cat.count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price filter */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Price</h3>
              <div className="space-y-2">
                {PRICE_RANGES.map((range, i) => (
                  <label key={range.label} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPriceRange === i}
                      onChange={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)}
                      className="w-4 h-4 accent-teal-600"
                    />
                    <span className={`text-sm transition-colors ${selectedPriceRange === i ? 'text-teal-600 font-medium' : 'text-gray-700 group-hover:text-black'}`}>
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black border border-gray-300 px-4 py-2 hover:border-black transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Filters
              {hasFilters && (
                <span className="bg-teal-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  !
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <label className="text-sm text-gray-600 hidden sm:block">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 text-sm px-3 py-2 focus:outline-none focus:border-black bg-white"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {querySearch && (
                <span className="flex items-center gap-1.5 bg-gray-100 text-sm px-3 py-1">
                  Search: &ldquo;{querySearch}&rdquo;
                  <button onClick={() => router.push('/products')} className="text-gray-500 hover:text-black">×</button>
                </span>
              )}
              {selectedCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCategory(c)}
                  className="flex items-center gap-1.5 bg-teal-50 text-teal-700 text-sm px-3 py-1 hover:bg-teal-100"
                >
                  {categories.find((cat) => cat.id === c)?.name}
                  <span>×</span>
                </button>
              ))}
              {selectedPriceRange !== null && (
                <button
                  onClick={() => setSelectedPriceRange(null)}
                  className="flex items-center gap-1.5 bg-teal-50 text-teal-700 text-sm px-3 py-1 hover:bg-teal-100"
                >
                  {PRICE_RANGES[selectedPriceRange].label}
                  <span>×</span>
                </button>
              )}
            </div>
          )}

          {/* Product grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {paginated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 text-sm font-medium disabled:opacity-40 hover:border-black transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-black text-white'
                      : 'border border-gray-300 text-gray-700 hover:border-black'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 text-sm font-medium disabled:opacity-40 hover:border-black transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filters drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white animate-slide-in-right overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-lg">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} className="p-2 text-gray-500 hover:text-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Category</h3>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="w-4 h-4 accent-teal-600"
                      />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Price</h3>
                <div className="space-y-3">
                  {PRICE_RANGES.map((range, i) => (
                    <label key={range.label} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="mobile-price"
                        checked={selectedPriceRange === i}
                        onChange={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)}
                        className="w-4 h-4 accent-teal-600"
                      />
                      <span className="text-sm text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button onClick={clearFilters} className="flex-1 btn-outline text-sm py-2.5">
                  Clear
                </button>
                <button onClick={() => setFiltersOpen(false)} className="flex-1 btn-primary text-sm py-2.5">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
