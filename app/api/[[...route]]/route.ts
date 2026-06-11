import { handle } from 'hono/vercel'

import { app } from '@/server/app'

// Better Auth and the Neon driver rely on Node APIs, so pin this to the Node.js runtime.
export const runtime = 'nodejs'

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)
