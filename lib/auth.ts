import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { emailOTP } from 'better-auth/plugins'

import { db } from '@/db'
import { schema } from '@/db/schema'
import { env } from '@/lib/env'
import { sendOtpEmail } from '@/lib/email'
import { deleteUserImages } from '@/server/services/generations/repo'

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema
  }),
  user: {
    deleteUser: {
      // Allow self-service account deletion (cascades generations + images via FKs).
      enabled: true,
      // Clean up the user's stored images first so we don't orphan Blob assets.
      beforeDelete: async (user) => {
        await deleteUserImages(user.id)
      }
    }
  },
  // Abuse protection in production: throttle OTP sends + sign-in attempts.
  rateLimit: {
    enabled: env.NODE_ENV === 'production',
    window: 60,
    max: 100,
    customRules: {
      '/email-otp/send-verification-otp': { window: 60, max: 3 },
      '/sign-in/email-otp': { window: 60, max: 10 }
    }
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
