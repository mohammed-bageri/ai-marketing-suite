'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { unwrap } from '@/lib/api'
import { client } from '@/lib/rpc'
import type { ImproveInput } from '@/lib/schemas/improve'
import type { GenerationDTO } from '@/lib/types'

export function useImprove() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ImproveInput) =>
      unwrap<GenerationDTO>(client.api.improve.$post({ json: input })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['generations'] })
    }
  })
}
