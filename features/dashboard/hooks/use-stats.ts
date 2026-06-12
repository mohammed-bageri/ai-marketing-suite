'use client'

import { useQuery } from '@tanstack/react-query'

import { unwrap } from '@/lib/api'
import { client } from '@/lib/rpc'
import type { StatsDTO } from '@/lib/types'

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => unwrap<StatsDTO>(client.api.stats.$get())
  })
}
