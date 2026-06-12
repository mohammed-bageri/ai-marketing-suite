import type { NextConfig } from 'next'

// Permissive on inline script/style because Next.js injects inline bootstrap +
// next/font styles without nonces; still restricts sources, framing, and form
// actions. Generated content is sanitized markdown (no raw HTML), so the main
// XSS vector is already closed.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'"
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  }
]

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray lockfile exists in the home dir).
  turbopack: { root: import.meta.dirname },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**.public.blob.vercel-storage.com' }]
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  }
}

export default nextConfig
