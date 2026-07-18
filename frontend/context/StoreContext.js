import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const StoreContext = createContext(null);

const CART_KEY = "fulhar_cart_v1";
const WISHLIST_KEY = "fulhar_wishlist_v1";

function readStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(readStorage(CART_KEY, []));
    setWishlist(readStorage(WISHLIST_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = (product, quantity = 1, variant = null) => {
    setCart((prev) => {
      const key = `${product.id}-${variant || "default"}`;
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images ? product.images[0] : product.image,
          variant,
          quantity,
        },
      ];
    });
    toast.success(`${product.name} added to cart`, {
      style: {
        background: "#121216",
        color: "#f8f6f1",
        border: "1px solid rgba(212,175,55,0.35)",
      },
      iconTheme: { primary: "#d4af37", secondary: "#0a0a0c" },
    });
  };

  const removeFromCart = (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const updateQuantity = (key, quantity) => {
    setCart((prev) =>
      prev
        .map((item) => (item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        toast(`Removed from wishlist`, { icon: "💔" });
        return prev.filter((item) => item.id !== product.id);
      }
      toast.success(`Added to wishlist`, {
        icon: "🤍",
        style: {
          background: "#121216",
          color: "#f8f6f1",
          border: "1px solid rgba(212,175,55,0.35)",
        },
      });
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images ? product.images[0] : product.image,
        },
      ];
    });
  };

  const isWishlisted = (id) => wishlist.some((item) => item.id === id);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [cart]
  );

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    wishlist,
    toggleWishlist,
    isWishlisted,
    wishlistCount: wishlist.length,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
