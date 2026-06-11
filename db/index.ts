import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import { env } from '@/lib/env'
import { schema } from './schema'

/**
 * Drizzle client backed by Neon's HTTP driver — a good fit for Vercel's
 * serverless functions where long-lived TCP pools are wasteful.
 */
const sql = neon(env.DATABASE_URL)

export const db = drizzle(sql, { schema })

export * from './schema'
