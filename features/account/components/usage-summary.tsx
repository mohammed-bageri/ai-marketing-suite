'use client'

import { useStats } from '@/features/dashboard/hooks/use-stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { contentTypeLabels, type ContentType } from '@/lib/schemas/content'

const order: (ContentType | 'improvement')[] = ['blog', 'linkedin', 'ad', 'email', 'improvement']

const labelFor = (type: ContentType | 'improvement') =>
  type === 'improvement' ? 'Improvements' : contentTypeLabels[type]

export function UsageSummary() {
  const { data, isLoading } = useStats()

  const counts = new Map(data?.byType.map((t) => [t.contentType, t.count]))
  const max = Math.max(1, ...(data?.byType.map((t) => t.count) ?? [0]))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {order.map((type) => {
              const value = counts.get(type) ?? 0
              return (
                <div key={type} className="grid grid-cols-[120px_1fr_auto] items-center gap-3">
                  <span className="text-sm">{labelFor(type)}</span>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                      className={cn('bg-foreground/80 h-full rounded-full transition-all')}
                      style={{ width: `${(value / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground w-8 text-right font-mono text-sm tabular-nums">
                    {value}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
