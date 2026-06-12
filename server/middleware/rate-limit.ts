import { createMiddleware } from 'hono/factory'

import { ApiError } from '@/server/lib/errors'
import type { AuthVariables } from '@/server/middleware/auth'

type Bucket = { count: number; resetAt: number }

/**
 * In-memory fixed-window rate limiter, keyed by user (falls back to IP).
 *
 * Note: per-instance only. It throttles bursts from a single warm serverless
 * instance — enough to cap runaway AI/cost abuse here. For multi-region scale,
 * back this with Redis/Postgres.
 */
const buckets = new Map<string, Bucket>()

function prune(now: number) {
  if (buckets.size < 10_000) return
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key)
  }
}

export function rateLimit(opts: { name: string; limit: number; windowMs: number }) {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const identifier =
      c.get('user')?.id ?? c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous'
    const key = `${opts.name}:${identifier}`
    const now = Date.now()
    prune(now)

    const bucket = buckets.get(key)
    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + opts.windowMs })
    } else if (bucket.count >= opts.limit) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
      c.header('Retry-After', String(retryAfter))
      throw new ApiError(
        429,
        `Too many requests. Please wait ${retryAfter}s and try again.`,
        'rate_limited'
      )
    } else {
      bucket.count += 1
    }

    await next()
  })
}
