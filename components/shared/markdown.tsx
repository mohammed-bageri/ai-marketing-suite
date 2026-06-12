import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/utils'

/**
 * Renders generated markdown safely (no raw HTML) with GFM + single-line-break
 * support, styled via Tailwind Typography to match the monochrome theme.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        'prose-headings:font-semibold prose-headings:tracking-tight',
        'prose-p:leading-relaxed prose-li:my-0.5',
        'prose-pre:bg-muted prose-pre:text-foreground prose-code:before:content-none prose-code:after:content-none',
        'prose-a:font-medium prose-a:underline-offset-2',
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{children}</ReactMarkdown>
    </div>
  )
}
