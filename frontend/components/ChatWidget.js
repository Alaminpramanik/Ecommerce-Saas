'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { API_BASE } from '@/lib/api'
import { useProductChat } from '@/context/ProductChatContext'
import { useCart } from '@/context/CartContext'

// Derive the websocket origin from the API base (http -> ws, https -> wss).
const WS_BASE = API_BASE.replace(/^http/, 'ws')

function getSessionId() {
  if (typeof window === 'undefined') return 'guest'
  let id = localStorage.getItem('chat_session')
  if (!id) {
    id = 'sess' + Math.floor(Math.random() * 1e9).toString(36)
    localStorage.setItem('chat_session', id)
  }
  return id
}

export default function ChatWidget() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentProduct } = useProductChat()
  const { addItem } = useCart()
  const [open, setOpen] = useState(false)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const socketRef = useRef(null)
  const bottomRef = useRef(null)

  // Open the socket the first time the panel is opened; close it on unmount.
  useEffect(() => {
    if (!open || socketRef.current) return
    const ws = new WebSocket(`${WS_BASE}/ws/chat/${getSessionId()}/`)
    socketRef.current = ws
    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        setMessages((prev) => [...prev, { sender: data.sender, message: data.message, actions: data.actions || [] }])
      } catch {}
    }
    return () => {
      ws.close()
      socketRef.current = null
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = useCallback(
    (e) => {
      e.preventDefault()
      const text = input.trim()
      if (!text || socketRef.current?.readyState !== WebSocket.OPEN) return
      // Tell the backend which page/product the customer is on so it can reply in context.
      const match = pathname?.match(/^\/products\/([^/]+)$/)
      const product = currentProduct
        ? {
            name: currentProduct.name,
            sale_price: currentProduct.price,
            stock_quantity: currentProduct.stock,
            description: currentProduct.description,
          }
        : null
      const context = { path: pathname, product_id: match ? match[1] : null, product }
      socketRef.current.send(JSON.stringify({ message: text, context }))
      setInput('')
    },
    [input, pathname, currentProduct]
  )

  function handleAction(action) {
    if (action === 'add_to_cart' && currentProduct) {
      addItem(currentProduct)
      setMessages((prev) => [...prev, { sender: 'support', message: `Added "${currentProduct.name}" to your cart. ✅`, actions: ['checkout'] }])
    } else if (action === 'checkout') {
      setOpen(false)
      router.push('/checkout')
    }
  }

  return (
    <>
      {/* Launcher button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
        aria-label="Open support chat"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.9A7.94 7.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-80 sm:w-96 h-[28rem] bg-white border border-gray-200 shadow-2xl flex flex-col animate-slide-up">
          <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Support Chat</p>
              <p className="text-[11px] text-gray-300">{connected ? 'Connected' : 'Connecting…'}</p>
            </div>
            <span className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-teal-400' : 'bg-gray-500'}`} />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <p className="text-center text-xs text-gray-400 mt-8">
                Send a message and our support team will reply.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 text-sm whitespace-pre-line ${
                    m.sender === 'user' ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  {m.message}
                </div>
                {m.sender === 'support' && m.actions?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {m.actions.includes('add_to_cart') && currentProduct && (
                      <button
                        onClick={() => handleAction('add_to_cart')}
                        className="bg-black text-white text-xs font-semibold px-3 py-1.5 hover:bg-gray-800 transition-colors"
                      >
                        🛒 Add to Cart
                      </button>
                    )}
                    {m.actions.includes('checkout') && (
                      <button
                        onClick={() => handleAction('checkout')}
                        className="border border-gray-300 text-gray-800 text-xs font-semibold px-3 py-1.5 hover:border-black transition-colors"
                      >
                        Go to Checkout →
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={send} className="flex gap-2 p-3 border-t border-gray-200">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
            <button type="submit" className="bg-black text-white px-4 text-sm font-semibold hover:bg-gray-800 transition-colors">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  )
}
