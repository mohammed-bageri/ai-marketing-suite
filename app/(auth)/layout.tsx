import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col p-6 sm:p-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="bg-foreground text-background flex size-7 items-center justify-center rounded-md">
            <Sparkles className="size-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Marketing Suite</span>
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
      <div className="bg-foreground text-background hidden flex-col justify-between p-10 lg:flex">
        <div />
        <blockquote className="space-y-3">
          <p className="text-2xl font-medium tracking-tight text-balance">
            “Generate the copy, match it with an image, and ship — without leaving the page.”
          </p>
          <footer className="text-background/60 text-sm">AI Content Marketing Suite</footer>
        </blockquote>
        <div className="text-background/50 text-xs">
          Secure, server-side AI · passwordless login
        </div>
      </div>
    </div>
  )
}
