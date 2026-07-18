/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Next's image optimizer proxies remote images server-side; inside docker-compose
    // that would mean the frontend container resolving "localhost:8000" as itself
    // instead of the backend. Skip optimization and let the browser load images directly.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "web" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
};

module.exports = nextConfig;
