import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FiHeart, FiMinus, FiPlus, FiShoppingBag, FiZap, FiTruck, FiShield, FiChevronRight } from "react-icons/fi";
import Layout from "../../components/Layout";
import ProductCard from "../../components/ProductCard";
import StarRating from "../../components/StarRating";
import { useProducts } from "../../context/ProductsContext";
import { useStore } from "../../context/StoreContext";
import { useProductChat } from "../../context/ProductChatContext";
import { api } from "../../lib/api";

const sizeOptions = ["S", "M", "L", "XL"];

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { products } = useProducts();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const { setCurrentProduct } = useProductChat();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[1]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setActiveImage(0);
    api
      .product(id)
      .then((p) => {
        if (!cancelled) {
          setProduct(p);
          setCurrentProduct(p);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      setCurrentProduct(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-6 py-32 text-center text-cream/50">Loading product…</div>
      </Layout>
    );
  }

  if (notFound || !product) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-6 py-32 text-center">
          <p className="font-display text-2xl font-bold text-cream">Product not found</p>
          <Link href="/products" className="btn-gold mt-6 inline-flex">
            Back to Shop
          </Link>
        </div>
      </Layout>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => addToCart(product, quantity, selectedSize);
  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize);
    router.push("/checkout");
  };

  return (
    <Layout>
      <Head>
        <title>{`${product.name} — Fulhar`}</title>
        <meta name="description" content={product.description} />
      </Head>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="reveal in-view mb-8 flex items-center gap-2 text-sm text-cream/45">
          <Link href="/" className="hover:text-gold-300">Home</Link>
          <FiChevronRight size={14} />
          <Link href="/products" className="hover:text-gold-300">Shop</Link>
          <FiChevronRight size={14} />
          <span className="text-cream/70 line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Gallery */}
          <div className="reveal in-view">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-ink-800">
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {product.isNew && (
                <span className="absolute left-4 top-4 rounded-full bg-gold-gradient px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-950">
                  New
                </span>
              )}
            </div>
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    activeImage === i ? "border-gold-400" : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="reveal in-view" style={{ animationDelay: "120ms" }}>
            <p className="text-xs uppercase tracking-widest text-gold-400">
              {product.category.replace("-", " ")}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-cream sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <StarRating rating={product.rating} size={16} />
              <span className="text-sm text-cream/50">{product.reviewsCount} reviews</span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-gold-300">${product.price}</span>
              {product.oldPrice && (
                <span className="text-lg text-cream/40 line-through">${product.oldPrice}</span>
              )}
              {product.oldPrice && (
                <span className="rounded-full bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-300">
                  Save ${product.oldPrice - product.price}
                </span>
              )}
            </div>

            <p className="mt-6 max-w-md leading-relaxed text-cream/60">{product.description}</p>

            {/* Size */}
            <div className="mt-7">
              <p className="text-sm font-semibold text-cream/80">Size</p>
              <div className="mt-3 flex gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-10 w-12 rounded-xl border text-sm font-semibold transition-colors ${
                      selectedSize === size
                        ? "border-gold-400 bg-gold-500/10 text-gold-300"
                        : "border-white/10 text-cream/70 hover:border-white/25"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Actions */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-2xl border border-white/10">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-12 w-11 items-center justify-center text-cream/70 hover:text-gold-300"
                >
                  <FiMinus />
                </button>
                <span className="w-8 text-center font-semibold text-cream">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-12 w-11 items-center justify-center text-cream/70 hover:text-gold-300"
                >
                  <FiPlus />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="btn-gold flex-1 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                <FiShoppingBag /> Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="btn-outline flex-1 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                <FiZap /> Buy Now
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors ${
                  wishlisted
                    ? "border-gold-400 bg-gold-500/10 text-gold-300"
                    : "border-white/10 text-cream/60 hover:border-gold-400 hover:text-gold-300"
                }`}
                aria-label="Toggle wishlist"
              >
                <FiHeart className={wishlisted ? "fill-current" : ""} />
              </button>
            </div>

            <p className={`mt-3 text-xs font-semibold ${product.stock > 0 ? "text-gold-300" : "text-red-400"}`}>
              {product.stock > 0 ? `In stock — ${product.stock} available` : "Out of stock"}
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream/60">
                <FiTruck className="text-gold-300" /> Free shipping over $150
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream/60">
                <FiShield className="text-gold-300" /> 2-year warranty included
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="reveal in-view mt-20">
          <div className="flex gap-8 border-b border-white/10">
            {["description", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-gold-400 text-gold-300"
                    : "text-cream/45 hover:text-cream/70"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === "description" ? (
              <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-cream/65">
                <p>{product.description}</p>
                <ul className="list-inside list-disc space-y-2 text-cream/55">
                  <li>Premium materials with hand-finished gold detailing</li>
                  <li>On-device AI optimization tuned to your usage patterns</li>
                  <li>Backed by a 2-year international warranty</li>
                  <li>Carbon-neutral shipping on every order</li>
                </ul>
              </div>
            ) : (
              <div className="max-w-2xl space-y-6">
                <div className="flex items-center gap-4">
                  <p className="font-display text-4xl font-bold text-gold-300">
                    {product.rating.toFixed(1)}
                  </p>
                  <div>
                    <StarRating rating={product.rating} size={18} />
                    <p className="mt-1 text-xs text-cream/50">{product.reviewsCount} reviews</p>
                  </div>
                </div>
                <div className="space-y-5">
                  {[1, 2, 3].map((r) => (
                    <div key={r} className="card-surface p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-cream">Verified Buyer</p>
                        <StarRating rating={4.5 + r * 0.1} size={13} />
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-cream/60">
                        Exceeded expectations — the finish is stunning and it performs exactly as
                        advertised. Would buy again.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="reveal in-view font-display text-2xl font-bold text-cream">
              You May Also <span className="gold-text">Like</span>
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
