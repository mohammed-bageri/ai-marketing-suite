'use client'

import { ChevronLeft, ChevronRight, History as HistoryIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { HistoryCard } from '@/features/history/components/history-card'
import { useDeleteGeneration, useGenerations } from '@/features/history/hooks/use-history'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { contentTypeLabels } from '@/lib/schemas/content'

const filters = [
  { value: 'all', label: 'All' },
  { value: 'blog', label: contentTypeLabels.blog },
  { value: 'linkedin', label: contentTypeLabels.linkedin },
  { value: 'ad', label: contentTypeLabels.ad },
  { value: 'email', label: contentTypeLabels.email },
  { value: 'improvement', label: 'Improvements' }
]

export function HistoryList() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, isError } = useGenerations({
    page,
    contentType: filter === 'all' ? undefined : filter,
    q: debounced || undefined
  })
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
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={filter}
          onValueChange={(value) => {
            setFilter(value)
            setPage(1)
          }}
        >
          <TabsList>
            {filters.map((f) => (
              <TabsTrigger key={f.value} value={f.value}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Input
          placeholder="Search by topic…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
      </div>

      {isError ? (
        <EmptyState title="Couldn’t load history" description="Please refresh and try again." />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-lg" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No generations yet"
          description="Generate content or improve a draft, and it will show up here."
        >
          <Button render={<Link href="/generate" />}>Create your first</Button>
        </EmptyState>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item) => (
              <HistoryCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Page {data.page} of {data.totalPages} · {data.total} total
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
