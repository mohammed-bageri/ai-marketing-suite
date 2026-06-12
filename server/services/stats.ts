import { and, count, eq, gte } from 'drizzle-orm'

import { db } from '@/db'
import { generationImages, generations } from '@/db/schema'

/** Aggregate usage stats for a user — powers the dashboard and account page. */
export async function getUserStats(userId: string) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [totals] = await db
    .select({ value: count() })
    .from(generations)
    .where(eq(generations.userId, userId))

  const [images] = await db
    .select({ value: count() })
    .from(generationImages)
    .where(eq(generationImages.userId, userId))

  const [week] = await db
    .select({ value: count() })
    .from(generations)
    .where(and(eq(generations.userId, userId), gte(generations.createdAt, weekAgo)))

  const byType = await db
    .select({ contentType: generations.contentType, count: count() })
    .from(generations)
    .where(eq(generations.userId, userId))
    .groupBy(generations.contentType)

  return {
    totalGenerations: totals?.value ?? 0,
    totalImages: images?.value ?? 0,
    thisWeek: week?.value ?? 0,
    byType: byType.map((row) => ({ contentType: row.contentType, count: row.count }))
  }
}
