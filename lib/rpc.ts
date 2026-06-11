import { hc } from 'hono/client'

import { env } from '@/lib/env'
import type { AppType } from '@/server/app'

/**
 * Fully typed RPC client. Calling `client.api.health.$get()` is checked against
 * the server's route definitions, so request/response shapes can never drift.
 */
export const client = hc<AppType>(env.NEXT_PUBLIC_APP_URL)
