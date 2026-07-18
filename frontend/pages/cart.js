import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiMinus, FiPlus, FiTrash2, FiArrowRight, FiShoppingBag, FiTag } from "react-icons/fi";
import Layout from "../components/Layout";
import { useStore } from "../context/StoreContext";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartSubtotal } = useStore();
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const shipping = cart.length === 0 ? 0 : cartSubtotal > 150 ? 0 : 14.99;
  const discount = promoApplied ? cartSubtotal * 0.1 : 0;
  const total = cartSubtotal + shipping - discount;

  const applyPromo = (e) => {
    e.preventDefault();
    if (promo.trim().toUpperCase() === "FULHAR10") setPromoApplied(true);
  };

  return (
    <Layout>
      <Head>
        <title>Your Cart — Fulhar</title>
      </Head>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="reveal in-view">
          <span className="section-label">Cart</span>
          <h1 className="mt-4 font-display text-3xl font-bold text-cream sm:text-4xl">
            Your <span className="gold-text">Shopping Bag</span>
          </h1>
          <p className="mt-2 text-sm text-cream/50">
            {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="reveal in-view card-surface mt-12 flex flex-col items-center gap-4 py-24 text-center">
            <FiShoppingBag size={40} className="text-gold-400/60" />
            <p className="font-display text-xl font-semibold text-cream">Your cart is empty</p>
            <p className="max-w-sm text-sm text-cream/50">
              Looks like you haven&apos;t added anything yet. Explore our collection and find
              something you love.
            </p>
            <Link href="/products" className="btn-gold mt-2">
              Start Shopping <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {cart.map((item, i) => (
                <div
                  key={item.key}
                  className="reveal in-view card-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <Link
                    href={`/products/${item.id}`}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-700"
                  >
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </Link>

                  <div className="flex-1">
                    <Link href={`/products/${item.id}`} className="font-display font-semibold text-cream hover:text-gold-300">
                      {item.name}
                    </Link>
                    {item.variant && (
                      <p className="mt-1 text-xs text-cream/45">Size: {item.variant}</p>
                    )}
                    <p className="mt-1 font-semibold text-gold-300">${item.price}</p>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-3">
                    <div className="flex items-center rounded-xl border border-white/10">
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center text-cream/70 hover:text-gold-300"
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-cream">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center text-cream/70 hover:text-gold-300"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.key)}
                      className="flex items-center gap-1.5 text-xs font-medium text-cream/45 hover:text-red-400"
                    >
                      <FiTrash2 size={14} /> Remove
                    </button>
                  </div>

                  <p className="hidden w-20 text-right font-display font-bold text-cream sm:block">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="reveal in-view card-surface h-fit p-6 lg:sticky lg:top-28">
              <h2 className="font-display text-lg font-bold text-cream">Order Summary</h2>

              <form onSubmit={applyPromo} className="mt-5 flex gap-2">
                <div className="relative flex-1">
                  <FiTag className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/40" />
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="Promo code (try FULHAR10)"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
                  />
                </div>
                <button type="submit" className="rounded-xl border border-gold-500/40 px-4 text-sm font-semibold text-gold-300 hover:bg-gold-500/10">
                  Apply
                </button>
              </form>
              {promoApplied && (
                <p className="mt-2 text-xs font-medium text-gold-300">10% discount applied!</p>
              )}

              <div className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm">
                <div className="flex justify-between text-cream/60">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-cream/60">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-gold-300">
                    <span>Discount (10%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/10 pt-3 font-display text-base font-bold text-cream">
                  <span>Total</span>
                  <span className="text-gold-300">${total.toFixed(2)}</span>
                </div>
              </div>

              <Link href="/checkout" className="btn-gold mt-6 w-full">
                Proceed to Checkout <FiArrowRight />
              </Link>
              <Link
                href="/products"
                className="mt-3 block text-center text-sm text-cream/50 hover:text-gold-300"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
