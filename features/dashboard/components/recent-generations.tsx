'use client'

import { History as HistoryIcon } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { HistoryCard } from '@/features/history/components/history-card'
import { useDeleteGeneration, useGenerations } from '@/features/history/hooks/use-history'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function RecentGenerations() {
  const { data, isLoading } = useGenerations({ page: 1 })
  const remove = useDeleteGeneration()

  async function handleDelete(id: string) {
    try {
      await remove.mutateAsync(id)
      toast.success('Deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete')
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Recent</h2>
        {data && data.items.length > 0 && (
          <Button variant="ghost" size="sm" render={<Link href="/history" />}>
            View all
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-lg" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="Nothing here yet"
          description="Your generated content and improvements will appear here."
        >
          <Button render={<Link href="/generate" />}>Generate content</Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.slice(0, 3).map((item) => (
            <HistoryCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </section>
  )
}
