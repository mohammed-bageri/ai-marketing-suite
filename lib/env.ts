import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

/**
 * Validated, type-safe environment variables.
 * Importing this module throws at startup if any required var is missing or malformed,
 * so we never ship a build that silently lacks a key.
 */
export const env = createEnv({
  server: {
    // Neon Postgres connection string (pooled, used at runtime).
    DATABASE_URL: z.string().url(),

    // Better Auth.
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),

    // OpenAI — powers both text generation/improvement and image generation.
    OPENAI_API_KEY: z.string().min(1),

    // Resend — delivers the email OTP. Optional in dev (we fall back to console logging).
    RESEND_API_KEY: z.string().min(1).optional(),
    EMAIL_FROM: z.string().min(1).default('AI Marketing Suite <onboarding@resend.dev>'),

    NODE_ENV: z.enum(['development', 'test', 'production']).default('development')
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url()
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
  },
  // Vercel/Next inlines NEXT_PUBLIC_ vars; allow skipping validation during lint/CI when desired.
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
  emptyStringAsUndefined: true
})
