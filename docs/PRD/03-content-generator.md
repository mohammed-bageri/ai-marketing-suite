# PRD 03 — AI Content Generator

## Problem & goal

The core feature (25-pt LLM & Prompt Quality). Users provide a topic, tone, target audience, and
content type, and receive polished, ready-to-use marketing copy. Each content type uses a
**distinct prompt strategy** — not one generic prompt — and output is structured, coherent, and
appropriate to the format.

## User stories

- As a marketer, I pick a content type, fill in topic/tone/audience, and generate copy in seconds.
- As a marketer, I get output structured for that format (e.g., a blog has headings; an email has a
  subject line) that I can copy/use immediately.
- As a marketer, my generation is saved so I can find it later (PRD 05) and add an image (PRD 04).

## Scope

**In:** generation form, 4 content types with per-type prompt strategies and structured output,
server-side OpenAI call, persistence, result view with copy/download.
**Out:** image generation (PRD 04), streaming (future), brand voice settings (bonus).

## Content types & prompt strategy

Each type has its own **system prompt**, **output structure (Zod/JSON schema)**, and constraints.
Selected server-side from `contentType`; a shared builder injects topic/tone/audience.

| Type           | Strategy & structure                                                                 |
| -------------- | ------------------------------------------------------------------------------------ |
| **Blog post**  | SEO-aware long-form. Output: `title`, `metaDescription`, `body` (markdown w/ H2/H3, intro, 3–5 sections, conclusion + CTA), `tags[]`. Prompt emphasizes structure, scannability, keyword-natural. |
| **LinkedIn post** | Hook-first, short lines, whitespace, 1 idea, soft CTA, 3–5 hashtags. Output: `body`, `hashtags[]`. Prompt bans corporate fluff, caps length, encourages a strong first line. |
| **Ad copy**    | Conversion-focused, platform-style. Output: `headline` (≤40 chars), `primaryText` (≤125 chars), `description`, `cta` (from a verb set). Prompt stresses benefit-led, punchy, compliant. |
| **Email**      | Output: `subject` (≤60 chars), `preheader`, `body` (greeting, value, CTA, sign-off), `cta`. Prompt tunes for inbox open rate + skimmability; tone-aware salutation. |

Implementation: a `PROMPTS` registry in `server/services/prompts/` keyed by type, each exporting a
`system` prompt + a Zod `outputSchema`. Use OpenAI **structured outputs** (JSON schema) so responses
parse deterministically. Model: a current OpenAI chat model; temperature tuned per type
(lower for ad copy, higher for blog/LinkedIn).

Inputs validated by Zod:

```ts
{ contentType: 'blog' | 'linkedin' | 'ad' | 'email',
  topic: string (3..200),
  tone: 'professional' | 'casual' | 'witty' | 'bold' | 'friendly' | 'authoritative',
  audience: string (2..120) }
```

## Data model

```ts
// db/schema.ts — added this PRD
generations = pgTable('generations', {
  id: text (uuid) pk,
  userId: text -> user.id (cascade),
  contentType: text,            // blog | linkedin | ad | email
  topic: text,
  tone: text,
  audience: text,
  result: jsonb,                // the structured, type-specific output
  plainText: text,             // flattened text for copy/download/search
  model: text,
  createdAt: timestamp default now,
}
```

(Images are added by PRD 04 as a related table.)

## API endpoints

#### `POST /api/content`

Generate and persist content. Auth required.

Request:

```json
{ "contentType": "linkedin", "topic": "Launching our AI analytics beta",
  "tone": "bold", "audience": "B2B SaaS founders" }
```

Response `201`:

```json
{ "id": "gen_…", "contentType": "linkedin", "topic": "…", "tone": "bold",
  "audience": "B2B SaaS founders",
  "result": { "body": "…", "hashtags": ["#AI", "#SaaS"] },
  "plainText": "…", "createdAt": "2026-06-12T…Z" }
```

Errors: `400` validation, `401` unauthenticated, `502` upstream model error
(`{ "error": { "message": "Generation failed", "code": "upstream_error" } }`).

#### `GET /api/content/:id`

Fetch one generation (owner-scoped). `404` if not found/owned.

## UI/UX

- `(app)/generate`: left = form (content-type segmented control/tabs, topic, tone select, audience),
  generate button with loading state; right = result panel.
- Result rendered **per type** (blog shows title/meta/markdown body/tags; ad shows the ad preview;
  email shows subject/preheader/body) with `CopyButton` per field + "Copy all" + "Download" (.md/.txt).
- Skeleton while generating; toast on error; "Generate image" CTA (wired in PRD 04).
- Empty state before first generation.

## Dependencies

- `openai` (installed). Structured outputs via JSON schema.
- shadcn `tabs`/segmented control, `select`, `textarea`, `card`, `skeleton`.
- New `generations` table → `db:generate` + `db:migrate`.

## Acceptance criteria

- [ ] All 4 content types generate coherent, format-appropriate output with **distinct** prompts.
- [ ] Output is structured (validated against the per-type schema) and rendered per type.
- [ ] Generation persists with `userId`, inputs, structured `result`, and `plainText`.
- [ ] Copy (per field + all) and download (.md/.txt) work.
- [ ] Errors (validation, upstream) handled gracefully with clear UI feedback.
- [ ] OpenAI is only called server-side. typecheck / lint / format pass.
