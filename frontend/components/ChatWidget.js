import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { FiMessageCircle, FiX, FiSend } from "react-icons/fi";
import { API_BASE } from "../lib/api";
import { useProductChat } from "../context/ProductChatContext";
import { useStore } from "../context/StoreContext";

const WS_BASE = API_BASE.replace(/^http/, "ws");

function getSessionId() {
  if (typeof window === "undefined") return "guest";
  let id = localStorage.getItem("chat_session");
  if (!id) {
    id = "sess" + Math.floor(Math.random() * 1e9).toString(36);
    localStorage.setItem("chat_session", id);
  }
  return id;
}

export default function ChatWidget() {
  const router = useRouter();
  const { currentProduct } = useProductChat();
  const { addToCart } = useStore();
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!open || socketRef.current) return;
    const ws = new WebSocket(`${WS_BASE}/ws/chat/${getSessionId()}/`);
    socketRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setMessages((prev) => [...prev, { sender: data.sender, message: data.message, actions: data.actions || [] }]);
      } catch {}
    };
    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    (e) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || socketRef.current?.readyState !== WebSocket.OPEN) return;
      const match = router.pathname === "/products/[id]" ? router.query.id : null;
      const product = currentProduct
        ? {
            name: currentProduct.name,
            sale_price: currentProduct.price,
            stock_quantity: currentProduct.stock,
            description: currentProduct.description,
          }
        : null;
      const context = { path: router.asPath, product_id: match, product };
      socketRef.current.send(JSON.stringify({ message: text, context }));
      setInput("");
    },
    [input, router, currentProduct]
  );

  const handleAction = (action) => {
    if (action === "add_to_cart" && currentProduct) {
      addToCart(currentProduct);
      setMessages((prev) => [
        ...prev,
        { sender: "support", message: `Added "${currentProduct.name}" to your cart.`, actions: ["checkout"] },
      ]);
    } else if (action === "checkout") {
      setOpen(false);
      router.push("/checkout");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient text-ink-950 shadow-gold transition-transform hover:scale-105"
        aria-label="Open support chat"
      >
        {open ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </button>

      {open && (
        <div className="glass-strong fixed bottom-24 right-5 z-50 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl shadow-glass sm:w-96">
          <div className="flex items-center justify-between border-b border-white/10 bg-ink-800/60 px-4 py-3">
            <div>
              <p className="font-display text-sm font-bold text-cream">Support Chat</p>
              <p className="text-[11px] text-cream/45">{connected ? "Connected" : "Connecting…"}</p>
            </div>
            <span className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-gold-400" : "bg-cream/20"}`} />
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="mt-8 text-center text-xs text-cream/40">
                Send a message and our AI support will reply instantly.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.sender === "user" ? "bg-gold-gradient text-ink-950" : "border border-white/10 bg-white/5 text-cream/85"
                  }`}
                >
                  {m.message}
                </div>
                {m.sender === "support" && m.actions?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.actions.includes("add_to_cart") && currentProduct && (
                      <button
                        onClick={() => handleAction("add_to_cart")}
                        className="rounded-lg bg-gold-gradient px-3 py-1.5 text-xs font-semibold text-ink-950"
                      >
                        Add to Cart
                      </button>
                    )}
                    {m.actions.includes("checkout") && (
                      <button
                        onClick={() => handleAction("checkout")}
                        className="rounded-lg border border-gold-500/40 px-3 py-1.5 text-xs font-semibold text-gold-300"
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

          <form onSubmit={send} className="flex gap-2 border-t border-white/10 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
            />
            <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-gradient text-ink-950">
              <FiSend size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
