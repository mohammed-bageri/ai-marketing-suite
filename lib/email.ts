import nodemailer from 'nodemailer'
import { Resend } from 'resend'

import { env } from '@/lib/env'

const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: (env.SMTP_PORT ?? 587) === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
    })
  : null

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

type OtpEmailArgs = {
  email: string
  otp: string
  type: 'sign-in' | 'email-verification' | 'forget-password' | 'change-email'
}

/**
 * Delivers the login one-time code. Resolves the first configured transport:
 *   1. SMTP (nodemailer) — any free provider; locally points at Mailpit
 *   2. Resend (RESEND_API_KEY)
 *   3. Console log — dev fallback so the flow works with no email setup
 */
export async function sendOtpEmail({ email, otp, type }: OtpEmailArgs) {
  const subject = 'Your AI Marketing Suite login code'
  const text = `Your verification code is ${otp}. It expires in 5 minutes.`

  if (transporter) {
    await transporter.sendMail({ from: env.EMAIL_FROM, to: email, subject, text })
    return
  }

  if (resend) {
    await resend.emails.send({ from: env.EMAIL_FROM, to: email, subject, text })
    return
  }

  console.info(`[email:dev] OTP for ${email} (${type}): ${otp}`)
}
