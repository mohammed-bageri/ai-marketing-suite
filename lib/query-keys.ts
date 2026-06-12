export type GenerationsListParams = {
  page: number
  contentType?: string
  q?: string
}

export const queryKeys = {
  generations: (params: GenerationsListParams) => ['generations', params] as const,
  generation: (id: string) => ['generation', id] as const,
  generationImages: (id: string) => ['generation', id, 'images'] as const
}
