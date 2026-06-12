import { ArrowRight, History, ImageIcon, PenLine, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: Sparkles,
    title: 'Generate',
    description: 'Blog posts, LinkedIn posts, ads, and emails — each with its own prompt strategy.'
  },
  {
    icon: ImageIcon,
    title: 'Illustrate',
    description:
      'One click turns any post into a matching, on-brand image. Regenerate in any style.'
  },
  {
    icon: PenLine,
    title: 'Improve',
    description: 'Paste a draft, pick a goal, and get a sharper version with a summary of changes.'
  },
  {
    icon: History,
    title: 'Organize',
    description: 'Every generation saved to a fast, searchable history. Copy, download, or delete.'
  }
]

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="bg-foreground text-background flex size-7 items-center justify-center rounded-md">
            <Sparkles className="size-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Marketing Suite</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" render={<Link href="/login" />}>
            Sign in
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
        <section className="flex flex-col items-center py-20 text-center sm:py-28">
          <div className="bg-muted/50 text-muted-foreground mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <span className="bg-foreground size-1.5 rounded-full" />
            AI content, end to end
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Create marketing content that ships itself
          </h1>
          <p className="text-muted-foreground mt-5 max-w-xl text-base text-pretty sm:text-lg">
            Generate polished copy, pair it with matching AI imagery, and refine existing drafts —
            all in one fast, focused workspace.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/login" />}>
              Get started
              <ArrowRight />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/generate" />}>
              See the generator
            </Button>
          </div>
        </section>

        <section className="bg-border grid gap-px overflow-hidden rounded-xl border sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="bg-background flex flex-col gap-3 p-6">
              <feature.icon className="text-muted-foreground size-5" />
              <h3 className="text-sm font-medium">{feature.title}</h3>
              <p className="text-muted-foreground text-sm text-pretty">{feature.description}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 py-10">
        <p className="text-muted-foreground text-xs">
          AI Content Marketing Suite — built with Next.js, Hono, Drizzle, and OpenAI.
        </p>
      </footer>
    </div>
  )
}
