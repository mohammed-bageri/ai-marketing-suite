import type { ContentType } from '@/lib/schemas/content'
import type { ImageStyle } from '@/lib/schemas/image'

const styleModifiers: Record<ImageStyle, string> = {
  minimal:
    'clean minimalist composition, lots of negative space, restrained monochrome / muted palette, simple geometric shapes, elegant and modern',
  photographic:
    'high-quality editorial photograph, natural lighting, shallow depth of field, realistic textures, professional camera look',
  '3d_render':
    'polished 3D render, soft studio lighting, subtle gradients, glossy materials, modern product-design aesthetic',
  illustration:
    'flat vector illustration, bold clean shapes, cohesive limited color palette, friendly modern editorial style',
  corporate:
    'professional corporate visual, clean and trustworthy, blue-leaning neutral palette, business-appropriate, abstract and non-literal',
  bold_gradient:
    'vibrant bold gradient background, dynamic abstract shapes, high energy, contemporary tech-brand aesthetic'
}

const toneMood: Record<string, string> = {
  professional: 'composed, confident mood',
  casual: 'light, approachable mood',
  witty: 'playful, clever mood',
  bold: 'high-contrast, striking mood',
  friendly: 'warm, inviting mood',
  authoritative: 'serious, premium mood'
}

const compositionByType: Record<ContentType | 'improvement', string> = {
  blog: 'a wide hero banner concept that illustrates the topic',
  linkedin: 'a clean, conceptual square graphic suitable for a professional feed',
  ad: 'a product-forward, attention-grabbing visual that supports the offer',
  email: 'a friendly header visual that complements the message',
  improvement: 'a clean conceptual graphic that illustrates the topic'
}

type BuildArgs = {
  topic: string | null
  tone: string | null
  contentType: ContentType | 'improvement'
  summary: string
  style: ImageStyle
}

/**
 * Builds the image prompt server-side from the content's topic, tone, type, and a
 * short summary of the generated text — plus the chosen style. The user never writes this.
 */
export function buildImagePrompt({ topic, tone, contentType, summary, style }: BuildArgs): string {
  const subject = topic?.trim() || summary.slice(0, 160)
  const mood = tone ? (toneMood[tone] ?? '') : ''

  return [
    `Create ${compositionByType[contentType]}.`,
    `Subject: ${subject}.`,
    summary ? `Context: ${summary.slice(0, 280)}.` : '',
    mood ? `Mood: ${mood}.` : '',
    `Style: ${styleModifiers[style]}.`,
    'Do not include any text, words, letters, logos, or watermarks in the image.'
  ]
    .filter(Boolean)
    .join(' ')
}
