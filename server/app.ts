import { Hono } from 'hono'

import { auth } from '@/lib/auth'
import { onError } from '@/server/middleware/error'
import type { AuthVariables } from '@/server/middleware/auth'
import { contentRouter } from '@/server/routes/content'
import { generationsRouter } from '@/server/routes/generations'
import { improveRouter } from '@/server/routes/improve'
import { statsRouter } from '@/server/routes/stats'

/**
 * Single Hono application mounted under /api via the Next.js catch-all route.
 * Feature routers are chained here; the exported `AppType` powers the typed RPC client.
 */
const app = new Hono<{ Variables: AuthVariables }>().basePath('/api')

app.onError(onError)

// `routes` exists purely to capture the chained type for the RPC client below.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  // Better Auth owns everything under /api/auth/* (sign-in, OTP, session, sign-out).
  .on(['POST', 'GET'], '/auth/*', (c) => auth.handler(c.req.raw))
  // Liveness probe.
  .get('/health', (c) => c.json({ status: 'ok' as const }))
  // Feature routers.
  .route('/content', contentRouter)
  .route('/generations', generationsRouter)
  .route('/improve', improveRouter)
  .route('/stats', statsRouter)

export { app }
export type AppType = typeof routes
