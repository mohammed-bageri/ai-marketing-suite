import { History, LayoutDashboard, PenLine, Sparkles, type LucideIcon } from 'lucide-react'

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Generate', href: '/generate', icon: Sparkles },
  { title: 'Improve', href: '/improve', icon: PenLine },
  { title: 'History', href: '/history', icon: History }
]

export function activeNavItem(pathname: string): NavItem | undefined {
  return navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
}
