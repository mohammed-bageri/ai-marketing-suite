import type { LucideIcon } from 'lucide-react'

export function EmptyState({
  icon: Icon,
  title,
  description,
  children
}: {
  icon?: LucideIcon
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-16 text-center">
      {Icon && (
        <div className="bg-muted/40 mb-4 flex size-11 items-center justify-center rounded-full border">
          <Icon className="text-muted-foreground size-5" />
        </div>
      )}
      <h3 className="text-sm font-medium">{title}</h3>
      {description && (
        <p className="text-muted-foreground mt-1 max-w-sm text-sm text-pretty">{description}</p>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}
