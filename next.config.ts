import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Cache prefetched dynamic routes for 30s so sidebar link clicks feel instant.
    // Next.js 15 defaults to 0 (immediately stale) — this is the fix.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  devIndicators: false,
}

export default nextConfig
