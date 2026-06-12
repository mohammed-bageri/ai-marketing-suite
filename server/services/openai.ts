import OpenAI from 'openai'

import { env } from '@/lib/env'

/** Shared OpenAI client. Server-only — never import this from a client component. */
export const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

/** Text model for content generation + improvement. */
export const TEXT_MODEL = 'gpt-4o'

/** Image model. `gpt-image-1` returns base64 we persist to Vercel Blob. */
export const IMAGE_MODEL = 'gpt-image-1'
