import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FiSearch, FiShoppingBag, FiHeart, FiMenu, FiX, FiUser, FiLogOut, FiGrid } from "react-icons/fi";
import { useStore } from "../context/StoreContext";
import { useProducts } from "../context/ProductsContext";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/#new-arrivals", label: "New Arrivals" },
  { href: "/#testimonials", label: "Reviews" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const { cartCount, wishlistCount } = useStore();
  const { products } = useProducts();
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    setResults(
      products.filter((p) => p.name.toLowerCase().includes(q) || p.category.includes(q)).slice(0, 5)
    );
  }, [query]);

  const submitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?search=${encodeURIComponent(query)}`);
    setResults([]);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-2xl px-5 transition-all duration-300 ${
          scrolled ? "glass-strong shadow-glass py-2.5" : "bg-transparent py-2"
        } mx-4 lg:mx-auto`}
      >
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-gradient font-display text-lg font-black text-ink-950">
            F
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-cream">
            FULHAR
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium uppercase tracking-[0.15em] text-cream/80 transition-colors hover:text-gold-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="relative hidden max-w-xs flex-1 md:block">
          <form onSubmit={submitSearch}>
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search products..."
              className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-cream placeholder:text-cream/40 outline-none transition-colors focus:border-gold-500/50"
            />
          </form>
          {results.length > 0 && (
            <div className="glass-strong absolute left-0 right-0 top-12 z-50 rounded-2xl p-2 shadow-glass">
              {results.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  onClick={() => setQuery("")}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-cream/90 hover:bg-white/5"
                >
                  <span className="line-clamp-1">{p.name}</span>
                  <span className="ml-auto text-gold-400">${p.price}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <button
              onClick={() => setAccountOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-cream/80 transition-colors hover:bg-white/5 hover:text-gold-300"
              aria-label="Account"
            >
              <FiUser size={19} />
            </button>
            {accountOpen && (
              <div className="glass-strong absolute right-0 top-12 z-50 w-52 rounded-2xl p-2 shadow-glass">
                {isAuthenticated ? (
                  <>
                    <p className="truncate px-3 py-2 text-xs text-cream/45">
                      Signed in as <span className="text-cream/80">{user.username}</span>
                    </p>
                    <Link
                      href="/account"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-cream/85 hover:bg-white/5"
                    >
                      <FiUser size={15} /> My Account
                    </Link>
                    {isStaff && (
                      <Link
                        href="/merchant"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-cream/85 hover:bg-white/5"
                      >
                        <FiGrid size={15} /> Merchant Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setAccountOpen(false);
                        router.push("/");
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-cream/85 hover:bg-white/5"
                    >
                      <FiLogOut size={15} /> Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setAccountOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-semibold text-gold-300 hover:bg-white/5"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setAccountOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm text-cream/85 hover:bg-white/5"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link
            href="/wishlist"
            className="relative hidden h-10 w-10 items-center justify-center rounded-full text-cream/80 transition-colors hover:bg-white/5 hover:text-gold-300 sm:flex"
            aria-label="Wishlist"
          >
            <FiHeart size={19} />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold-gradient text-[10px] font-bold text-ink-950">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-cream/80 transition-colors hover:bg-white/5 hover:text-gold-300"
            aria-label="Cart"
          >
            <FiShoppingBag size={19} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold-gradient text-[10px] font-bold text-ink-950 animate-pulseGlow">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-cream/80 hover:bg-white/5 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="glass-strong mx-4 mt-2 flex flex-col gap-1 rounded-2xl p-4 lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-cream/85 hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
          <form onSubmit={submitSearch} className="relative mt-2">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search products..."
              className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-cream placeholder:text-cream/40 outline-none"
            />
          </form>
          <div className="mt-2 flex flex-col gap-1 border-t border-white/10 pt-2">
            <Link
              href="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-cream/85 hover:bg-white/5"
            >
              Wishlist ({wishlistCount})
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-cream/85 hover:bg-white/5"
                >
                  My Account
                </Link>
                {isStaff && (
                  <Link
                    href="/merchant"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-cream/85 hover:bg-white/5"
                  >
                    Merchant Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                    router.push("/");
                  }}
                  className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-cream/85 hover:bg-white/5"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-gold-300 hover:bg-white/5"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-cream/85 hover:bg-white/5"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
