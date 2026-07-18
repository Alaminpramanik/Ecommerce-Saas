import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import StarRating from "./StarRating";
import { useStore } from "../context/StoreContext";
import useReveal from "./useReveal";

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const wishlisted = isWishlisted(product.id);
  const ref = useReveal();

  return (
    <div
      ref={ref}
      className="group reveal relative rounded-2xl border border-white/10 bg-ink-800/50 p-3 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-500/40 hover:shadow-gold"
      style={{ animationDelay: `${(index % 8) * 80}ms` }}
    >
      <button
        onClick={() => toggleWishlist(product)}
        aria-label="Toggle wishlist"
        className={`absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
          wishlisted
            ? "bg-gold-500 text-ink-950"
            : "bg-ink-950/60 text-cream hover:bg-gold-500 hover:text-ink-950"
        }`}
      >
        <FiHeart className={wishlisted ? "fill-current" : ""} />
      </button>

      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-ink-700">
          <Image
            src={product.images ? product.images[0] : product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          {product.isNew && (
            <span className="absolute left-3 top-3 rounded-full bg-gold-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-950">
              New
            </span>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="absolute inset-x-3 bottom-3 flex translate-y-16 items-center justify-center gap-2 rounded-xl bg-cream/95 py-2.5 text-sm font-semibold text-ink-950 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <FiShoppingBag /> Add to Cart
          </button>
        </div>

        <div className="mt-4 space-y-1.5 px-1 pb-1">
          <p className="text-[11px] uppercase tracking-widest text-gold-400/80">
            {product.category?.replace("-", " ")}
          </p>
          <h3 className="font-display font-semibold text-cream line-clamp-1">{product.name}</h3>
          <StarRating rating={product.rating} showValue />
          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-display text-lg font-bold text-gold-300">${product.price}</span>
            {product.oldPrice && (
              <span className="text-sm text-cream/40 line-through">${product.oldPrice}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
