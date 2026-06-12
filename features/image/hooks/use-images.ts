'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { unwrap } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import { client } from '@/lib/rpc'
import type { ImageStyle } from '@/lib/schemas/image'
import type { GenerationImageDTO } from '@/lib/types'

export function useGenerationImages(generationId: string, initialData?: GenerationImageDTO[]) {
  return useQuery({
    queryKey: queryKeys.generationImages(generationId),
    queryFn: () =>
      unwrap<GenerationImageDTO[]>(
        client.api.generations[':id'].images.$get({ param: { id: generationId } })
      ),
    initialData
  })
}

export function useGenerateImage(generationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (style: ImageStyle) =>
      unwrap<GenerationImageDTO>(
        client.api.generations[':id'].images.$post({
          param: { id: generationId },
          json: { style }
        })
      ),
    onSuccess: (image) => {
      queryClient.setQueryData<GenerationImageDTO[]>(
        queryKeys.generationImages(generationId),
        (prev) => [image, ...(prev ?? [])]
      )
      void queryClient.invalidateQueries({ queryKey: ['generations'] })
    }
  })
}
