import { zValidator } from '@hono/zod-validator'
import type { ValidationTargets } from 'hono'
import type { ZodType } from 'zod'

import { badRequest } from '@/server/lib/errors'

/**
 * Thin wrapper over `@hono/zod-validator` that routes validation failures
 * through our `ApiError` → error envelope instead of the library default.
 * Keeps `c.req.valid(target)` fully typed.
 */
export const validate = <Target extends keyof ValidationTargets, Schema extends ZodType>(
  target: Target,
  schema: Schema
) =>
  zValidator(target, schema, (result) => {
    if (!result.success) {
      throw badRequest(result.error.issues[0]?.message ?? 'Invalid input', 'validation_error')
    }
  })
