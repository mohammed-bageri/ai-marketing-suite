'use client'

import { FileText, ImageIcon, PenLine, TrendingUp, type LucideIcon } from 'lucide-react'

import { useStats } from '@/features/dashboard/hooks/use-stats'
import { Skeleton } from '@/components/ui/skeleton'

function StatCard({
  label,
  value,
  icon: Icon
}: {
  label: string
  value: number
  icon: LucideIcon
}) {
  return (
    <div className="bg-card hover:border-foreground/20 relative overflow-hidden rounded-lg border p-4 transition-colors">
      <div className="via-foreground/15 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium">{label}</span>
        <Icon className="text-muted-foreground/50 size-4" />
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{value.toLocaleString()}</p>
    </div>
  )
}

export function StatCards() {
  const { data, isLoading } = useStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] w-full rounded-lg" />
        ))}
      </div>
    )
  }

  const improvements = data?.byType.find((t) => t.contentType === 'improvement')?.count ?? 0
  const stats = [
    { label: 'Generations', value: data?.totalGenerations ?? 0, icon: FileText },
    { label: 'Images created', value: data?.totalImages ?? 0, icon: ImageIcon },
    { label: 'Improvements', value: improvements, icon: PenLine },
    { label: 'This week', value: data?.thisWeek ?? 0, icon: TrendingUp }
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}
