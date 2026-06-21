export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function calculateDiscount(original, current) {
  if (!original) return 0
  return Math.round(((original - current) / original) * 100)
}

export function truncate(str, length = 100) {
  if (!str || str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getStarArray(rating) {
  return Array.from({ length: 5 }, (_, i) => {
    if (i + 1 <= Math.floor(rating)) return 'full'
    if (i < rating && i + 1 > Math.floor(rating)) return 'half'
    return 'empty'
  })
}

export function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function debounce(fn, delay) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

export function formatDate(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString))
}

export const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Best Rating', value: 'rating' },
  { label: 'Most Reviewed', value: 'reviews' },
  { label: 'Newest', value: 'newest' },
]

export function sortProducts(products, sortBy) {
  const list = [...products]
  switch (sortBy) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price)
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating)
    case 'reviews':
      return list.sort((a, b) => b.reviews - a.reviews)
    default:
      return list
  }
}
