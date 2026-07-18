// Central API client for the Django backend.
// Base URL comes from docker-compose (NEXT_PUBLIC_API_URL); falls back to localhost for bare `next dev`.
import { slugify } from "./utils";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";

export function getAccess() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefresh() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens({ access, refresh }) {
  if (typeof window === "undefined") return;
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function refreshAccess() {
  const refresh = getRefresh();
  if (!refresh) return null;
  const res = await fetch(`${API_BASE}/api/accounts/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  const data = await res.json();
  setTokens({ access: data.access });
  return data.access;
}

async function request(path, { auth = false, retry = true, ...opts } = {}) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (auth) {
    const token = getAccess();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api${path}`, { ...opts, headers });

  if (res.status === 401 && auth && retry) {
    const newToken = await refreshAccess();
    if (newToken) return request(path, { auth, retry: false, ...opts });
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const err = await res.json();
      message = err.detail || Object.values(err).flat().join(" ") || message;
    } catch {}
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ---- Media helper: backend image paths -> absolute URLs ----
function mediaURL(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${clean}`;
}

function unwrapList(data) {
  return Array.isArray(data) ? data : data?.results || [];
}

const FALLBACK_IMAGE_POOL = [
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=800&q=80",
];

function fallbackImage(id) {
  const idx = Number(id) % FALLBACK_IMAGE_POOL.length;
  return FALLBACK_IMAGE_POOL[Number.isNaN(idx) ? 0 : idx];
}

// ---- Adapters: map backend Product/Order shapes to the shape the UI expects ----
export function adaptProduct(p) {
  const sale = Number(p.sale_price);
  const orig = Number(p.original_price);
  const catName = p.category_name || "Uncategorized";
  const sortedImages = [...(p.images || [])].sort((a, b) => (b.is_feature ? 1 : 0) - (a.is_feature ? 1 : 0));
  const images = sortedImages.length ? sortedImages.map((img) => mediaURL(img.image)) : [fallbackImage(p.id)];
  const createdAt = p.created_at ? new Date(p.created_at) : null;
  const isNew = createdAt ? Date.now() - createdAt.getTime() < 1000 * 60 * 60 * 24 * 14 : false;

  return {
    id: String(p.id),
    name: p.name,
    category: slugify(catName),
    categoryLabel: catName,
    categoryId: p.category,
    price: sale,
    oldPrice: orig > sale ? orig : null,
    rating: 0,
    reviewsCount: 0,
    isNew,
    tags: [],
    colors: [],
    description: p.description || "",
    images,
    // Transparent-background cutout used only by the homepage hero slider;
    // falls back to the regular gallery photo when a merchant hasn't set one.
    heroImage: p.hero_image ? mediaURL(p.hero_image) : images[0],
    stock: p.stock_quantity ?? 0,
    soldQuantity: p.sold_quantity ?? 0,
    isOnSale: !!p.is_on_sale,
    merchant: p.merchant,
    fbPostId: p.fb_post_id || "",
  };
}

const ORDER_STATUS_LABELS = {
  pending: "Processing",
  picked: "Processing",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Cancelled",
};

export function adaptOrder(o) {
  return {
    id: `#${o.id}`,
    rawId: o.id,
    date: o.created_at,
    status: ORDER_STATUS_LABELS[o.status] || "Processing",
    rawStatus: o.status,
    total: Number(o.total_price),
    fullName: o.full_name,
    phone: o.phone,
    address: o.address,
    items: (o.items || []).map((it) => ({
      product: it.product,
      name: it.product_name || `Product ${it.product}`,
      qty: it.quantity,
      price: Number(it.price),
      image: fallbackImage(it.product),
    })),
  };
}

export const api = {
  // ---- Auth ----
  register: (payload) => request("/accounts/register/", { method: "POST", body: JSON.stringify(payload) }),
  login: (username, password) =>
    request("/accounts/login/", { method: "POST", body: JSON.stringify({ username, password }) }),
  me: () => request("/accounts/me/", { auth: true }),
  updateMe: (payload) => request("/accounts/me/", { method: "PATCH", auth: true, body: JSON.stringify(payload) }),

  async getShipping() {
    const d = await request("/accounts/shipping/", { auth: true });
    return {
      firstName: d.first_name || "",
      lastName: d.last_name || "",
      email: d.email || "",
      phone: d.phone || "",
      address: d.address || "",
      apartment: d.apartment || "",
      city: d.city || "",
      state: d.state || "",
      zip: d.zip_code || "",
      country: d.country || "US",
    };
  },
  saveShipping: (form) =>
    request("/accounts/shipping/", {
      method: "PATCH",
      auth: true,
      body: JSON.stringify({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        apartment: form.apartment,
        city: form.city,
        state: form.state,
        zip_code: form.zip,
        country: form.country,
      }),
    }),

  // ---- Store (merchant) ----
  getStore: () => request("/accounts/store/", { auth: true }),
  saveStore: (payload) => request("/accounts/store/", { method: "PATCH", auth: true, body: JSON.stringify(payload) }),

  // ---- Employees ----
  async employees() {
    const data = await request("/accounts/employees/", { auth: true });
    return unwrapList(data);
  },
  myEmployeeProfile: () => request("/accounts/employees/me/", { auth: true }),
  inviteEmployee: (payload) =>
    request("/accounts/employees/", { method: "POST", auth: true, body: JSON.stringify(payload) }),
  updateEmployee: (id, payload) =>
    request(`/accounts/employees/${id}/`, { method: "PATCH", auth: true, body: JSON.stringify(payload) }),
  removeEmployee: (id) => request(`/accounts/employees/${id}/`, { method: "DELETE", auth: true }),

  // ---- Products ----
  async products(query = "") {
    const data = await request(`/products/items/${query}`);
    return unwrapList(data).map(adaptProduct);
  },
  async product(id) {
    return adaptProduct(await request(`/products/items/${id}/`));
  },
  async categories() {
    const data = await request("/products/categories/");
    return unwrapList(data);
  },
  createCategory: (name) =>
    request("/products/categories/", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ name, slug: slugify(name) }),
    }),
  async uploadProductImage(productId, file) {
    const fd = new FormData();
    fd.append("image", file);
    const token = getAccess();
    const res = await fetch(`${API_BASE}/api/products/items/${productId}/upload_image/`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) throw new Error("Image upload failed");
    return res.json();
  },
  async uploadHeroImage(productId, file) {
    const fd = new FormData();
    fd.append("image", file);
    const token = getAccess();
    const res = await fetch(`${API_BASE}/api/products/items/${productId}/upload_hero_image/`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) throw new Error("Hero image upload failed");
    return res.json();
  },
  createProduct: (payload) => request("/products/items/", { method: "POST", auth: true, body: JSON.stringify(payload) }),
  updateProduct: (id, payload) =>
    request(`/products/items/${id}/`, { method: "PATCH", auth: true, body: JSON.stringify(payload) }),
  deleteProduct: (id) => request(`/products/items/${id}/`, { method: "DELETE", auth: true }),
  addStock: (id, quantity) =>
    request(`/products/items/${id}/add_stock/`, { method: "POST", auth: true, body: JSON.stringify({ quantity }) }),

  // ---- Orders ----
  createOrder: (payload) => request("/orders/", { method: "POST", auth: true, body: JSON.stringify(payload) }),
  async myOrders() {
    const data = await request("/orders/", { auth: true });
    return unwrapList(data).map(adaptOrder);
  },

  // ---- Analytics ----
  merchantDashboard: () => request("/analytics/merchant/", { auth: true }),
};
