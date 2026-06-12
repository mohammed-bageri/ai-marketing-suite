import { CopyButton } from '@/components/shared/copy-button'
import { Markdown } from '@/components/shared/markdown'
import { Badge } from '@/components/ui/badge'
import type { GenerationResult } from '@/lib/schemas'
import type {
  AdResult,
  BlogResult,
  ContentType,
  EmailResult,
  LinkedinResult
} from '@/lib/schemas/content'
import type { ImproveResult } from '@/lib/schemas/improve'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {label}
        </span>
        <CopyButton value={value} size="icon" variant="ghost" />
      </div>
      <p className="text-sm whitespace-pre-wrap">{value}</p>
    </div>
  )
}

function Prose({ value }: { value: string }) {
  return <Markdown>{value}</Markdown>
}

export function ContentView({
  contentType,
  result
}: {
  contentType: ContentType | 'improvement'
  result: GenerationResult
}) {
  switch (contentType) {
    case 'blog': {
      const r = result as BlogResult
      return (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold tracking-tight text-balance">{r.title}</h2>
          <p className="text-muted-foreground border-l-2 pl-3 text-sm">{r.metaDescription}</p>
          <Prose value={r.body} />
          {r.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {r.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )
    }
    case 'linkedin': {
      const r = result as LinkedinResult
      return (
        <div className="space-y-4">
          <Prose value={r.body} />
          <p className="text-muted-foreground text-sm">{r.hashtags.join(' ')}</p>
        </div>
      )
    }
    case 'ad': {
      const r = result as AdResult
      return (
        <div className="space-y-5">
          <div className="bg-muted/40 space-y-2 rounded-lg border p-4">
            <p className="text-base font-semibold">{r.headline}</p>
            <p className="text-sm">{r.primaryText}</p>
            <p className="text-muted-foreground text-sm">{r.description}</p>
            <Badge>{r.cta}</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Headline" value={r.headline} />
            <Field label="Primary text" value={r.primaryText} />
            <Field label="Description" value={r.description} />
            <Field label="Call to action" value={r.cta} />
          </div>
        </div>
      )
    }
    case 'email': {
      const r = result as EmailResult
      return (
        <div className="space-y-5">
          <Field label="Subject" value={r.subject} />
          <Field label="Preheader" value={r.preheader} />
          <div className="space-y-1.5">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Body
            </span>
            <Prose value={r.body} />
          </div>
          <Badge>{r.cta}</Badge>
        </div>
      )
    }
    case 'improvement': {
      const r = result as ImproveResult
      return (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Improved text
            </span>
            <Prose value={r.improved} />
          </div>
          {r.changeSummary.length > 0 && (
            <div className="bg-muted/40 space-y-2 rounded-lg border p-4">
              <p className="text-xs font-medium tracking-wide uppercase">What changed</p>
              <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-sm">
                {r.changeSummary.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    }
  }
}
