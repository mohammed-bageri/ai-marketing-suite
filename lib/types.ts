import type { GenerationResult } from '@/lib/schemas'
import type { ContentType } from '@/lib/schemas/content'
import type { ImageStyle } from '@/lib/schemas/image'
import type { ImprovementGoal } from '@/lib/schemas/improve'

/** Client-facing shapes (JSON over the wire — dates are ISO strings). */

export type GenerationImageDTO = {
  id: string
  generationId: string
  userId: string
  url: string
  style: ImageStyle
  prompt: string
  createdAt: string
}

export type GenerationDTO = {
  id: string
  source: 'generated' | 'improved'
  contentType: ContentType | 'improvement'
  topic: string | null
  tone: string | null
  audience: string | null
  goal: ImprovementGoal | null
  result: GenerationResult
  plainText: string
  model: string | null
  createdAt: string
}

export type GenerationDetailDTO = GenerationDTO & { images: GenerationImageDTO[] }

export type GenerationListItem = {
  id: string
  source: 'generated' | 'improved'
  contentType: ContentType | 'improvement'
  topic: string | null
  tone: string | null
  goal: ImprovementGoal | null
  createdAt: string
  previewText: string
  imageUrl: string | null
}

export type Paginated<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type StatsDTO = {
  totalGenerations: number
  totalImages: number
  thisWeek: number
  byType: { contentType: ContentType | 'improvement'; count: number }[]
}
