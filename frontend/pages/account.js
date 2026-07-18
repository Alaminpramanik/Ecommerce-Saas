import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FiUser, FiPackage, FiMapPin, FiSettings } from "react-icons/fi";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { formatDate } from "../lib/utils";

const TABS = [
  { id: "overview", label: "Overview", icon: FiUser },
  { id: "orders", label: "Orders", icon: FiPackage },
  { id: "addresses", label: "Address", icon: FiMapPin },
  { id: "profile", label: "Profile", icon: FiSettings },
];

const STATUS_STYLES = {
  Delivered: "text-green-400 bg-green-500/10",
  "In Transit": "text-blue-300 bg-blue-500/10",
  Processing: "text-gold-300 bg-gold-500/10",
  Cancelled: "text-red-400 bg-red-500/10",
};

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
  const [tab, setTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [shipping, setShipping] = useState(null);
  const [shippingSaving, setShippingSaving] = useState(false);
  const [shippingSaved, setShippingSaved] = useState(false);
  const [profileForm, setProfileForm] = useState({ email: "", phone_number: "", address: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login?next=/account");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api
      .myOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
    api.getShipping().then(setShipping).catch(() => setShipping(null));
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        email: user.email || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
      });
    }
  }, [user]);

  if (authLoading || !isAuthenticated || !user) {
    return (
      <Layout>
        <div className="mx-auto max-w-lg px-6 py-32 text-center text-cream/50">Loading…</div>
      </Layout>
    );
  }

  const handleShippingChange = (e) => setShipping((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSaveShipping = async (e) => {
    e.preventDefault();
    setShippingSaving(true);
    try {
      await api.saveShipping(shipping);
      setShippingSaved(true);
      setTimeout(() => setShippingSaved(false), 3000);
    } finally {
      setShippingSaving(false);
    }
  };

  const handleProfileChange = (e) => setProfileForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateProfile(profileForm);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } finally {
      setProfileSaving(false);
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <Layout>
      <Head>
        <title>My Account — Fulhar</title>
      </Head>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="reveal in-view">
          <span className="section-label">My Account</span>
          <h1 className="mt-4 font-display text-3xl font-bold text-cream sm:text-4xl">
            Welcome, <span className="gold-text">{user.username}</span>
          </h1>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  tab === t.id ? "bg-gold-500/10 text-gold-300" : "text-cream/60 hover:bg-white/5"
                }`}
              >
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </aside>

          <div>
            {tab === "overview" && (
              <div className="reveal in-view grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="card-surface p-6">
                  <p className="text-xs uppercase tracking-widest text-cream/40">Total Orders</p>
                  <p className="mt-2 font-display text-3xl font-bold text-cream">{orders.length}</p>
                </div>
                <div className="card-surface p-6">
                  <p className="text-xs uppercase tracking-widest text-cream/40">Total Spent</p>
                  <p className="mt-2 font-display text-3xl font-bold text-gold-300">${totalSpent.toFixed(2)}</p>
                </div>
                <div className="card-surface p-6">
                  <p className="text-xs uppercase tracking-widest text-cream/40">Account Type</p>
                  <p className="mt-2 font-display text-lg font-bold text-cream">
                    {user.is_superuser ? "Administrator" : user.is_merchant ? "Merchant" : "Customer"}
                  </p>
                </div>
                <div className="card-surface col-span-full p-6">
                  <h3 className="font-display text-lg font-bold text-cream">Recent Orders</h3>
                  {orders.length === 0 ? (
                    <p className="mt-3 text-sm text-cream/50">You haven&apos;t placed any orders yet.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {orders.slice(0, 3).map((o) => (
                        <div key={o.id} className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-cream">{o.id}</p>
                            <p className="text-xs text-cream/45">{formatDate(o.date)}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[o.status] || "text-cream/60 bg-white/5"}`}>
                            {o.status}
                          </span>
                          <p className="font-semibold text-gold-300">${o.total.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "orders" && (
              <div className="reveal in-view card-surface p-6">
                <h3 className="font-display text-lg font-bold text-cream">Order History</h3>
                {ordersLoading ? (
                  <p className="mt-4 text-sm text-cream/50">Loading orders…</p>
                ) : orders.length === 0 ? (
                  <p className="mt-4 text-sm text-cream/50">You haven&apos;t placed any orders yet.</p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {orders.map((o) => (
                      <details key={o.id} className="rounded-xl border border-white/10 p-4">
                        <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-cream">{o.id}</span>
                          <span className="text-xs text-cream/45">{formatDate(o.date)}</span>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[o.status] || "text-cream/60 bg-white/5"}`}>
                            {o.status}
                          </span>
                          <span className="font-semibold text-gold-300">${o.total.toFixed(2)}</span>
                        </summary>
                        <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                          {o.items.map((it, i) => (
                            <div key={i} className="flex justify-between text-sm text-cream/70">
                              <span>
                                {it.name} × {it.qty}
                              </span>
                              <span>${(it.price * it.qty).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "addresses" && shipping && (
              <form onSubmit={handleSaveShipping} className="reveal in-view card-surface space-y-4 p-6">
                <h3 className="font-display text-lg font-bold text-cream">Shipping Address</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    name="firstName"
                    value={shipping.firstName}
                    onChange={handleShippingChange}
                    placeholder="First Name"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
                  />
                  <input
                    name="lastName"
                    value={shipping.lastName}
                    onChange={handleShippingChange}
                    placeholder="Last Name"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
                  />
                  <input
                    name="phone"
                    value={shipping.phone}
                    onChange={handleShippingChange}
                    placeholder="Phone"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50 sm:col-span-2"
                  />
                  <input
                    name="address"
                    value={shipping.address}
                    onChange={handleShippingChange}
                    placeholder="Street Address"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50 sm:col-span-2"
                  />
                  <input
                    name="apartment"
                    value={shipping.apartment}
                    onChange={handleShippingChange}
                    placeholder="Apartment, suite, etc. (optional)"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50 sm:col-span-2"
                  />
                  <input
                    name="city"
                    value={shipping.city}
                    onChange={handleShippingChange}
                    placeholder="City"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
                  />
                  <input
                    name="state"
                    value={shipping.state}
                    onChange={handleShippingChange}
                    placeholder="State"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
                  />
                  <input
                    name="zip"
                    value={shipping.zip}
                    onChange={handleShippingChange}
                    placeholder="ZIP / Postal Code"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
                  />
                  <input
                    name="country"
                    value={shipping.country}
                    onChange={handleShippingChange}
                    placeholder="Country"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
                  />
                </div>
                {shippingSaved && <p className="text-sm text-gold-300">Address saved!</p>}
                <button type="submit" disabled={shippingSaving} className="btn-gold disabled:opacity-60">
                  {shippingSaving ? "Saving..." : "Save Address"}
                </button>
              </form>
            )}

            {tab === "profile" && (
              <form onSubmit={handleSaveProfile} className="reveal in-view card-surface space-y-4 p-6">
                <h3 className="font-display text-lg font-bold text-cream">Profile Settings</h3>
                <div>
                  <label className="text-xs uppercase tracking-widest text-cream/40">Username</label>
                  <input
                    disabled
                    value={user.username}
                    className="mt-2 w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream/50"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-cream/40">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream outline-none focus:border-gold-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-cream/40">Phone Number</label>
                  <input
                    name="phone_number"
                    value={profileForm.phone_number}
                    onChange={handleProfileChange}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream outline-none focus:border-gold-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-cream/40">Address</label>
                  <textarea
                    name="address"
                    value={profileForm.address}
                    onChange={handleProfileChange}
                    rows={3}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream outline-none focus:border-gold-500/50"
                  />
                </div>
                {profileSaved && <p className="text-sm text-gold-300">Profile updated!</p>}
                <button type="submit" disabled={profileSaving} className="btn-gold disabled:opacity-60">
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
