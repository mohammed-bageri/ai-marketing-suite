# PRD 04 — AI Image Generator

## Problem & goal

The 20-pt image feature. Each generated post supports a matching AI image. After content exists, the
user clicks "Generate image"; the **backend automatically builds the visual prompt** from the
content's topic, tone, body, and type, calls OpenAI images server-side, displays the result beside
the text, and lets the user **regenerate in a different style**.

## User stories

- As a marketer, I click one button and get an on-topic image for my content — I don't write the
  image prompt myself.
- As a marketer, I pick a style (or regenerate) and get a different take while staying on-topic.
- As a marketer, the image is saved with the generation and shows up in my history (PRD 05).

## Scope

**In:** server-side visual-prompt builder, OpenAI image call, style presets, regenerate, persistence
+ storage, display beside content.
**Out:** image editing/inpainting, upscaling, multi-image grids (future).

## Visual-prompt builder (server-side)

A `buildImagePrompt({ topic, tone, contentType, plainText, style })` in
`server/services/image-prompt.ts`:

- Derives a concise subject from `topic` + a short summary of `plainText`.
- Maps `tone` → mood/lighting language; `contentType` → composition hint (e.g., blog → hero banner,
  ad → product-forward, LinkedIn → clean conceptual).
- Appends the chosen **style preset** modifiers and hard negatives ("no text, no watermark,
  no logos").

**Style presets** (`style` enum): `minimal` (clean, lots of negative space — default, fits the
monochrome brand), `photographic`, `3d_render`, `illustration`, `corporate`, `bold_gradient`.

## Storage decision

OpenAI `gpt-image-1` returns base64 (no hosted URL). We persist images to **Vercel Blob** and store
the returned URL in Postgres (keeps the DB light, gives a stable public URL for display/history).
`@vercel/blob` is added as a dependency in this PRD. (Fallback if Blob is unavailable: store the
base64 as a data URL in a `text` column — acceptable for the demo but heavier.)

## Data model

```ts
// db/schema.ts — added this PRD
generationImages = pgTable('generation_images', {
  id: text (uuid) pk,
  generationId: text -> generations.id (cascade),
  userId: text -> user.id (cascade),
  url: text,                 // Vercel Blob URL
  style: text,               // preset key
  prompt: text,              // the built visual prompt (for transparency/debug)
  createdAt: timestamp default now,
}
```

A generation can have many images (each regenerate adds a row); the latest is shown by default,
prior ones remain viewable.

## API endpoints

#### `POST /api/generations/:id/images`

Build prompt server-side, generate, store, return. Auth + ownership required.

Request:

```json
{ "style": "minimal" }
```

Response `201`:

```json
{ "id": "img_…", "generationId": "gen_…", "url": "https://…blob…/img.png",
  "style": "minimal", "createdAt": "2026-06-12T…Z" }
```

Regenerate = the same endpoint with a different `style` (or same style for a new variation).

Errors: `400` invalid style, `401`, `404` generation not owned, `502` image upstream error.

#### `GET /api/generations/:id/images`

List images for a generation (owner-scoped), newest first.

## UI/UX

- On the generate result panel and the history detail: an image area with "Generate image" (when
  none) → spinner/skeleton (image gen is slower; show progress + reassuring copy).
- A **style picker** (select or chips) and a "Regenerate" button; switching style + regenerate
  produces a new image without losing the previous.
- Show the active image large; a small strip of previous variants to switch back to.
- Download image button; graceful error toast with retry.

## Dependencies

- `openai` (installed), `@vercel/blob` (new), `BLOB_READ_WRITE_TOKEN` env (add to `lib/env.ts`
  + `.env.example`).
- New `generation_images` table → migration.

## Acceptance criteria

- [ ] One click generates an on-topic image; the user never writes the prompt.
- [ ] The visual prompt is built **server-side** from topic/tone/content/type (+ style).
- [ ] At least 5 selectable styles; regenerate yields a visibly different, still-relevant image.
- [ ] Images persist (Blob URL + metadata) and display beside the content and in history.
- [ ] Frontend never calls the image provider directly; all calls are server-side.
- [ ] Slow-generation UX is smooth (skeleton/progress, retry on error). typecheck/lint/format pass.
