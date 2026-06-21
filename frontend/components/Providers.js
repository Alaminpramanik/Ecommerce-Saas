'use client'

import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { ProductChatProvider } from '@/context/ProductChatContext'

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ProductChatProvider>{children}</ProductChatProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}
