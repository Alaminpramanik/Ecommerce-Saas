'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()

  const [form, setForm] = useState({ username: '', email: '', password: '', phone_number: '', is_merchant: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        phone_number: form.phone_number.trim() || undefined,
        is_merchant: form.is_merchant,
      })
      router.push(form.is_merchant ? '/merchant' : '/account')
    } catch (err) {
      setError(err.message || 'Could not create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
      <p className="text-gray-500 mb-8">Join us and start shopping in minutes.</p>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Username
          </label>
          <input type="text" value={form.username} onChange={update('username')} required autoFocus className="input-field" placeholder="username" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Email
          </label>
          <input type="email" value={form.email} onChange={update('email')} required className="input-field" placeholder="you@email.com" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Phone <span className="text-gray-400 normal-case">(optional)</span>
          </label>
          <input type="tel" value={form.phone_number} onChange={update('phone_number')} className="input-field" placeholder="+880…" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Password
          </label>
          <input type="password" value={form.password} onChange={update('password')} required minLength={8} className="input-field" placeholder="At least 8 characters" />
        </div>
        <label className="flex items-start gap-2.5 cursor-pointer bg-gray-50 border border-gray-200 p-3">
          <input
            type="checkbox"
            checked={form.is_merchant}
            onChange={(e) => setForm((f) => ({ ...f, is_merchant: e.target.checked }))}
            className="w-4 h-4 accent-teal-600 mt-0.5"
          />
          <span className="text-sm text-gray-700">
            <span className="font-medium">Sell on our platform</span>
            <span className="block text-xs text-gray-500">Create a merchant account to upload and manage products.</span>
          </span>
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-6 text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
