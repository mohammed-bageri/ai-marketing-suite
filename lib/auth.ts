import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { emailOTP } from 'better-auth/plugins'

import { db } from '@/db'
import { schema } from '@/db/schema'
import { env } from '@/lib/env'
import { sendOtpEmail } from '@/lib/email'

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema
  }),
  user: {
    // Allow self-service account deletion (cascades generations + images via FKs).
    deleteUser: { enabled: true }
  },
  plugins: [
    // Passwordless email login: users receive a one-time code instead of a password.
    emailOTP({
      otpLength: 6,
      expiresIn: 5 * 60,
      async sendVerificationOTP({ email, otp, type }) {
        await sendOtpEmail({ email, otp, type })
      }
    }),
    // Must stay last — handles cookie writes inside Next.js server actions/route handlers.
    nextCookies()
  ]
})

export type Session = typeof auth.$Infer.Session
