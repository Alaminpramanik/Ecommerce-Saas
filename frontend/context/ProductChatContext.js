import { createContext, useContext, useState } from "react";

// Lets a product page publish what the customer is currently viewing so the
// chat widget (mounted in Layout) can answer about that exact product.
const ProductChatContext = createContext(null);

export function ProductChatProvider({ children }) {
  const [currentProduct, setCurrentProduct] = useState(null);
  return (
    <ProductChatContext.Provider value={{ currentProduct, setCurrentProduct }}>
      {children}
    </ProductChatContext.Provider>
  );
}

export function useProductChat() {
  return useContext(ProductChatContext) || { currentProduct: null, setCurrentProduct: () => {} };
}
