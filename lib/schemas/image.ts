import { z } from 'zod'

export const imageStyles = [
  'minimal',
  'photographic',
  '3d_render',
  'illustration',
  'corporate',
  'bold_gradient'
] as const
export type ImageStyle = (typeof imageStyles)[number]

export const imageStyleLabels: Record<ImageStyle, string> = {
  minimal: 'Minimal',
  photographic: 'Photographic',
  '3d_render': '3D render',
  illustration: 'Illustration',
  corporate: 'Corporate',
  bold_gradient: 'Bold gradient'
}

/** Input for POST /api/generations/:id/images. */
export const createImageSchema = z.object({
  style: z.enum(imageStyles).default('minimal')
})
export type CreateImageInput = z.infer<typeof createImageSchema>
