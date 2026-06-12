import { del } from '@vercel/blob'
import { and, desc, eq, ilike, inArray, sql } from 'drizzle-orm'

import { db } from '@/db'
import { generationImages, generations } from '@/db/schema'
import { env } from '@/lib/env'
import type { ContentType } from '@/lib/schemas/content'
import { offset } from '@/server/lib/pagination'

type ListParams = {
  page: number
  pageSize: number
  contentType?: ContentType | 'improvement'
  q?: string
}

export async function listGenerations(userId: string, params: ListParams) {
  const conditions = [eq(generations.userId, userId)]
  if (params.contentType) conditions.push(eq(generations.contentType, params.contentType))
  if (params.q) conditions.push(ilike(generations.topic, `%${params.q}%`))
  const where = and(...conditions)

  const [counted] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(generations)
    .where(where)

  const rows = await db
    .select()
    .from(generations)
    .where(where)
    .orderBy(desc(generations.createdAt))
    .limit(params.pageSize)
    .offset(offset(params.page, params.pageSize))

  const ids = rows.map((r) => r.id)
  const images = ids.length
    ? await db
        .select()
        .from(generationImages)
        .where(inArray(generationImages.generationId, ids))
        .orderBy(desc(generationImages.createdAt))
    : []

  const latestImage = new Map<string, string>()
  for (const img of images) {
    if (!latestImage.has(img.generationId)) latestImage.set(img.generationId, img.url)
  }

  const items = rows.map((r) => ({
    id: r.id,
    source: r.source,
    contentType: r.contentType,
    topic: r.topic,
    tone: r.tone,
    goal: r.goal,
    createdAt: r.createdAt,
    previewText: r.plainText.slice(0, 180),
    imageUrl: latestImage.get(r.id) ?? null
  }))

  return { items, total: counted?.count ?? 0 }
}

export async function getOwnedGeneration(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(generations)
    .where(and(eq(generations.id, id), eq(generations.userId, userId)))
  return row ?? null
}

export async function getGenerationWithImages(userId: string, id: string) {
  const generation = await getOwnedGeneration(userId, id)
  if (!generation) return null

  const images = await db
    .select()
    .from(generationImages)
    .where(eq(generationImages.generationId, id))
    .orderBy(desc(generationImages.createdAt))

  return { ...generation, images }
}

export async function listGenerationImages(generationId: string) {
  return db
    .select()
    .from(generationImages)
    .where(eq(generationImages.generationId, generationId))
    .orderBy(desc(generationImages.createdAt))
}

/** Deletes a generation (cascades image rows) and best-effort removes Blob assets. */
export async function deleteGeneration(userId: string, id: string) {
  const generation = await getOwnedGeneration(userId, id)
  if (!generation) return false

  const images = await listGenerationImages(id)
  const urls = images.map((img) => img.url)
  if (urls.length && env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(urls, { token: env.BLOB_READ_WRITE_TOKEN })
    } catch (error) {
      console.error('[generations] failed to delete blob assets:', error)
    }
  }

  await db.delete(generations).where(and(eq(generations.id, id), eq(generations.userId, userId)))
  return true
}
