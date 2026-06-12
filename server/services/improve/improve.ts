import { db } from '@/db'
import { generations } from '@/db/schema'
import { improveResultSchema, type ImproveInput } from '@/lib/schemas/improve'
import { generateStructured } from '@/server/services/llm'
import { TEXT_MODEL } from '@/server/services/openai'
import { improveToPlainText } from '@/server/services/plain-text'
import { buildImprovePrompt } from '@/server/services/prompts/improve'

/** Improves text toward a goal and saves it into the unified history. */
export async function improveContent(userId: string, input: ImproveInput) {
  const { system, user } = buildImprovePrompt(input)

  const result = await generateStructured({
    system,
    user,
    schema: improveResultSchema,
    schemaName: 'content_improvement',
    temperature: 0.6
  })

  const [row] = await db
    .insert(generations)
    .values({
      userId,
      source: 'improved',
      contentType: 'improvement',
      goal: input.goal,
      audience: input.audience ?? null,
      result,
      plainText: improveToPlainText(result),
      model: TEXT_MODEL
    })
    .returning()

  return row
}
