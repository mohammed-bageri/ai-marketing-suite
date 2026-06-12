import type { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'

import { ApiError } from '@/server/lib/errors'

/**
 * Single error handler for the whole API. Maps known errors to the standard
 * envelope `{ error: { message, code? } }`; never leaks stacks or secrets.
 */
export const onError: ErrorHandler = (err, c) => {
  if (err instanceof ApiError) {
    return c.json({ error: { message: err.message, code: err.code } }, err.status)
  }

  if (err instanceof ZodError) {
    return c.json(
      { error: { message: err.issues[0]?.message ?? 'Invalid input', code: 'validation_error' } },
      400
    )
  }

  if (err instanceof HTTPException) {
    return c.json({ error: { message: err.message } }, err.status)
  }

  console.error('[api] unhandled error:', err)
  return c.json({ error: { message: 'Internal server error' } }, 500)
}
