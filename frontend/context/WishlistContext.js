'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wishlist')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items))
  }, [items])

  const toggle = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === product.id)
      if (exists) return prev.filter((i) => i.id !== product.id)
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images?.[0] || '',
          category: product.category,
          rating: product.rating,
        },
      ]
    })
  }, [])

  const isWishlisted = useCallback((id) => items.some((i) => i.id === id), [items])

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  return (
    <WishlistContext.Provider value={{ items, toggle, isWishlisted, remove, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
