import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          AI Content Marketing Suite
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Create, improve, and illustrate marketing content with AI
        </h1>
        <p className="text-muted-foreground mx-auto max-w-xl text-balance">
          Generate on-brand posts, ads, and emails, pair them with matching AI imagery, and keep
          every draft in one fast dashboard.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button size="lg" render={<Link href="/dashboard" />}>
          Get started
        </Button>
        <Button size="lg" variant="outline" render={<Link href="/login" />}>
          Sign in
        </Button>
      </div>
    </main>
  )
}
