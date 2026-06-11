import { Hono } from 'hono'

import { auth } from '@/lib/auth'

/**
 * Single Hono application mounted under /api via the Next.js catch-all route.
 * Feature routers (content, image, improve, history) are chained here as they land,
 * and the exported `AppType` powers the end-to-end typed RPC client.
 */
const app = new Hono().basePath('/api')

// `routes` exists purely to capture the chained type for the RPC client below.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  // Better Auth owns everything under /api/auth/* (sign-in, OTP, session, sign-out).
  .on(['POST', 'GET'], '/auth/*', (c) => auth.handler(c.req.raw))
  // Liveness probe.
  .get('/health', (c) => c.json({ status: 'ok' as const }))

export { app }
export type AppType = typeof routes
