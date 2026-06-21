import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ChatWidget from '@/components/ChatWidget'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata = {
  title: {
    default: 'LUXE — Modern Commerce',
    template: '%s | LUXE',
  },
  description: 'Discover curated products across electronics, fashion, home, sports and beauty.',
  keywords: ['ecommerce', 'shopping', 'fashion', 'electronics', 'luxury'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 page-transition">{children}</main>
            <Footer />
          </div>
          <ChatWidget />
        </Providers>
      </body>
    </html>
  )
}
