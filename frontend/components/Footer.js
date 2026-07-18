import Link from "next/link";
import { FiInstagram, FiTwitter, FiYoutube, FiLinkedin, FiArrowRight } from "react-icons/fi";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/products" },
      { label: "New Arrivals", href: "/#new-arrivals" },
      { label: "Categories", href: "/#categories" },
      { label: "Cart", href: "/cart" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Sustainability", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Shipping & Returns", href: "#" },
      { label: "Track Order", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-white/10 bg-ink-950">
      <div className="pointer-events-none absolute inset-0 bg-ink-radial" />
      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-gradient font-display text-lg font-black text-ink-950">
                F
              </span>
              <span className="font-display text-xl font-bold text-cream">
                FULHAR
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/50">
              Premium AI-powered tech, curated for people who expect more from their gear.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[FiInstagram, FiTwitter, FiYoutube, FiLinkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-cream/70 transition-all duration-300 hover:-translate-y-1 hover:border-gold-400 hover:text-gold-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-gold-300">
                {col.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-cream/55 transition-colors hover:text-cream"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-cream/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Fulhar — All rights reserved.</p>
          <div className="flex items-center gap-2 text-gold-400/70">
            <span>Crafted with intelligence</span>
            <FiArrowRight />
          </div>
        </div>
      </div>
    </footer>
  );
}
