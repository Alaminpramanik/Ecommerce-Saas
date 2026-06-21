import Link from 'next/link'

const shopLinks = [
  { href: '/products', label: 'All Products' },
  { href: '/products?category=electronics', label: 'Electronics' },
  { href: '/products?category=clothing', label: 'Clothing' },
  { href: '/products?category=home', label: 'Home & Garden' },
  { href: '/products?category=sports', label: 'Sports' },
  { href: '/products?badge=Sale', label: 'Sale' },
]

const helpLinks = [
  { href: '#', label: 'FAQs' },
  { href: '#', label: 'Shipping Policy' },
  { href: '#', label: 'Returns & Exchanges' },
  { href: '#', label: 'Order Tracking' },
  { href: '#', label: 'Contact Us' },
]

const companyLinks = [
  { href: '#', label: 'About Us' },
  { href: '#', label: 'Careers' },
  { href: '#', label: 'Press' },
  { href: '#', label: 'Sustainability' },
  { href: '#', label: 'Affiliate Program' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* Trust badges */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🚚', title: 'Free Shipping', subtitle: 'On orders over $75' },
              { icon: '↩️', title: 'Easy Returns', subtitle: '30-day return policy' },
              { icon: '🔒', title: 'Secure Payment', subtitle: '256-bit SSL encryption' },
              { icon: '⭐', title: 'Top Rated', subtitle: '4.9/5 from 50k reviews' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-gray-500 text-xs">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <span className="bg-white text-black px-3 py-1 font-bold text-xl">LUXE</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 text-gray-500">
              Curated products for the modern lifestyle. Quality you can feel, prices you&apos;ll love.
            </p>
            <div className="flex gap-3">
              {['twitter', 'instagram', 'facebook', 'youtube'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 bg-gray-800 hover:bg-teal-600 flex items-center justify-center transition-colors duration-200"
                  aria-label={social}
                >
                  <span className="text-xs font-bold uppercase text-gray-400 hover:text-white">
                    {social[0].toUpperCase()}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Help</h3>
            <ul className="space-y-2.5">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} LUXE Commerce. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Cookie Policy</a>
          </div>
          {/* Payment icons */}
          <div className="flex items-center gap-2">
            {['VISA', 'MC', 'AMEX', 'PayPal'].map((p) => (
              <span
                key={p}
                className="bg-gray-800 text-gray-400 text-[10px] font-bold px-2 py-1 rounded"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
