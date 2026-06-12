import type {
  AdResult,
  BlogResult,
  ContentResult,
  ContentType,
  EmailResult,
  LinkedinResult
} from '@/lib/schemas/content'
import type { ImproveResult } from '@/lib/schemas/improve'

/** Flattens a structured content result into copy/download/search-friendly text. */
export function contentToPlainText(type: ContentType, result: ContentResult): string {
  switch (type) {
    case 'blog': {
      const r = result as BlogResult
      return [r.title, r.metaDescription, r.body, r.tags.length ? `Tags: ${r.tags.join(', ')}` : '']
        .filter(Boolean)
        .join('\n\n')
    }
    case 'linkedin': {
      const r = result as LinkedinResult
      return [r.body, r.hashtags.join(' ')].filter(Boolean).join('\n\n')
    }
    case 'ad': {
      const r = result as AdResult
      return [`${r.headline}`, r.primaryText, r.description, `CTA: ${r.cta}`]
        .filter(Boolean)
        .join('\n\n')
    }
    case 'email': {
      const r = result as EmailResult
      return [`Subject: ${r.subject}`, `Preheader: ${r.preheader}`, r.body, `CTA: ${r.cta}`]
        .filter(Boolean)
        .join('\n\n')
    }
  }
}

export const improveToPlainText = (result: ImproveResult): string => result.improved
