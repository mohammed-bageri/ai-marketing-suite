import { put } from '@vercel/blob'

import { db } from '@/db'
import { generationImages, type Generation } from '@/db/schema'
import type { ImageStyle } from '@/lib/schemas/image'
import { ApiError, upstreamError } from '@/server/lib/errors'
import { blobConfigured, blobTokenOption } from '@/server/services/blob'
import { IMAGE_MODEL, openai } from '@/server/services/openai'
import { buildImagePrompt } from '@/server/services/image/prompt'

/**
 * Generates an image for a generation: builds the prompt server-side, calls the
 * image model, stores the bytes in Vercel Blob, and records the row.
 */
export async function generateGenerationImage(generation: Generation, style: ImageStyle) {
  if (!blobConfigured) {
    throw new ApiError(500, 'Image storage is not configured.', 'blob_not_configured')
  }

  const prompt = buildImagePrompt({
    topic: generation.topic,
    tone: generation.tone,
    contentType: generation.contentType,
    summary: generation.plainText,
    style
  })

  let base64: string | undefined
  try {
    const response = await openai.images.generate({
      model: IMAGE_MODEL,
      prompt,
      size: '1024x1024',
      n: 1
    })
    base64 = response.data?.[0]?.b64_json
  } catch (error) {
    console.error('[image] generation failed:', error)
    throw upstreamError('Image generation failed. Please try again.')
  }

  if (!base64) throw upstreamError('The image provider returned no image.')

  const blob = await put(
    `generations/${generation.id}/${crypto.randomUUID()}.png`,
    Buffer.from(base64, 'base64'),
    { access: 'public', contentType: 'image/png', ...blobTokenOption }
  )

  const [row] = await db
    .insert(generationImages)
    .values({
      generationId: generation.id,
      userId: generation.userId,
      url: blob.url,
      style,
      prompt
    })
    .returning()

  return row
}
