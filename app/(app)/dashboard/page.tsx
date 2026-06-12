import { ArrowRight, PenLine, Sparkles } from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'

import { RecentGenerations } from '@/features/dashboard/components/recent-generations'
import { StatCards } from '@/features/dashboard/components/stat-cards'
import { PageHeader } from '@/components/shared/page-header'
import { auth } from '@/lib/auth'

const actions = [
  {
    href: '/generate',
    icon: Sparkles,
    title: 'Generate content',
    description: 'Blog posts, LinkedIn posts, ads, and emails with matching imagery.'
  },
  {
    href: '/improve',
    icon: PenLine,
    title: 'Improve text',
    description: 'Refine an existing draft toward a specific goal.'
  }
]

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const name = session?.user.name?.split(' ')[0] || session?.user.email?.split('@')[0]

  return (
    <>
      <PageHeader
        title={name ? `Welcome back, ${name}` : 'Dashboard'}
        description="Create, illustrate, and improve marketing content."
      />

      <StatCards />

      <div className="grid gap-4 sm:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group bg-card hover:border-foreground/30 relative overflow-hidden rounded-lg border p-5 transition-colors"
          >
            <div className="from-foreground/[0.03] pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-start gap-4">
              <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-md border">
                <action.icon className="size-5" />
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm font-medium">
                  {action.title}
                  <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
                <p className="text-muted-foreground text-sm text-pretty">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <RecentGenerations />
    </>
  )
}
