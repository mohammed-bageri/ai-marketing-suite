import { boolean, index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import type { ContentType } from '@/lib/schemas/content'
import type { ImprovementGoal } from '@/lib/schemas/improve'
import type { ImageStyle } from '@/lib/schemas/image'
import type { GenerationResult } from '@/lib/schemas'

/**
 * Better Auth core tables.
 * The email-OTP plugin reuses the `verification` table for one-time codes,
 * so no extra table is needed for OTP.
 */

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified')
    .$defaultFn(() => false)
    .notNull(),
  image: text('image'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .notNull()
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date())
})

/**
 * A saved generation — either AI-generated content (PRD 03) or an AI improvement
 * (PRD 06). One unified history. `result` holds the structured, type-specific output;
 * `plainText` is the flattened text for search / copy / download.
 */
export const generations = pgTable(
  'generations',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    source: text('source').$type<'generated' | 'improved'>().default('generated').notNull(),
    contentType: text('content_type').$type<ContentType | 'improvement'>().notNull(),
    topic: text('topic'),
    tone: text('tone'),
    audience: text('audience'),
    goal: text('goal').$type<ImprovementGoal>(),
    result: jsonb('result').$type<GenerationResult>().notNull(),
    plainText: text('plain_text').notNull(),
    model: text('model'),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull()
  },
  (t) => [index('generations_user_created_idx').on(t.userId, t.createdAt)]
)

/**
 * AI images attached to a generation. Each regenerate adds a row, so a generation
 * keeps its full image history; the newest is shown by default.
 */
export const generationImages = pgTable(
  'generation_images',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    generationId: text('generation_id')
      .notNull()
      .references(() => generations.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    style: text('style').$type<ImageStyle>().notNull(),
    prompt: text('prompt').notNull(),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull()
  },
  (t) => [index('generation_images_generation_idx').on(t.generationId)]
)

export type Generation = typeof generations.$inferSelect
export type GenerationImage = typeof generationImages.$inferSelect

export const schema = {
  user,
  session,
  account,
  verification,
  generations,
  generationImages
}
