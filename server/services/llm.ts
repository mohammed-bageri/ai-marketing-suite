import type { z } from 'zod'

import { upstreamError } from '@/server/lib/errors'
import { toOpenAiJsonSchema } from './json-schema'
import { openai, TEXT_MODEL } from './openai'

type StructuredArgs<Schema extends z.ZodType> = {
  system: string
  user: string
  schema: Schema
  schemaName: string
  temperature?: number
}

/**
 * Calls the text model with a strict JSON-schema response format and returns the
 * parsed, zod-validated result. Centralizes upstream + parse error handling.
 */
export async function generateStructured<Schema extends z.ZodType>({
  system,
  user,
  schema,
  schemaName,
  temperature = 0.7
}: StructuredArgs<Schema>): Promise<z.infer<Schema>> {
  let content: string | null | undefined

  try {
    const completion = await openai.chat.completions.create({
      model: TEXT_MODEL,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: schemaName, strict: true, schema: toOpenAiJsonSchema(schema) }
      }
    })
    content = completion.choices[0]?.message?.content
  } catch (error) {
    console.error('[llm] completion failed:', error)
    throw upstreamError()
  }

  if (!content) throw upstreamError('The AI returned an empty response.')

  try {
    return schema.parse(JSON.parse(content))
  } catch (error) {
    console.error('[llm] failed to parse/validate response:', error)
    throw upstreamError('The AI returned an unexpected format. Please try again.')
  }
}
