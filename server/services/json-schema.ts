import { z } from 'zod'

type JsonNode = Record<string, unknown>

/**
 * OpenAI structured outputs (strict) require every object to set
 * `additionalProperties: false` and list all properties as `required`.
 * zod's JSON Schema output doesn't guarantee this, so we enforce it recursively.
 */
function enforceStrict(node: unknown): void {
  if (!node || typeof node !== 'object') return
  const n = node as JsonNode

  if (n.type === 'object' && n.properties && typeof n.properties === 'object') {
    const props = n.properties as Record<string, unknown>
    n.additionalProperties = false
    n.required = Object.keys(props)
    for (const value of Object.values(props)) enforceStrict(value)
  }

  if (n.type === 'array' && n.items) enforceStrict(n.items)
}

export function toOpenAiJsonSchema(schema: z.ZodType): Record<string, unknown> {
  const json = z.toJSONSchema(schema) as JsonNode
  delete json.$schema
  enforceStrict(json)
  return json
}
