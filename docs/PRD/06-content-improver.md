# PRD 06 — AI Content Improver

## Problem & goal

Users paste existing text and a goal, and the AI returns an improved version **plus a short
explanation of what changed**. Contributes to the 25-pt LLM/prompt quality score and rounds out the
product.

## User stories

- As a marketer, I paste a rough draft, pick a goal, and get a polished rewrite.
- As a marketer, I see a concise summary of what changed and why, so I trust the edit.
- As a marketer, I can copy the result, and optionally save it to my history.

## Scope

**In:** improver form (text + goal), goal-specific prompt strategies, structured output (improved
text + change summary), copy, optional save.
**Out:** diff/redline view (nice-to-have if time), multi-goal chaining.

## Improvement goals & prompt strategy

`goal` enum, each with a tailored instruction block (a `IMPROVER_PROMPTS` registry in
`server/services/prompts/`):

| Goal             | Instruction focus                                                        |
| ---------------- | ------------------------------------------------------------------------ |
| `shorter`        | Cut length ~40–60% preserving meaning; remove filler; tighten sentences. |
| `persuasive`     | Add benefit-led framing, urgency, social proof cues; stronger CTA.       |
| `formal`         | Professional register; remove slang/contractions; polished structure.    |
| `seo`            | Natural keyword use, scannable structure, meta-aware phrasing.           |
| `rewrite_audience` | Re-target for a provided audience (tone, vocabulary, references).      |

Inputs (Zod):

```ts
{ text: string (10..6000),
  goal: 'shorter' | 'persuasive' | 'formal' | 'seo' | 'rewrite_audience',
  audience?: string  // required when goal = rewrite_audience
}
```

Structured output via OpenAI JSON schema:

```ts
{ improved: string, changeSummary: string[]  /* 2–5 concise bullets */ }
```

## Data model

Reuse `generations` with a discriminator so improvements appear in history too: add
`source: text default 'generated'` to `generations` (values: `generated` | `improved`), and store
the improver output in `result` (`{ improved, changeSummary }`) with `plainText = improved`.
`contentType` for improvements = `'improvement'`. (Single small column add; keeps one history.)

## API endpoints

#### `POST /api/improve`

Improve text. Auth required. Persists as a `generations` row (`source: 'improved'`).

Request:

```json
{ "text": "we make software for teams …", "goal": "persuasive" }
```

Response `201`:

```json
{ "id": "gen_…", "goal": "persuasive",
  "result": { "improved": "…", "changeSummary": ["Tightened the hook", "Added a clear CTA"] },
  "createdAt": "2026-06-12T…Z" }
```

Errors: `400` validation (incl. missing `audience` for `rewrite_audience`), `401`, `502` upstream.

## UI/UX

- `(app)/improve`: large `textarea` for source text + goal selector (+ conditional audience input).
- Result: improved text panel (`CopyButton`, download) and a "What changed" list of bullets.
- Optional: side-by-side original vs improved; simple highlight if time permits.
- Skeleton while improving; error toast with retry; empty state before first run.

## Dependencies

- `openai` (installed), structured outputs.
- `source` column on `generations` → migration.
- shadcn `textarea`, `select`, `card`, `skeleton`.

## Acceptance criteria

- [ ] All 5 goals produce a relevant rewrite with **distinct** behavior per goal.
- [ ] Output always includes the improved text + a concise change summary.
- [ ] `rewrite_audience` requires and uses the audience input.
- [ ] Result is copyable/downloadable and saved to history (visible in PRD 05).
- [ ] OpenAI only called server-side; errors handled. typecheck / lint / format pass.
