// Decorative content that has no equivalent in the backend (category imagery/taglines,
// customer testimonials). Real catalog data (products/categories) comes from the API
// via ProductsContext — see lib/api.js and context/ProductsContext.js.

export const CATEGORY_DECOR = {
  audio: {
    tagline: "Immersive sound tech",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  wearables: {
    tagline: "AI on your wrist",
    image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=800&q=80",
  },
  computing: {
    tagline: "Power for creators",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  },
  "smart-home": {
    tagline: "Automate your space",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
  },
  accessories: {
    tagline: "Everyday essentials",
    image: "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&w=800&q=80",
  },
  cameras: {
    tagline: "Capture in 8K",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
  },
};

export const DEFAULT_CATEGORY_DECOR = {
  tagline: "Explore the collection",
  image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
};

export const testimonials = [
  {
    id: 1,
    name: "Amelia Frost",
    role: "Creative Director",
    quote:
      "The build quality feels like it belongs in a design museum. Every product I've ordered has exceeded what the photos promised.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    rating: 5,
  },
  {
    id: 2,
    name: "Marcus Chen",
    role: "Product Engineer",
    quote:
      "Fast checkout, faster shipping, and the AI recommendations actually understood what I needed. Genuinely impressive experience.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    rating: 5,
  },
  {
    id: 3,
    name: "Sofia Reyes",
    role: "Founder, Reyes Studio",
    quote:
      "It's rare to find a store this polished. The gold-on-black aesthetic alone makes unboxing feel like an event.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    rating: 4.9,
  },
];
