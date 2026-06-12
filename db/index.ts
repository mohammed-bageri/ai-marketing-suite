import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '@/lib/env'
import { schema } from './schema'

/**
 * Drizzle client backed by postgres.js. Works against a local Docker Postgres
 * (see docker-compose.yml) and against Neon in production using its standard
 * connection string.
 *
 * `max: 1` + `prepare: false` keep it serverless-friendly and compatible with
 * connection poolers (Neon pooler / pgbouncer).
 */
const client = postgres(env.DATABASE_URL, { max: 1, prepare: false })

export const db = drizzle(client, { schema })

export * from './schema'
