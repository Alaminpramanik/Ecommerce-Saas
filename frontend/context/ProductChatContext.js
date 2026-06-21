'use client'

import { createContext, useContext, useState } from 'react'

// Lets a product page publish what the customer is currently viewing so the
// chat widget (mounted in the layout) can answer about that exact product —
// works for both real (DB) and demo products.
const ProductChatContext = createContext(null)

export function ProductChatProvider({ children }) {
  const [currentProduct, setCurrentProduct] = useState(null)
  return (
    <ProductChatContext.Provider value={{ currentProduct, setCurrentProduct }}>
      {children}
    </ProductChatContext.Provider>
  )
}

export function useProductChat() {
  // Safe default so components used outside the provider don't crash.
  return useContext(ProductChatContext) || { currentProduct: null, setCurrentProduct: () => {} }
}
