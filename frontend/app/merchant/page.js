'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/utils'

const emptyForm = {
  category: '',
  name: '',
  description: '',
  original_price: '',
  sale_price: '',
  cost_price: '',
  last_price: '',
  stock_quantity: '',
  is_on_sale: false,
  fb_post_id: '',
}

export default function MerchantPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [dash, setDash] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [catName, setCatName] = useState('')
  const [catSubmitting, setCatSubmitting] = useState(false)
  const [restock, setRestock] = useState({})
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editImageFile, setEditImageFile] = useState(null)
  const [editSubmitting, setEditSubmitting] = useState(false)

  // Gate behind authentication.
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?next=/merchant')
  }, [authLoading, user, router])

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [dashData, cats] = await Promise.all([
        api.merchantDashboard().catch(() => null),
        api.categories().catch(() => []),
      ])
      setDash(dashData)
      setCategories(cats)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  function update(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
      setForm((f) => ({ ...f, [field]: value }))
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setSubmitting(true)
    try {
      const created = await api.createProduct({
        category: Number(form.category),
        name: form.name.trim(),
        description: form.description.trim(),
        original_price: Number(form.original_price).toFixed(2),
        sale_price: Number(form.sale_price).toFixed(2),
        cost_price: Number(form.cost_price).toFixed(2),
        last_price: form.last_price ? Number(form.last_price).toFixed(2) : null,
        stock_quantity: Number(form.stock_quantity) || 0,
        is_on_sale: form.is_on_sale,
        fb_post_id: form.fb_post_id.trim() || null,
      })
      if (imageFile && created?.id) {
        await api.uploadProductImage(created.id, imageFile)
      }
      setForm(emptyForm)
      setImageFile(null)
      setShowCreate(false)
      setNotice('Product created successfully.')
      loadData()
    } catch (err) {
      setError(err.message || 'Could not create the product.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCreateCategory(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    if (!catName.trim()) return
    setCatSubmitting(true)
    try {
      const cat = await api.createCategory(catName.trim())
      setCategories((prev) => [...prev, cat])
      setForm((f) => ({ ...f, category: String(cat.id) }))
      setCatName('')
      setNotice('Category created.')
    } catch (err) {
      setError(err.message || 'Could not create the category.')
    } finally {
      setCatSubmitting(false)
    }
  }

  async function handleDelete(id) {
    setError('')
    setNotice('')
    try {
      await api.deleteProduct(id)
      loadData()
    } catch (err) {
      setError(err.message || 'Could not delete the product.')
    }
  }

  async function openEdit(id) {
    setError('')
    setNotice('')
    try {
      const p = await api.product(id)
      setEditImageFile(null)
      setEditing({
        id,
        category: p.categoryId ?? '',
        name: p.name || '',
        description: p.description || '',
        original_price: p.originalPrice ?? p.price ?? '',
        sale_price: p.price ?? '',
        cost_price: '',
        last_price: '',
        stock_quantity: p.stock ?? 0,
        is_on_sale: p.badge === 'Sale',
        fb_post_id: p.fbPostId || '',
      })
    } catch (err) {
      setError(err.message || 'Could not load the product.')
    }
  }

  function editField(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
      setEditing((prev) => ({ ...prev, [field]: value }))
    }
  }

  async function handleUpdate(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setEditSubmitting(true)
    try {
      // PATCH: send the core fields; only include cost/last price if the merchant entered them.
      const payload = {
        category: Number(editing.category),
        name: editing.name.trim(),
        description: editing.description.trim(),
        original_price: Number(editing.original_price).toFixed(2),
        sale_price: Number(editing.sale_price).toFixed(2),
        stock_quantity: Number(editing.stock_quantity) || 0,
        is_on_sale: editing.is_on_sale,
        fb_post_id: (editing.fb_post_id || '').trim() || null,
      }
      if (editing.cost_price !== '') payload.cost_price = Number(editing.cost_price).toFixed(2)
      if (editing.last_price !== '') payload.last_price = Number(editing.last_price).toFixed(2)
      await api.updateProduct(editing.id, payload)
      if (editImageFile) {
        await api.uploadProductImage(editing.id, editImageFile)
      }
      setEditing(null)
      setEditImageFile(null)
      setNotice('Product updated.')
      loadData()
    } catch (err) {
      setError(err.message || 'Could not update the product.')
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleRestock(id) {
    const qty = Number(restock[id])
    if (!qty || qty <= 0) return
    setError('')
    setNotice('')
    try {
      await api.addStock(id, qty)
      setRestock((r) => ({ ...r, [id]: '' }))
      setNotice('Stock updated.')
      loadData()
    } catch (err) {
      setError(err.message || 'Could not add stock.')
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full" />
      </div>
    )
  }

  // Customers cannot access the merchant dashboard (superusers always can).
  if (!user.is_merchant && !user.is_superuser) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Merchants only</h1>
        <p className="text-gray-500 mb-6">
          This dashboard is for merchant accounts. Your account is a customer account.
        </p>
        <Link href="/account" className="btn-primary inline-block">Go to My Account</Link>
      </div>
    )
  }

  const summary = dash?.summary
  const products = dash?.products || []
  const sales = dash?.sales
  const fmtDay = (iso) => {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}`
  }

  const statCards = [
    { label: 'Total Revenue', value: summary ? formatPrice(Number(summary.total_revenue)) : '—', icon: '💰' },
    { label: 'Total Profit', value: summary ? formatPrice(Number(summary.total_profit)) : '—', icon: '📈' },
    { label: 'Units Sold', value: summary ? summary.total_units_sold : '—', icon: '📦' },
    { label: 'In Stock', value: summary ? summary.total_stock : '—', icon: '🏷️' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Merchant Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Signed in as {user.username}</p>
        </div>
        <Link href="/products" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
          View storefront →
        </Link>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-gray-50 border border-gray-100 p-4">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sales & Profit — today / this month / last 7 days */}
      {sales && (
        <div className="mb-10">
          <h2 className="font-bold text-gray-900 mb-4">Sales &amp; Profit</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div className="border border-gray-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Today</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sales</span>
                <span className="font-bold text-gray-900">{formatPrice(Number(sales.today.sales))}</span>
              </div>
              <div className="flex justify-between text-sm mt-1.5">
                <span className="text-gray-600">Profit</span>
                <span className="font-bold text-teal-700">{formatPrice(Number(sales.today.profit))}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">{sales.today.orders} orders · {sales.today.units} units</p>
            </div>
            <div className="border border-gray-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">This Month</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sales</span>
                <span className="font-bold text-gray-900">{formatPrice(Number(sales.month.sales))}</span>
              </div>
              <div className="flex justify-between text-sm mt-1.5">
                <span className="text-gray-600">Profit</span>
                <span className="font-bold text-teal-700">{formatPrice(Number(sales.month.profit))}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">{sales.month.orders} orders · {sales.month.units} units</p>
            </div>
          </div>

          <div className="border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-2.5 font-semibold">Last 7 days</th>
                  <th className="px-3 py-2.5 font-semibold text-right">Units</th>
                  <th className="px-3 py-2.5 font-semibold text-right">Sales</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.daily.map((d) => (
                  <tr key={d.date} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700">{fmtDay(d.date)}</td>
                    <td className="px-3 py-2 text-right text-gray-600">{d.units}</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900">{formatPrice(Number(d.sales))}</td>
                    <td className="px-4 py-2 text-right text-teal-700">{formatPrice(Number(d.profit))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(error || notice) && (
        <div
          className={`mb-6 text-sm px-4 py-3 border ${
            error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-teal-50 border-teal-200 text-teal-700'
          }`}
        >
          {error || notice}
        </div>
      )}

      <div>
        {/* Product list (full width) */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">My Products ({products.length})</h2>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm px-4 py-2.5">
            + New Product
          </button>
        </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 border border-gray-100">
              <div className="text-4xl mb-3">🏷️</div>
              <p className="text-gray-500">You haven&apos;t added any products yet.</p>
            </div>
          ) : (
            <div className="border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-3 py-3 font-semibold text-right">Stock</th>
                    <th className="px-3 py-3 font-semibold text-right">Sold</th>
                    <th className="px-3 py-3 font-semibold text-right">Buying</th>
                    <th className="px-3 py-3 font-semibold text-right">Revenue</th>
                    <th className="px-3 py-3 font-semibold text-right">Profit</th>
                    <th className="px-3 py-3 font-semibold text-right">Last Price</th>
                    <th className="px-4 py-3 font-semibold">Restock</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/products/${p.id}`} className="font-medium text-gray-900 hover:text-teal-600 line-clamp-1">
                          {p.name}
                        </Link>
                        {p.is_on_sale && <span className="ml-2 text-[10px] text-orange-600 font-semibold uppercase">Sale</span>}
                      </td>
                      <td className={`px-3 py-3 text-right ${p.stock === 0 ? 'text-red-500 font-semibold' : 'text-gray-700'}`}>
                        {p.stock}
                      </td>
                      <td className="px-3 py-3 text-right text-gray-700">{p.units_sold}</td>
                      <td className="px-3 py-3 text-right text-gray-600">{p.cost_price != null ? formatPrice(Number(p.cost_price)) : '—'}</td>
                      <td className="px-3 py-3 text-right font-medium text-gray-900">{formatPrice(Number(p.revenue))}</td>
                      <td className="px-3 py-3 text-right text-teal-700">{formatPrice(Number(p.profit))}</td>
                      <td className="px-3 py-3 text-right text-gray-600">
                        {p.last_price != null ? formatPrice(Number(p.last_price)) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={restock[p.id] || ''}
                            onChange={(e) => setRestock((r) => ({ ...r, [p.id]: e.target.value }))}
                            className="w-16 border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-black"
                          />
                          <button
                            onClick={() => handleRestock(p.id)}
                            className="text-xs font-semibold text-teal-600 hover:text-teal-700 border border-teal-200 px-2 py-1"
                          >
                            + Add
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEdit(p.id)}
                          className="text-xs text-teal-600 hover:text-teal-700 font-medium mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-xs text-red-500 hover:text-red-600 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Create product modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Add Product</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Add category */}
            <form onSubmit={handleCreateCategory} className="flex gap-2 mb-5">
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="New category name"
                className="input-field flex-1"
              />
              <button type="submit" disabled={catSubmitting} className="btn-outline px-4 whitespace-nowrap disabled:opacity-50">
                {catSubmitting ? '…' : '+ Category'}
              </button>
            </form>

            {categories.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
                Add a category above first, then you can create products.
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Category</label>
                  <select value={form.category} onChange={update('category')} required className="input-field">
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Name</label>
                  <input type="text" value={form.name} onChange={update('name')} required className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea value={form.description} onChange={update('description')} required rows={3} className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Original Price</label>
                    <input type="number" step="0.01" min="0" value={form.original_price} onChange={update('original_price')} required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Sale Price</label>
                    <input type="number" step="0.01" min="0" value={form.sale_price} onChange={update('sale_price')} required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Buying Price</label>
                    <input type="number" step="0.01" min="0" value={form.cost_price} onChange={update('cost_price')} required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                      Last Price <span className="text-gray-400 normal-case">(optional)</span>
                    </label>
                    <input type="number" step="0.01" min="0" value={form.last_price} onChange={update('last_price')} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Stock</label>
                    <input type="number" min="0" value={form.stock_quantity} onChange={update('stock_quantity')} required className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                    Product Image <span className="text-gray-400 normal-case">(optional)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:border file:border-gray-300 file:bg-white file:text-sm file:font-medium hover:file:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                    Facebook Post ID <span className="text-gray-400 normal-case">(optional — for comment auto-reply)</span>
                  </label>
                  <input type="text" value={form.fb_post_id} onChange={update('fb_post_id')} placeholder="e.g. 1234567890_9876543210" className="input-field" />
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={form.is_on_sale} onChange={update('is_on_sale')} className="w-4 h-4 accent-teal-600" />
                  <span className="text-sm text-gray-700">Mark as on sale</span>
                </label>
                <p className="text-xs text-gray-400">
                  📣 Adding a product with an image auto-posts it to your Facebook &amp; Instagram (if connected).
                </p>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-outline flex-1 py-2.5">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5 disabled:opacity-50">
                    {submitting ? 'Saving…' : 'Create Product'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit product modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditing(null)} />
          <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Edit Product</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Category</label>
                <select value={editing.category} onChange={editField('category')} required className="input-field">
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Name</label>
                <input type="text" value={editing.name} onChange={editField('name')} required className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Description</label>
                <textarea value={editing.description} onChange={editField('description')} required rows={3} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Original Price</label>
                  <input type="number" step="0.01" min="0" value={editing.original_price} onChange={editField('original_price')} required className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Sale Price</label>
                  <input type="number" step="0.01" min="0" value={editing.sale_price} onChange={editField('sale_price')} required className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                    Buying Price <span className="text-gray-400 normal-case">(unchanged if blank)</span>
                  </label>
                  <input type="number" step="0.01" min="0" value={editing.cost_price} onChange={editField('cost_price')} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                    Last Price <span className="text-gray-400 normal-case">(unchanged if blank)</span>
                  </label>
                  <input type="number" step="0.01" min="0" value={editing.last_price} onChange={editField('last_price')} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Stock</label>
                  <input type="number" min="0" value={editing.stock_quantity} onChange={editField('stock_quantity')} required className="input-field" />
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer mt-6">
                  <input type="checkbox" checked={editing.is_on_sale} onChange={editField('is_on_sale')} className="w-4 h-4 accent-teal-600" />
                  <span className="text-sm text-gray-700">On sale</span>
                </label>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                  Replace Image <span className="text-gray-400 normal-case">(optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                  className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:border file:border-gray-300 file:bg-white file:text-sm file:font-medium hover:file:border-black"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                  Facebook Post ID <span className="text-gray-400 normal-case">(optional — for comment auto-reply)</span>
                </label>
                <input type="text" value={editing.fb_post_id || ''} onChange={editField('fb_post_id')} placeholder="e.g. 1234567890_9876543210" className="input-field" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="btn-outline flex-1 py-2.5">Cancel</button>
                <button type="submit" disabled={editSubmitting} className="btn-primary flex-1 py-2.5 disabled:opacity-50">
                  {editSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
