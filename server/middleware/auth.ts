import { createMiddleware } from 'hono/factory'

import { auth, type Session } from '@/lib/auth'
import { unauthorized } from '@/server/lib/errors'

export type AuthVariables = {
  user: Session['user']
  session: Session['session']
}

/**
 * Gate for protected routes. Loads the Better Auth session from the request
 * cookies; throws 401 when absent. On success, exposes `user`/`session` on the
 * Hono context so handlers can scope every query to the signed-in user.
 */
export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const data = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!data?.session) {
    throw unauthorized()
  }

  c.set('user', data.user)
  c.set('session', data.session)
  await next()
})
