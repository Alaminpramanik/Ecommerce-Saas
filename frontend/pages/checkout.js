import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FiCreditCard, FiTruck, FiCheck, FiLock } from "react-icons/fi";
import { FaPaypal, FaApplePay } from "react-icons/fa";
import Layout from "../components/Layout";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const paymentMethods = [
  { id: "card", label: "Credit / Debit Card", icon: FiCreditCard },
  { id: "paypal", label: "PayPal", icon: FaPaypal },
  { id: "applepay", label: "Apple Pay", icon: FaApplePay },
];

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart } = useStore();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [payment, setPayment] = useState("card");
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?next=/checkout");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api
      .getShipping()
      .then((d) =>
        setForm((f) => ({
          ...f,
          fullName: `${d.firstName} ${d.lastName}`.trim() || f.fullName,
          email: d.email || user?.email || f.email,
          phone: d.phone || user?.phone_number || f.phone,
          address: d.address || f.address,
          city: d.city || f.city,
          zip: d.zip || f.zip,
          country: d.country || f.country,
        }))
      )
      .catch(() => {});
  }, [isAuthenticated, user]);

  const shipping = cartSubtotal > 150 || cartSubtotal === 0 ? 0 : 14.99;
  const tax = cartSubtotal * 0.05;
  const total = cartSubtotal + shipping + tax;

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setPlacing(true);
    try {
      const order = await api.createOrder({
        full_name: form.fullName,
        phone: form.phone || "N/A",
        address: `${form.address}, ${form.city}, ${form.zip}, ${form.country}`,
        total_price: total.toFixed(2),
        items: cart.map((item) => ({
          product: Number(item.id),
          quantity: item.quantity,
          price: item.price,
        })),
      });
      setPlacedOrder(order);
      clearCart();
    } catch (err) {
      setError(err.message || "Could not place your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <Layout>
        <div className="mx-auto max-w-lg px-6 py-32 text-center text-cream/50">Loading…</div>
      </Layout>
    );
  }

  if (placedOrder) {
    return (
      <Layout>
        <Head>
          <title>Order Confirmed — Fulhar</title>
        </Head>
        <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-32 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-gradient text-ink-950 shadow-gold animate-fadeIn">
            <FiCheck size={36} />
          </div>
          <h1 className="mt-8 font-display text-3xl font-bold text-cream">Order Confirmed!</h1>
          <p className="mt-3 text-cream/55">
            Thank you for your purchase — order <span className="text-gold-300">#{placedOrder.id}</span> has
            been placed and will ship shortly.
          </p>
          <button onClick={() => router.push("/account")} className="btn-gold mt-8">
            View My Orders
          </button>
        </div>
      </Layout>
    );
  }

  if (cart.length === 0) {
    return (
      <Layout>
        <Head>
          <title>Checkout — Fulhar</title>
        </Head>
        <div className="mx-auto max-w-lg px-6 py-32 text-center">
          <p className="font-display text-2xl font-bold text-cream">Your cart is empty</p>
          <p className="mt-2 text-cream/50">Add items to your cart before checking out.</p>
          <button onClick={() => router.push("/products")} className="btn-gold mt-6">
            Shop Products
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Checkout — Fulhar</title>
      </Head>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="reveal in-view">
          <span className="section-label">Checkout</span>
          <h1 className="mt-4 font-display text-3xl font-bold text-cream sm:text-4xl">
            Secure <span className="gold-text">Checkout</span>
          </h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <div className="reveal in-view card-surface p-6">
              <div className="flex items-center gap-2">
                <FiTruck className="text-gold-300" />
                <h2 className="font-display text-lg font-bold text-cream">Shipping Information</h2>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  required
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50 sm:col-span-2"
                />
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
                />
                <input
                  required
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
                />
                <input
                  required
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Street Address"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50 sm:col-span-2"
                />
                <input
                  required
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
                />
                <input
                  required
                  name="zip"
                  value={form.zip}
                  onChange={handleChange}
                  placeholder="ZIP / Postal Code"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
                />
                <input
                  required
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="Country"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50 sm:col-span-2"
                />
              </div>
            </div>

            <div className="reveal in-view card-surface p-6">
              <div className="flex items-center gap-2">
                <FiCreditCard className="text-gold-300" />
                <h2 className="font-display text-lg font-bold text-cream">Payment Method</h2>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {paymentMethods.map((method) => (
                  <button
                    type="button"
                    key={method.id}
                    onClick={() => setPayment(method.id)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border px-4 py-5 text-sm font-medium transition-colors ${
                      payment === method.id
                        ? "border-gold-400 bg-gold-500/10 text-gold-300"
                        : "border-white/10 text-cream/60 hover:border-white/25"
                    }`}
                  >
                    <method.icon size={20} />
                    {method.label}
                  </button>
                ))}
              </div>

              {payment === "card" && (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    placeholder="Card Number"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50 sm:col-span-2"
                  />
                  <input
                    placeholder="MM / YY"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
                  />
                  <input
                    placeholder="CVC"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
                  />
                </div>
              )}

              <p className="mt-5 flex items-center gap-2 text-xs text-cream/40">
                <FiLock /> Your payment information is encrypted and secure.
              </p>
            </div>
          </div>

          <div className="reveal in-view card-surface h-fit p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-lg font-bold text-cream">Order Summary</h2>

            <div className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-700">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-gradient text-[10px] font-bold text-ink-950">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-cream">{item.name}</p>
                    <p className="text-xs text-cream/45">${item.price} each</p>
                  </div>
                  <p className="text-sm font-semibold text-gold-300">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between text-cream/60">
                <span>Subtotal</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-cream/60">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-cream/60">
                <span>Tax (5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 font-display text-base font-bold text-cream">
                <span>Total</span>
                <span className="text-gold-300">${total.toFixed(2)}</span>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <button type="submit" disabled={placing} className="btn-gold mt-6 w-full disabled:opacity-60">
              {placing ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </form>
      </section>
    </Layout>
  );
}
