import { Resend } from 'resend'

import { env } from '@/lib/env'

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

type OtpEmailArgs = {
  email: string
  otp: string
  type: 'sign-in' | 'email-verification' | 'forget-password' | 'change-email'
}

/**
 * Sends the login one-time code. When no Resend key is configured (local dev),
 * we log the code to the server console so the flow stays testable without a verified domain.
 */
export async function sendOtpEmail({ email, otp, type }: OtpEmailArgs) {
  if (!resend) {
    console.info(`[email:dev] OTP for ${email} (${type}): ${otp}`)
    return
  }

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Your AI Marketing Suite login code',
    text: `Your verification code is ${otp}. It expires in 5 minutes.`
  })
}
