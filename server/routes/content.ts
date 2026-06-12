import { Hono } from 'hono'

import { createContentSchema } from '@/lib/schemas/content'
import { validate } from '@/server/lib/validate'
import { requireAuth, type AuthVariables } from '@/server/middleware/auth'
import { generateContent } from '@/server/services/content/generate'

export const contentRouter = new Hono<{ Variables: AuthVariables }>().post(
  '/',
  requireAuth,
  validate('json', createContentSchema),
  async (c) => {
    const row = await generateContent(c.get('user').id, c.req.valid('json'))
    return c.json(row, 201)
  }
)
