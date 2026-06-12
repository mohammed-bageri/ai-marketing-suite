export * from './content'
export * from './improve'
export * from './image'

import type { ContentResult } from './content'
import type { ImproveResult } from './improve'

/** Anything that can be stored in `generations.result`. */
export type GenerationResult = ContentResult | ImproveResult
