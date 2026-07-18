import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { FiSliders, FiX, FiChevronDown } from "react-icons/fi";
import Layout from "../../components/Layout";
import ProductCard from "../../components/ProductCard";
import { useProducts } from "../../context/ProductsContext";

const sortOptions = [
  { id: "popular", label: "Most Popular" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
];

const PRICE_MAX = 3500;

export default function ProductsPage() {
  const router = useRouter();
  const { products, categories, loading } = useProducts();
  const [activeCategories, setActiveCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(PRICE_MAX);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("popular");
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    const { category, search: searchQuery } = router.query;
    if (category) setActiveCategories([Number(category)]);
    if (searchQuery) setSearch(searchQuery);
  }, [router.isReady, router.query]);

  const toggleCategory = (id) => {
    setActiveCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (activeCategories.length) {
      list = list.filter((p) => activeCategories.includes(Number(p.categoryId)));
    }

    list = list.filter((p) => p.price <= priceRange);
    list = list.filter((p) => p.rating >= minRating);

    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.sort((a, b) => (b.isNew === a.isNew ? 0 : b.isNew ? 1 : -1));
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return list;
  }, [products, search, activeCategories, priceRange, minRating, sortBy]);

  const clearFilters = () => {
    setActiveCategories([]);
    setPriceRange(PRICE_MAX);
    setMinRating(0);
    setSearch("");
  };

  const FiltersPanel = (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-gold-300">
          Category
        </h3>
        <div className="mt-4 space-y-2.5">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex cursor-pointer items-center gap-3 text-sm text-cream/70 hover:text-cream"
            >
              <input
                type="checkbox"
                checked={activeCategories.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
                className="h-4 w-4 rounded border-white/20 bg-transparent accent-gold-500"
              />
              {cat.name}
            </label>
          ))}
          {categories.length === 0 && <p className="text-sm text-cream/40">No categories yet.</p>}
        </div>
      </div>

      <div>
        <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-gold-300">
          Price Range
        </h3>
        <input
          type="range"
          min={0}
          max={PRICE_MAX}
          step={10}
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="mt-5 w-full accent-gold-500"
        />
        <div className="mt-2 flex justify-between text-xs text-cream/50">
          <span>$0</span>
          <span className="font-semibold text-gold-300">${priceRange}</span>
        </div>
      </div>

      <div>
        <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-gold-300">
          Minimum Rating
        </h3>
        <div className="mt-4 flex flex-col gap-2">
          {[4.5, 4, 3, 0].map((r) => (
            <label
              key={r}
              className="flex cursor-pointer items-center gap-3 text-sm text-cream/70 hover:text-cream"
            >
              <input
                type="radio"
                name="rating"
                checked={minRating === r}
                onChange={() => setMinRating(r)}
                className="h-4 w-4 border-white/20 bg-transparent accent-gold-500"
              />
              {r === 0 ? "Any rating" : `${r}+ stars`}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={clearFilters}
        className="w-full rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-cream/70 transition-colors hover:border-gold-400 hover:text-gold-300"
      >
        Clear Filters
      </button>
    </div>
  );

  return (
    <Layout>
      <Head>
        <title>Shop All Products — Fulhar</title>
      </Head>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="reveal in-view">
          <span className="section-label">Full Catalog</span>
          <h1 className="mt-4 font-display text-3xl font-bold text-cream sm:text-4xl">
            Shop <span className="gold-text">All Products</span>
          </h1>
          <p className="mt-2 text-sm text-cream/50">
            {loading ? "Loading products…" : `${filtered.length} products found`}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="card-surface sticky top-28 p-6">{FiltersPanel}</div>
          </aside>

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="btn-outline !py-2.5 !px-4 text-sm lg:hidden"
              >
                <FiSliders /> Filters
              </button>

              <div className="relative ml-auto">
                <button
                  onClick={() => setSortOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream/80 hover:border-gold-400"
                >
                  Sort: {sortOptions.find((s) => s.id === sortBy)?.label}
                  <FiChevronDown className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                </button>
                {sortOpen && (
                  <div className="glass-strong absolute right-0 top-12 z-30 w-56 rounded-2xl p-2 shadow-glass">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortBy(opt.id);
                          setSortOpen(false);
                        }}
                        className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${
                          sortBy === opt.id ? "bg-gold-500/15 text-gold-300" : "text-cream/75 hover:bg-white/5"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="card-surface flex flex-col items-center justify-center gap-3 py-24 text-center">
                <p className="font-display text-lg font-semibold text-cream">No products found</p>
                <p className="text-sm text-cream/50">Try adjusting your filters or search term.</p>
                <button onClick={clearFilters} className="btn-gold mt-2 !px-5 !py-2.5 text-sm">
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {filtersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-ink-900 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-cream">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} className="text-cream/60">
                <FiX size={22} />
              </button>
            </div>
            {FiltersPanel}
          </div>
        </div>
      )}
    </Layout>
  );
}
