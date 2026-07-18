import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

export default function StarRating({ rating = 0, size = 14, showValue = false }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5 text-gold-400" style={{ fontSize: size }}>
        {Array.from({ length: full }).map((_, i) => (
          <FaStar key={`f-${i}`} />
        ))}
        {hasHalf && <FaStarHalfAlt />}
        {Array.from({ length: empty }).map((_, i) => (
          <FaRegStar key={`e-${i}`} className="text-gold-400/30" />
        ))}
      </div>
      {showValue && <span className="text-xs text-cream/60">{rating.toFixed(1)}</span>}
    </div>
  );
}
