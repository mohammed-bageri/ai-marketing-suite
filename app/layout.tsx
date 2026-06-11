import type { Metadata } from 'next'
import './globals.css'
import { Geist } from 'next/font/google'
import { Toaster } from 'sonner'

import { Providers } from '@/components/providers'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'AI Content Marketing Suite',
  description: 'Create, manage, and optimize marketing content with AI.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn('font-sans', geist.variable)}>
      <body>
        <Providers>{children}</Providers>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
