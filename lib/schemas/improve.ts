import { z } from 'zod'

export const improvementGoals = [
  'shorter',
  'persuasive',
  'formal',
  'seo',
  'rewrite_audience'
] as const
export type ImprovementGoal = (typeof improvementGoals)[number]

export const improvementGoalLabels: Record<ImprovementGoal, string> = {
  shorter: 'Make it shorter',
  persuasive: 'More persuasive',
  formal: 'More formal',
  seo: 'SEO-optimize',
  rewrite_audience: 'Rewrite for a different audience'
}

/** Input for POST /api/improve. Audience is required only for the re-target goal. */
export const improveSchema = z
  .object({
    text: z.string().min(10, 'Add more text to improve').max(6000, 'Text is too long'),
    goal: z.enum(improvementGoals),
    // Optional and may be empty; the 2-char requirement applies only to rewrite_audience (below).
    audience: z.string().max(120, 'Audience is too long').optional()
  })
  .refine((d) => d.goal !== 'rewrite_audience' || (d.audience?.trim().length ?? 0) >= 2, {
    message: 'Audience is required when rewriting for a different audience',
    path: ['audience']
  })
export type ImproveInput = z.infer<typeof improveSchema>

export const improveResultSchema = z.object({
  improved: z.string(),
  changeSummary: z.array(z.string())
})
export type ImproveResult = z.infer<typeof improveResultSchema>
