import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray lockfile exists in the home dir).
  turbopack: { root: import.meta.dirname },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**.public.blob.vercel-storage.com' }]
  }
}

export default nextConfig
