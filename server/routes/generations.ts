import { Hono } from 'hono'
import { z } from 'zod'

import { contentTypes } from '@/lib/schemas/content'
import { createImageSchema } from '@/lib/schemas/image'
import { notFound } from '@/server/lib/errors'
import { paginated, paginationQuerySchema } from '@/server/lib/pagination'
import { validate } from '@/server/lib/validate'
import { requireAuth, type AuthVariables } from '@/server/middleware/auth'
import { rateLimit } from '@/server/middleware/rate-limit'
import { generateGenerationImage } from '@/server/services/image/generate'
import {
  deleteGeneration,
  getGenerationWithImages,
  getOwnedGeneration,
  listGenerationImages,
  listGenerations
} from '@/server/services/generations/repo'

const listQuerySchema = paginationQuerySchema.extend({
  contentType: z.enum([...contentTypes, 'improvement']).optional(),
  q: z.string().trim().min(1).max(120).optional()
})

const idParam = z.object({ id: z.string().min(1) })

export const generationsRouter = new Hono<{ Variables: AuthVariables }>()
  .use('*', requireAuth)
  // List (paginated, filterable).
  .get('/', validate('query', listQuerySchema), async (c) => {
    const { page, pageSize, contentType, q } = c.req.valid('query')
    const { items, total } = await listGenerations(c.get('user').id, {
      page,
      pageSize,
      contentType,
      q
    })
    return c.json(paginated(items, total, page, pageSize))
  })
  // Read one (with images).
  .get('/:id', validate('param', idParam), async (c) => {
    const generation = await getGenerationWithImages(c.get('user').id, c.req.valid('param').id)
    if (!generation) throw notFound('Generation not found')
    return c.json(generation)
  })
  // Delete (cascades images + Blob assets).
  .delete('/:id', validate('param', idParam), async (c) => {
    const ok = await deleteGeneration(c.get('user').id, c.req.valid('param').id)
    if (!ok) throw notFound('Generation not found')
    return c.json({ success: true as const })
  })
  // List images for a generation.
  .get('/:id/images', validate('param', idParam), async (c) => {
    const generation = await getOwnedGeneration(c.get('user').id, c.req.valid('param').id)
    if (!generation) throw notFound('Generation not found')
    return c.json(await listGenerationImages(generation.id))
  })
  // Generate / regenerate an image (server builds the prompt).
  .post(
    '/:id/images',
    rateLimit({ name: 'image', limit: 10, windowMs: 60_000 }),
    validate('param', idParam),
    validate('json', createImageSchema),
    async (c) => {
      const generation = await getOwnedGeneration(c.get('user').id, c.req.valid('param').id)
      if (!generation) throw notFound('Generation not found')
      const image = await generateGenerationImage(generation, c.req.valid('json').style)
      return c.json(image, 201)
    }
  )
