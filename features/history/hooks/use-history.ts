'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { unwrap } from '@/lib/api'
import { queryKeys, type GenerationsListParams } from '@/lib/query-keys'
import { client } from '@/lib/rpc'
import type { GenerationDetailDTO, GenerationListItem, Paginated } from '@/lib/types'

const PAGE_SIZE = 12

export function useGenerations(params: GenerationsListParams) {
  return useQuery({
    queryKey: queryKeys.generations(params),
    queryFn: () => {
      const query: Record<string, string> = {
        page: String(params.page),
        pageSize: String(PAGE_SIZE)
      }
      if (params.contentType) query.contentType = params.contentType
      if (params.q) query.q = params.q
      return unwrap<Paginated<GenerationListItem>>(client.api.generations.$get({ query }))
    },
    placeholderData: keepPreviousData
  })
}

export function useGeneration(id: string) {
  return useQuery({
    queryKey: queryKeys.generation(id),
    queryFn: () =>
      unwrap<GenerationDetailDTO>(client.api.generations[':id'].$get({ param: { id } }))
  })
}

export function useDeleteGeneration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      unwrap<{ success: true }>(client.api.generations[':id'].$delete({ param: { id } })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['generations'] })
    }
  })
}
