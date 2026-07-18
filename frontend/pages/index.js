import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { FiArrowRight, FiArrowUpRight, FiChevronLeft, FiChevronRight, FiMail, FiShield, FiTruck, FiRefreshCw } from "react-icons/fi";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import StarRating from "../components/StarRating";
import RevealSection from "../components/RevealSection";
import EditorialHero from "../components/EditorialHero";
import { useProducts } from "../context/ProductsContext";
import { CATEGORY_DECOR, DEFAULT_CATEGORY_DECOR, testimonials } from "../data/content";
import { slugify } from "../lib/utils";

const perks = [
  { icon: FiTruck, title: "Free Global Shipping", desc: "On all orders over $150" },
  { icon: FiShield, title: "2-Year Warranty", desc: "Full protection included" },
  { icon: FiRefreshCw, title: "30-Day Returns", desc: "No questions asked" },
  { icon: FiMail, title: "24/7 AI Support", desc: "Instant help, anytime" },
];

export default function Home() {
  const scrollerRef = useRef(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { products, categories, loading } = useProducts();

  const featured = useMemo(() => products.slice(0, 8), [products]);
  const newArrivals = useMemo(
    () => products.filter((p) => p.isNew).concat(products.slice(0, 4)),
    [products]
  );

  const scrollBy = (dir) => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <Layout>
      <Head>
        <title>Fulhar — Premium AI-Powered Tech Store</title>
        <meta
          name="description"
          content="Fulhar is a premium AI-powered ecommerce store for next-generation tech: audio, wearables, computing, smart home, and more."
        />
      </Head>

      {/* HERO — pulled up by the navbar's own height (96px) so it fills the full
          viewport from the very top, with the transparent navbar floating on top of it. */}
      <div className="-mt-24">
        <EditorialHero products={products} maxSlides={5} />
      </div>

      {/* PERKS */}
      <section className="border-y border-white/10 bg-ink-800/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
          {perks.map((perk, i) => (
            <RevealSection
              key={perk.title}
              className="in-view flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left"
              delay={i * 80}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold-300">
                <perk.icon size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-cream">{perk.title}</p>
                <p className="text-xs text-cream/45">{perk.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="mx-auto max-w-7xl px-6 py-24">
        <RevealSection className="in-view mx-auto max-w-xl text-center">
          <span className="section-label">Categories</span>
          <h2 className="mt-4 font-display text-3xl font-bold text-cream sm:text-4xl">
            Shop by <span className="gold-text">Category</span>
          </h2>
          <p className="mt-3 text-cream/55">
            Six curated collections spanning everything from immersive audio to intelligent
            security.
          </p>
        </RevealSection>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {categories.map((cat, i) => {
            const decor = CATEGORY_DECOR[slugify(cat.name)] || DEFAULT_CATEGORY_DECOR;
            return (
              <RevealSection key={cat.id} delay={i * 90} className="in-view">
                <Link
                  href={`/products?category=${cat.id}`}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-2xl border border-white/10"
                >
                  <Image
                    src={decor.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent transition-opacity group-hover:from-ink-950/95" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-display text-lg font-bold text-cream">{cat.name}</h3>
                    <p className="text-xs text-cream/60">{decor.tagline}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-300 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                      Explore <FiArrowUpRight />
                    </span>
                  </div>
                </Link>
              </RevealSection>
            );
          })}
          {!loading && categories.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-cream/45">
              No categories yet — check back soon.
            </p>
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <RevealSection className="in-view flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="section-label">Handpicked</span>
            <h2 className="mt-4 font-display text-3xl font-bold text-cream sm:text-4xl">
              Featured <span className="gold-text">Products</span>
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-gold-300 hover:gap-2 transition-all"
          >
            View all products <FiArrowRight />
          </Link>
        </RevealSection>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
          {!loading && featured.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-cream/45">
              No products yet — check back soon.
            </p>
          )}
        </div>
      </section>

      {/* NEW ARRIVALS - horizontal scroll */}
      <section id="new-arrivals" className="mx-auto max-w-7xl px-6 py-16">
        <RevealSection className="in-view flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="section-label">Just Dropped</span>
            <h2 className="mt-4 font-display text-3xl font-bold text-cream sm:text-4xl">
              New <span className="gold-text">Arrivals</span>
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollBy(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-cream/70 transition-colors hover:border-gold-400 hover:text-gold-300"
              aria-label="Scroll left"
            >
              <FiChevronLeft />
            </button>
            <button
              onClick={() => scrollBy(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-cream/70 transition-colors hover:border-gold-400 hover:text-gold-300"
              aria-label="Scroll right"
            >
              <FiChevronRight />
            </button>
          </div>
        </RevealSection>

        <div
          ref={scrollerRef}
          className="mt-10 flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {newArrivals.map((product, i) => (
            <div key={`${product.id}-${i}`} className="w-64 shrink-0 snap-start sm:w-72">
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="relative overflow-hidden border-y border-white/10 bg-ink-800/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <RevealSection className="in-view mx-auto max-w-xl text-center">
            <span className="section-label">Testimonials</span>
            <h2 className="mt-4 font-display text-3xl font-bold text-cream sm:text-4xl">
              Loved by <span className="gold-text">Thousands</span>
            </h2>
          </RevealSection>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <RevealSection
                key={t.id}
                delay={i * 100}
                className="in-view card-surface p-7 transition-transform duration-500 hover:-translate-y-1.5"
              >
                <StarRating rating={t.rating} size={16} />
                <p className="mt-4 text-sm leading-relaxed text-cream/75">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="relative h-11 w-11 overflow-hidden rounded-full border border-gold-500/30">
                    <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-cream">{t.name}</p>
                    <p className="text-xs text-cream/45">{t.role}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <RevealSection className="in-view relative overflow-hidden rounded-[2rem] border border-gold-500/20 bg-ink-800/60 px-6 py-16 text-center sm:px-16">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gold-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-gold-500/15 blur-3xl" />
          <div className="relative">
            <span className="section-label">Stay in the loop</span>
            <h2 className="mt-5 font-display text-3xl font-bold text-cream sm:text-4xl">
              Get <span className="gold-text">10% Off</span> Your First Order
            </h2>
            <p className="mx-auto mt-3 max-w-md text-cream/55">
              Subscribe for early access to new drops, exclusive deals, and AI-curated picks.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-gold-500/50"
              />
              <button type="submit" className="btn-gold">
                {subscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </form>
          </div>
        </RevealSection>
      </section>
    </Layout>
  );
}
