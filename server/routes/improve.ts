import { Hono } from 'hono'

import { improveSchema } from '@/lib/schemas/improve'
import { validate } from '@/server/lib/validate'
import { requireAuth, type AuthVariables } from '@/server/middleware/auth'
import { rateLimit } from '@/server/middleware/rate-limit'
import { improveContent } from '@/server/services/improve/improve'

export const improveRouter = new Hono<{ Variables: AuthVariables }>().post(
  '/',
  requireAuth,
  rateLimit({ name: 'improve', limit: 15, windowMs: 60_000 }),
  validate('json', improveSchema),
  async (c) => {
    const row = await improveContent(c.get('user').id, c.req.valid('json'))
    return c.json(row, 201)
  }
)
