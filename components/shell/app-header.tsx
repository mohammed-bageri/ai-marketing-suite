'use client'

import { usePathname } from 'next/navigation'

import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { activeNavItem } from './nav'
import { UserMenu } from './user-menu'

export function AppHeader() {
  const pathname = usePathname()
  const current = activeNavItem(pathname)

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-5" />
      <span className="text-sm font-medium">{current?.title ?? 'Dashboard'}</span>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
