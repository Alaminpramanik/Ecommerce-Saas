'use client'

import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setStatus('loading')
    setTimeout(() => {
      setStatus('success')
      setEmail('')
    }, 1200)
  }

  return (
    <section className="bg-black text-white py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-teal-400 text-sm font-semibold tracking-widest uppercase mb-3">
          Stay in the loop
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Get 15% off your first order
        </h2>
        <p className="text-gray-400 mb-8 text-base">
          Subscribe to receive exclusive offers, new arrivals, and style inspiration delivered straight to your inbox.
        </p>

        {status === 'success' ? (
          <div className="animate-scale-in bg-teal-600/20 border border-teal-500 rounded-none px-6 py-4 text-teal-400">
            <p className="font-semibold">You&apos;re in! Check your inbox for your discount code.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="Enter your email address"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400
                  px-4 py-3.5 text-sm focus:outline-none focus:border-teal-400 transition-colors"
                disabled={status === 'loading'}
              />
              {error && <p className="text-red-400 text-xs mt-1.5 text-left">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-3.5 font-semibold
                text-sm tracking-wide transition-colors duration-200 whitespace-nowrap
                disabled:opacity-70 disabled:cursor-not-allowed sm:border-l-0"
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Subscribing...
                </span>
              ) : 'Subscribe'}
            </button>
          </form>
        )}

        <p className="text-gray-600 text-xs mt-4">
          No spam, ever. Unsubscribe at any time.
        </p>
      </div>
    </section>
  )
}
