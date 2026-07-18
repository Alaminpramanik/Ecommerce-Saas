import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  FiGrid,
  FiBox,
  FiPackage,
  FiUsers,
  FiSettings,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUpload,
  FiX,
  FiTrendingUp,
} from "react-icons/fi";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductsContext";
import { api } from "../lib/api";
import { formatDate } from "../lib/utils";

const ROLE_LABELS = {
  manager: "Manager",
  product_editor: "Product Editor",
  order_handler: "Order Handler",
  viewer: "Viewer",
};

const STATUS_STYLES = {
  Delivered: "text-green-400 bg-green-500/10",
  "In Transit": "text-blue-300 bg-blue-500/10",
  Processing: "text-gold-300 bg-gold-500/10",
  Cancelled: "text-red-400 bg-red-500/10",
};

export default function MerchantDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isStaff, loading: authLoading } = useAuth();
  const { categories, refresh: refreshProducts } = useProducts();

  const [employeeProfile, setEmployeeProfile] = useState(undefined); // undefined = loading, null = none
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?next=/merchant");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || isStaff) {
      setEmployeeProfile(null);
      return;
    }
    api
      .myEmployeeProfile()
      .then(setEmployeeProfile)
      .catch(() => setEmployeeProfile(null));
  }, [isAuthenticated, isStaff]);

  const role = isStaff ? "merchant" : employeeProfile?.role || null;
  const hasAccess = !!role;

  const perms = {
    products: ["merchant", "manager", "product_editor"].includes(role),
    orders: ["merchant", "manager", "order_handler", "viewer"].includes(role),
    analytics: ["merchant", "manager", "viewer"].includes(role),
    employees: ["merchant", "manager"].includes(role),
    store: role === "merchant",
  };

  const TABS = [
    { id: "overview", label: "Overview", icon: FiGrid, show: perms.analytics },
    { id: "products", label: "Products", icon: FiBox, show: perms.products },
    { id: "orders", label: "Orders", icon: FiPackage, show: perms.orders },
    { id: "employees", label: "Employees", icon: FiUsers, show: perms.employees },
    { id: "store", label: "Store Settings", icon: FiSettings, show: perms.store },
  ].filter((t) => t.show);

  useEffect(() => {
    if (TABS.length && !TABS.find((t) => t.id === tab)) setTab(TABS[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  if (authLoading || !isAuthenticated || employeeProfile === undefined) {
    return (
      <Layout>
        <div className="mx-auto max-w-lg px-6 py-32 text-center text-cream/50">Loading…</div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return (
      <Layout>
        <div className="mx-auto max-w-lg px-6 py-32 text-center">
          <p className="font-display text-2xl font-bold text-cream">Merchants &amp; Staff Only</p>
          <p className="mt-3 text-cream/55">
            This dashboard is only available to store owners and their team members.
          </p>
          <Link href="/" className="btn-gold mt-8 inline-flex">
            Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Merchant Dashboard — Fulhar</title>
      </Head>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="reveal in-view flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="section-label">Dashboard</span>
            <h1 className="mt-4 font-display text-3xl font-bold text-cream sm:text-4xl">
              Merchant <span className="gold-text">Dashboard</span>
            </h1>
            <p className="mt-2 text-sm text-cream/50">
              Signed in as {user.username} — {ROLE_LABELS[role] || "Store Owner"}
            </p>
          </div>
        </div>

        <div className="mt-10 flex gap-2 overflow-x-auto border-b border-white/10 pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 rounded-t-xl px-4 py-3 text-sm font-semibold transition-colors ${
                tab === t.id ? "border-b-2 border-gold-400 text-gold-300" : "text-cream/50 hover:text-cream/80"
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "overview" && perms.analytics && <OverviewPanel />}
          {tab === "products" && perms.products && (
            <ProductsPanel categories={categories} canEdit={perms.products} onChange={refreshProducts} />
          )}
          {tab === "orders" && perms.orders && <OrdersPanel />}
          {tab === "employees" && perms.employees && <EmployeesPanel />}
          {tab === "store" && perms.store && <StorePanel />}
        </div>
      </section>
    </Layout>
  );
}

// ---------------------------------------------------------------------------
function OverviewPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .merchantDashboard()
      .then(setData)
      .catch((err) => setError(err.message || "Could not load analytics."));
  }, []);

  if (error) return <p className="card-surface p-6 text-sm text-red-400">{error}</p>;
  if (!data) return <p className="text-sm text-cream/50">Loading analytics…</p>;

  const cards = [
    { label: "Products", value: data.summary.product_count },
    { label: "Total Stock", value: data.summary.total_stock },
    { label: "Units Sold", value: data.summary.total_units_sold },
    { label: "Revenue", value: `$${Number(data.summary.total_revenue).toFixed(2)}` },
    { label: "Profit", value: `$${Number(data.summary.total_profit).toFixed(2)}` },
  ];

  return (
    <div className="reveal in-view space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card-surface p-5">
            <p className="text-xs uppercase tracking-widest text-cream/40">{c.label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-gold-300">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="card-surface p-6">
        <div className="flex items-center gap-2">
          <FiTrendingUp className="text-gold-300" />
          <h3 className="font-display text-lg font-bold text-cream">Last 7 Days</h3>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-cream/40">
                <th className="pb-3">Date</th>
                <th className="pb-3">Orders</th>
                <th className="pb-3">Units</th>
                <th className="pb-3">Sales</th>
                <th className="pb-3">Profit</th>
              </tr>
            </thead>
            <tbody>
              {data.sales.daily.map((d) => (
                <tr key={d.date} className="border-t border-white/10 text-cream/75">
                  <td className="py-2.5">{formatDate(d.date)}</td>
                  <td className="py-2.5">{d.orders}</td>
                  <td className="py-2.5">{d.units}</td>
                  <td className="py-2.5">${Number(d.sales).toFixed(2)}</td>
                  <td className="py-2.5 text-gold-300">${Number(d.profit).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-display text-lg font-bold text-cream">Product Performance</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-cream/40">
                <th className="pb-3">Product</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3">Sold</th>
                <th className="pb-3">Revenue</th>
                <th className="pb-3">Profit</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((p) => (
                <tr key={p.id} className="border-t border-white/10 text-cream/75">
                  <td className="py-2.5">{p.name}</td>
                  <td className="py-2.5">{p.stock}</td>
                  <td className="py-2.5">{p.units_sold}</td>
                  <td className="py-2.5">${Number(p.revenue).toFixed(2)}</td>
                  <td className="py-2.5 text-gold-300">${Number(p.profit).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function ProductsPanel({ categories, canEdit, onChange }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState(undefined); // undefined = closed, null = create
  const [stockEdits, setStockEdits] = useState({});

  const load = () => {
    setLoading(true);
    api
      .products()
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    await api.deleteProduct(product.id);
    load();
    onChange?.();
  };

  const handleAddStock = async (product) => {
    const qty = Number(stockEdits[product.id]);
    if (!qty || qty <= 0) return;
    await api.addStock(product.id, qty);
    setStockEdits((s) => ({ ...s, [product.id]: "" }));
    load();
    onChange?.();
  };

  return (
    <div className="reveal in-view space-y-6">
      {canEdit && (
        <div className="flex justify-end">
          <button onClick={() => setModalProduct(null)} className="btn-gold !py-2.5 !px-5 text-sm">
            <FiPlus /> Add Product
          </button>
        </div>
      )}

      <div className="card-surface overflow-x-auto p-4">
        {loading ? (
          <p className="p-4 text-sm text-cream/50">Loading products…</p>
        ) : (
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-cream/40">
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Sold</th>
                {canEdit && <th className="p-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-white/10 text-cream/80">
                  <td className="p-3 font-medium text-cream">{p.name}</td>
                  <td className="p-3">{p.categoryLabel}</td>
                  <td className="p-3 text-gold-300">${p.price}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">{p.soldQuantity}</td>
                  {canEdit && (
                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={stockEdits[p.id] || ""}
                          onChange={(e) => setStockEdits((s) => ({ ...s, [p.id]: e.target.value }))}
                          className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-cream outline-none focus:border-gold-500/50"
                        />
                        <button
                          onClick={() => handleAddStock(p)}
                          className="rounded-lg border border-white/10 px-2 py-1.5 text-xs text-cream/70 hover:border-gold-400 hover:text-gold-300"
                        >
                          Restock
                        </button>
                        <button
                          onClick={() => setModalProduct(p)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-cream/60 hover:bg-white/5 hover:text-gold-300"
                          aria-label="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-cream/60 hover:bg-white/5 hover:text-red-400"
                          aria-label="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-cream/45">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalProduct !== undefined && (
        <ProductFormModal
          product={modalProduct}
          categories={categories}
          onClose={() => setModalProduct(undefined)}
          onSaved={() => {
            setModalProduct(undefined);
            load();
            onChange?.();
          }}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, categories, onClose, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    category: product?.categoryId || categories[0]?.id || "",
    original_price: product?.oldPrice || product?.price || "",
    sale_price: product?.price || "",
    cost_price: "",
    last_price: "",
    stock_quantity: product?.stock ?? 0,
    is_on_sale: product?.isOnSale || false,
  });
  const [newCategory, setNewCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    const cat = await api.createCategory(newCategory.trim());
    setForm((f) => ({ ...f, category: cat.id }));
    setNewCategory("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category || null,
        original_price: form.original_price,
        sale_price: form.sale_price,
        cost_price: form.cost_price || 0,
        last_price: form.last_price || null,
        stock_quantity: form.stock_quantity,
        is_on_sale: form.is_on_sale,
      };
      const saved = isEdit ? await api.updateProduct(product.id, payload) : await api.createProduct(payload);
      if (imageFile) {
        await api.uploadProductImage(saved.id, imageFile);
      }
      if (heroImageFile) {
        await api.uploadHeroImage(saved.id, heroImageFile);
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="glass-strong relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-cream">
            {isEdit ? "Edit Product" : "Add Product"}
          </h3>
          <button type="button" onClick={onClose} className="text-cream/60 hover:text-cream">
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <input
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Product Name"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Description"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
          />

          <div className="flex gap-2">
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="flex-1 rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-cream outline-none focus:border-gold-500/50"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
            />
            <button type="button" onClick={handleCreateCategory} className="btn-outline !px-4 !py-2.5 text-xs">
              Add
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              required
              type="number"
              step="0.01"
              name="original_price"
              value={form.original_price}
              onChange={handleChange}
              placeholder="Original Price"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
            />
            <input
              required
              type="number"
              step="0.01"
              name="sale_price"
              value={form.sale_price}
              onChange={handleChange}
              placeholder="Sale Price"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
            />
            <input
              type="number"
              step="0.01"
              name="cost_price"
              value={form.cost_price}
              onChange={handleChange}
              placeholder="Cost Price (internal)"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
            />
            <input
              type="number"
              name="stock_quantity"
              value={form.stock_quantity}
              onChange={handleChange}
              placeholder="Stock Quantity"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-cream/70">
            <input
              type="checkbox"
              name="is_on_sale"
              checked={form.is_on_sale}
              onChange={handleChange}
              className="h-4 w-4 rounded border-white/20 bg-transparent accent-gold-500"
            />
            Mark as on sale
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 px-4 py-3 text-sm text-cream/60 hover:border-gold-400">
            <FiUpload />
            {imageFile ? imageFile.name : "Upload product image"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 px-4 py-3 text-sm text-cream/60 hover:border-gold-400">
            <FiUpload />
            {heroImageFile ? heroImageFile.name : "Upload hero image (transparent PNG, optional)"}
            <input
              type="file"
              accept="image/png"
              className="hidden"
              onChange={(e) => setHeroImageFile(e.target.files?.[0] || null)}
            />
          </label>
          <p className="-mt-2 text-xs text-cream/40">
            Shown only in the homepage hero slider. Use a transparent-background PNG cutout for
            the best effect — the regular product image above is used everywhere else.
          </p>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={saving} className="btn-gold w-full disabled:opacity-60">
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .myOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="reveal in-view card-surface overflow-x-auto p-4">
      {loading ? (
        <p className="p-4 text-sm text-cream/50">Loading orders…</p>
      ) : (
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-cream/40">
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-white/10 text-cream/80">
                <td className="p-3 font-medium text-cream">{o.id}</td>
                <td className="p-3">{o.fullName}</td>
                <td className="p-3">{formatDate(o.date)}</td>
                <td className="p-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[o.status] || "text-cream/60 bg-white/5"}`}>
                    {o.status}
                  </span>
                </td>
                <td className="p-3 text-gold-300">${o.total.toFixed(2)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-cream/45">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function EmployeesPanel() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ employee_email: "", role: "viewer" });
  const [error, setError] = useState("");
  const [inviting, setInviting] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .employees()
      .then(setEmployees)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleInvite = async (e) => {
    e.preventDefault();
    setError("");
    setInviting(true);
    try {
      await api.inviteEmployee(form);
      setForm({ employee_email: "", role: "viewer" });
      load();
    } catch (err) {
      setError(err.message || "Could not invite employee.");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (emp, role) => {
    await api.updateEmployee(emp.id, { role });
    load();
  };

  const handleToggleActive = async (emp) => {
    await api.updateEmployee(emp.id, { is_active: !emp.is_active });
    load();
  };

  const handleRemove = async (emp) => {
    if (!confirm(`Remove ${emp.username} from your team?`)) return;
    await api.removeEmployee(emp.id);
    load();
  };

  return (
    <div className="reveal in-view space-y-6">
      <form onSubmit={handleInvite} className="card-surface flex flex-wrap items-end gap-3 p-6">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs uppercase tracking-widest text-cream/40">Employee Email</label>
          <input
            required
            type="email"
            name="employee_email"
            value={form.employee_email}
            onChange={handleChange}
            placeholder="employee@example.com"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-cream/40">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="mt-2 rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-cream outline-none focus:border-gold-500/50"
          >
            {Object.entries(ROLE_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={inviting} className="btn-gold !py-3 disabled:opacity-60">
          <FiPlus /> {inviting ? "Inviting..." : "Invite"}
        </button>
        {error && <p className="w-full text-sm text-red-400">{error}</p>}
      </form>

      <div className="card-surface overflow-x-auto p-4">
        {loading ? (
          <p className="p-4 text-sm text-cream/50">Loading team…</p>
        ) : (
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-cream/40">
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-t border-white/10 text-cream/80">
                  <td className="p-3 font-medium text-cream">{emp.username}</td>
                  <td className="p-3">{emp.email}</td>
                  <td className="p-3">
                    <select
                      value={emp.role}
                      onChange={(e) => handleRoleChange(emp, e.target.value)}
                      className="rounded-lg border border-white/10 bg-ink-800 px-2 py-1.5 text-xs text-cream outline-none"
                    >
                      {Object.entries(ROLE_LABELS).map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleActive(emp)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        emp.is_active ? "bg-green-500/10 text-green-400" : "bg-white/5 text-cream/50"
                      }`}
                    >
                      {emp.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleRemove(emp)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-cream/60 hover:bg-white/5 hover:text-red-400"
                      aria-label="Remove"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-cream/45">
                    No employees yet. Invite your first team member above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function StorePanel() {
  const [store, setStore] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getStore().then(setStore).catch(() => setStore(null));
  }, []);

  const handleChange = (e) => setStore((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveStore({ name: store.name, phone: store.phone, address: store.address });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!store) return <p className="text-sm text-cream/50">Loading store…</p>;

  return (
    <form onSubmit={handleSubmit} className="reveal in-view card-surface max-w-lg space-y-4 p-6">
      <h3 className="font-display text-lg font-bold text-cream">Store Settings</h3>
      <div>
        <label className="text-xs uppercase tracking-widest text-cream/40">Store Name</label>
        <input
          name="name"
          value={store.name || ""}
          onChange={handleChange}
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream outline-none focus:border-gold-500/50"
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-cream/40">Phone</label>
        <input
          name="phone"
          value={store.phone || ""}
          onChange={handleChange}
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream outline-none focus:border-gold-500/50"
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-cream/40">Address</label>
        <textarea
          name="address"
          value={store.address || ""}
          onChange={handleChange}
          rows={3}
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream outline-none focus:border-gold-500/50"
        />
      </div>
      {saved && <p className="text-sm text-gold-300">Store updated!</p>}
      <button type="submit" disabled={saving} className="btn-gold disabled:opacity-60">
        {saving ? "Saving..." : "Save Store"}
      </button>
    </form>
  );
}
