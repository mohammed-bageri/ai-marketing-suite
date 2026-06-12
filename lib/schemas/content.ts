import { z } from 'zod'

export const contentTypes = ['blog', 'linkedin', 'ad', 'email'] as const
export type ContentType = (typeof contentTypes)[number]

export const tones = [
  'professional',
  'casual',
  'witty',
  'bold',
  'friendly',
  'authoritative'
] as const
export type Tone = (typeof tones)[number]

export const contentTypeLabels: Record<ContentType, string> = {
  blog: 'Blog post',
  linkedin: 'LinkedIn post',
  ad: 'Ad copy',
  email: 'Email'
}

export const toneLabels: Record<Tone, string> = {
  professional: 'Professional',
  casual: 'Casual',
  witty: 'Witty',
  bold: 'Bold',
  friendly: 'Friendly',
  authoritative: 'Authoritative'
}

/** Input for POST /api/content — shared by the route validator and the form. */
export const createContentSchema = z.object({
  contentType: z.enum(contentTypes),
  topic: z.string().min(3, 'Topic is too short').max(200, 'Topic is too long'),
  tone: z.enum(tones),
  audience: z.string().min(2, 'Describe the audience').max(120, 'Audience is too long')
})
export type CreateContentInput = z.infer<typeof createContentSchema>

/* Per-type structured output schemas — distinct shapes per content type. */

export const blogResultSchema = z.object({
  title: z.string(),
  metaDescription: z.string(),
  body: z.string(),
  tags: z.array(z.string())
})
export type BlogResult = z.infer<typeof blogResultSchema>

export const linkedinResultSchema = z.object({
  body: z.string(),
  hashtags: z.array(z.string())
})
export type LinkedinResult = z.infer<typeof linkedinResultSchema>

export const adResultSchema = z.object({
  headline: z.string(),
  primaryText: z.string(),
  description: z.string(),
  cta: z.string()
})
export type AdResult = z.infer<typeof adResultSchema>

export const emailResultSchema = z.object({
  subject: z.string(),
  preheader: z.string(),
  body: z.string(),
  cta: z.string()
})
export type EmailResult = z.infer<typeof emailResultSchema>

export const contentResultSchemas = {
  blog: blogResultSchema,
  linkedin: linkedinResultSchema,
  ad: adResultSchema,
  email: emailResultSchema
} as const

export type ContentResult = BlogResult | LinkedinResult | AdResult | EmailResult
