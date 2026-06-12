import { db } from '@/db'
import { generations } from '@/db/schema'
import { contentResultSchemas, type CreateContentInput } from '@/lib/schemas/content'
import { generateStructured } from '@/server/services/llm'
import { TEXT_MODEL } from '@/server/services/openai'
import { buildContentPrompt, temperatureFor } from '@/server/services/prompts/content'
import { contentToPlainText } from '@/server/services/plain-text'

/** Generates content with the per-type prompt strategy and persists it. */
export async function generateContent(userId: string, input: CreateContentInput) {
  const { system, user } = buildContentPrompt(input)

  const result = await generateStructured({
    system,
    user,
    schema: contentResultSchemas[input.contentType],
    schemaName: `${input.contentType}_content`,
    temperature: temperatureFor[input.contentType]
  })

  const plainText = contentToPlainText(input.contentType, result)

  const [row] = await db
    .insert(generations)
    .values({
      userId,
      source: 'generated',
      contentType: input.contentType,
      topic: input.topic,
      tone: input.tone,
      audience: input.audience,
      result,
      plainText,
      model: TEXT_MODEL
    })
    .returning()

  return row
}
