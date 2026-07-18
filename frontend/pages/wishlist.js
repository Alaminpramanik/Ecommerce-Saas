import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiShoppingBag, FiX, FiArrowRight } from "react-icons/fi";
import Layout from "../components/Layout";
import { useStore } from "../context/StoreContext";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  return (
    <Layout>
      <Head>
        <title>Your Wishlist — Fulhar</title>
      </Head>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="reveal in-view">
          <span className="section-label">Wishlist</span>
          <h1 className="mt-4 font-display text-3xl font-bold text-cream sm:text-4xl">
            Saved <span className="gold-text">Favorites</span>
          </h1>
          <p className="mt-2 text-sm text-cream/50">{wishlist.length} items saved</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="reveal in-view card-surface mt-12 flex flex-col items-center gap-4 py-24 text-center">
            <FiHeart size={40} className="text-gold-400/60" />
            <p className="font-display text-xl font-semibold text-cream">Your wishlist is empty</p>
            <p className="max-w-sm text-sm text-cream/50">
              Tap the heart icon on any product to save it here for later.
            </p>
            <Link href="/products" className="btn-gold mt-2">
              Browse Products <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item, i) => {
              return (
                <div
                  key={item.id}
                  className="reveal in-view card-surface flex items-center gap-4 p-4"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <Link href={`/products/${item.id}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-700">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </Link>
                  <div className="flex-1">
                    <Link href={`/products/${item.id}`} className="font-display text-sm font-semibold text-cream hover:text-gold-300">
                      {item.name}
                    </Link>
                    <p className="mt-1 font-semibold text-gold-300">${item.price}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={() => addToCart(item)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gold-300 hover:text-gold-200"
                      >
                        <FiShoppingBag size={13} /> Add to Cart
                      </button>
                      <button
                        onClick={() => toggleWishlist(item)}
                        className="flex items-center gap-1.5 text-xs font-medium text-cream/45 hover:text-red-400"
                      >
                        <FiX size={13} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
}
