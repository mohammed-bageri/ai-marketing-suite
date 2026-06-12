'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { unwrap } from '@/lib/api'
import { client } from '@/lib/rpc'
import type { CreateContentInput } from '@/lib/schemas/content'
import type { GenerationDTO } from '@/lib/types'

export function useGenerateContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateContentInput) =>
      unwrap<GenerationDTO>(client.api.content.$post({ json: input })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['generations'] })
    }
  })
}
