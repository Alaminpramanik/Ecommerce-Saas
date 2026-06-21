'use client'

import { getStarArray } from '@/lib/utils'

export default function StarRating({ rating, reviews, size = 'sm', showCount = true }) {
  const stars = getStarArray(rating)
  const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {stars.map((type, i) => (
          <svg key={i} className={`${sizeClass} flex-shrink-0`} viewBox="0 0 20 20">
            {type === 'full' && (
              <polygon
                points="10,1 12.9,7 19.5,7.6 14.7,11.8 16.2,18.5 10,14.9 3.8,18.5 5.3,11.8 0.5,7.6 7.1,7"
                fill="#f59e0b"
              />
            )}
            {type === 'half' && (
              <>
                <defs>
                  <linearGradient id={`half-${i}`}>
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#d1d5db" />
                  </linearGradient>
                </defs>
                <polygon
                  points="10,1 12.9,7 19.5,7.6 14.7,11.8 16.2,18.5 10,14.9 3.8,18.5 5.3,11.8 0.5,7.6 7.1,7"
                  fill={`url(#half-${i})`}
                />
              </>
            )}
            {type === 'empty' && (
              <polygon
                points="10,1 12.9,7 19.5,7.6 14.7,11.8 16.2,18.5 10,14.9 3.8,18.5 5.3,11.8 0.5,7.6 7.1,7"
                fill="#d1d5db"
              />
            )}
          </svg>
        ))}
      </div>
      {showCount && reviews !== undefined && (
        <span className="text-xs text-gray-500">({reviews.toLocaleString()})</span>
      )}
    </div>
  )
}
