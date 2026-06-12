import { Hono } from 'hono'

import { requireAuth, type AuthVariables } from '@/server/middleware/auth'
import { getUserStats } from '@/server/services/stats'

export const statsRouter = new Hono<{ Variables: AuthVariables }>().get(
  '/',
  requireAuth,
  async (c) => {
    return c.json(await getUserStats(c.get('user').id))
  }
)
