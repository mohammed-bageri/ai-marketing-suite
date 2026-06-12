# AI Content Marketing Suite

A production-style SaaS app that helps marketers **generate, improve, illustrate, and manage**
marketing content with AI. Built for the Magna Labs technical assessment.

- Generate polished copy (blog post, LinkedIn post, ad copy, email) with per-type prompt strategies.
- Generate a matching AI image for any piece of content, and regenerate it in different styles.
- Improve existing text toward a goal (shorter, more persuasive, SEO-optimized, …).
- Save everything to a fast, paginated dashboard — copy, download, or delete past generations.

All AI runs **server-side**; the browser never calls OpenAI directly.

Feature design and scope live in the PRDs under [`docs/PRD/`](docs/PRD); engineering conventions
are in [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md).

## Tech stack

| Concern        | Choice                                                          |
| -------------- | --------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router), React 19, TypeScript — deployed to Vercel |
| API layer      | Hono (REST + end-to-end typed RPC), mounted in a Next route handler |
| Validation     | Zod                                                             |
| Env safety     | `@t3-oss/env-nextjs` (validated at startup)                     |
| Database / ORM | Postgres + Drizzle ORM (postgres.js — local Docker or Neon)      |
| Auth           | Better Auth — passwordless email OTP                            |
| AI             | OpenAI — text generation/improvement + image generation         |
| Email          | SMTP (nodemailer) → Resend → console fallback; Mailpit for local |
| UI             | Tailwind v4 + shadcn/ui, TanStack Query/Table, react-hook-form, sonner |

## Getting started

### Prerequisites

- Node.js 20+ and npm
- Docker (for local Postgres + email), or a Neon database for cloud Postgres
- An OpenAI API key

### Local setup (Docker)

```bash
# 1. Install dependencies
npm install

# 2. Start Postgres + Mailpit (local SMTP catcher)
docker compose up -d

# 3. Configure environment — the defaults already match docker-compose
cp .env.example .env.local
#   set OPENAI_API_KEY, generate BETTER_AUTH_SECRET (openssl rand -base64 32),
#   and BLOB_READ_WRITE_TOKEN if you want image generation.

# 4. Create the database schema
npm run db:push        # or: npm run db:migrate

# 5. Run
npm run dev            # http://localhost:3000
```

Login codes are captured by Mailpit — open **http://localhost:8025** to read them (no real
email account needed). Tear down with `docker compose down` (add `-v` to wipe the database).

### Deploying (Vercel + Neon)

Set `DATABASE_URL` to a Neon connection string and configure a real email transport (any free
SMTP such as Brevo/Gmail via `SMTP_*`, or `RESEND_API_KEY`). Set `BLOB_READ_WRITE_TOKEN` from a
Vercel Blob store. Point `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` at the deployed origin.

### Environment variables

| Variable                  | Required | Description                                                     |
| ------------------------- | -------- | --------------------------------------------------------------- |
| `DATABASE_URL`            | yes      | Postgres connection string (local Docker or Neon)               |
| `BETTER_AUTH_SECRET`      | yes      | Secret for Better Auth (`openssl rand -base64 32`)              |
| `BETTER_AUTH_URL`         | yes      | Auth base URL (e.g. `http://localhost:3000`)                    |
| `OPENAI_API_KEY`          | yes      | OpenAI key for text + image generation                          |
| `NEXT_PUBLIC_APP_URL`     | yes      | Public base URL (browser-exposed)                               |
| `BLOB_READ_WRITE_TOKEN`   | images   | Vercel Blob RW token; required for image generation             |
| `SMTP_HOST` / `SMTP_PORT` | no       | SMTP transport (local: `localhost` / `1025` → Mailpit)          |
| `SMTP_USER` / `SMTP_PASS` | no       | SMTP credentials (omit for Mailpit)                             |
| `RESEND_API_KEY`          | no       | Resend key; used if SMTP is not set                             |
| `EMAIL_FROM`              | no       | From address for OTP emails                                     |

> Email resolves in order: **SMTP → Resend → console log**. With none set, OTPs print to the
> server console.

## API

The backend is a single Hono app mounted at `/api`. All endpoints return JSON. AI logic is
server-side only.

### Conventions

- Base path: `/api`
- Auth: session cookie issued by Better Auth; protected endpoints require a valid session.
- Errors: `{ "error": { "message": string, "code"?: string } }` with an appropriate HTTP status.

### Endpoints

#### `GET /api/health`

Liveness probe.

**Response** `200`

```json
{ "status": "ok" }
```

#### `* /api/auth/*`

Handled by Better Auth (email OTP sign-in, session, sign-out). Key calls:

- `POST /api/auth/email-otp/send-verification-otp` — body `{ "email": "you@example.com", "type": "sign-in" }`
- `POST /api/auth/sign-in/email-otp` — body `{ "email": "you@example.com", "otp": "123456" }`
- `GET  /api/auth/get-session`
- `POST /api/auth/sign-out`

### Feature endpoints

All require a valid session. Errors use the standard envelope and the status codes above.

#### `POST /api/content`

Generate marketing content with a per-type prompt strategy, and save it.

**Request**

```json
{
  "contentType": "linkedin",
  "topic": "Launching our AI analytics beta",
  "tone": "bold",
  "audience": "B2B SaaS founders"
}
```

`contentType`: `blog | linkedin | ad | email` · `tone`: `professional | casual | witty | bold | friendly | authoritative`

**Response** `201` — the saved generation. `result` is structured per content type.

```json
{
  "id": "9f0c…",
  "source": "generated",
  "contentType": "linkedin",
  "topic": "Launching our AI analytics beta",
  "tone": "bold",
  "audience": "B2B SaaS founders",
  "result": { "body": "Most dashboards lie…", "hashtags": ["#AI", "#SaaS"] },
  "plainText": "Most dashboards lie…\n\n#AI #SaaS",
  "model": "gpt-4o",
  "createdAt": "2026-06-12T10:00:00.000Z"
}
```

#### `POST /api/improve`

Improve text toward a goal; returns the improved text + a summary of changes (saved to history).

**Request**

```json
{ "text": "we make software for teams", "goal": "persuasive" }
```

`goal`: `shorter | persuasive | formal | seo | rewrite_audience` (`audience` required when `rewrite_audience`).

**Response** `201`

```json
{
  "id": "1a2b…",
  "source": "improved",
  "contentType": "improvement",
  "goal": "persuasive",
  "result": {
    "improved": "Ship faster with software built for how teams really work…",
    "changeSummary": ["Led with the benefit", "Added a clear call to action"]
  },
  "plainText": "Ship faster…",
  "createdAt": "2026-06-12T10:05:00.000Z"
}
```

#### `GET /api/generations`

Paginated, owner-scoped history (newest first).

**Query**: `page` (default 1) · `pageSize` (default 12, max 50) · `contentType?` (`blog|linkedin|ad|email|improvement`) · `q?` (topic search)

**Response** `200`

```json
{
  "items": [
    {
      "id": "9f0c…",
      "source": "generated",
      "contentType": "linkedin",
      "topic": "Launching our AI analytics beta",
      "tone": "bold",
      "goal": null,
      "createdAt": "2026-06-12T10:00:00.000Z",
      "previewText": "Most dashboards lie…",
      "imageUrl": "https://…public.blob.vercel-storage.com/…png"
    }
  ],
  "page": 1,
  "pageSize": 12,
  "total": 1,
  "totalPages": 1
}
```

#### `GET /api/generations/:id`

One generation with its images (`404` if not found or not owned).

**Response** `200` — the full generation including `result`, `plainText`, and `images: GenerationImage[]`.

#### `DELETE /api/generations/:id`

Delete a generation (cascades image rows and best-effort removes Blob assets).

**Response** `200` → `{ "success": true }`

#### `POST /api/generations/:id/images`

Generate (or regenerate) a matching image. The visual prompt is built **server-side** from the
generation's topic, tone, type, and text — the client only picks a style.

**Request**

```json
{ "style": "minimal" }
```

`style`: `minimal | photographic | 3d_render | illustration | corporate | bold_gradient`

**Response** `201`

```json
{
  "id": "img_…",
  "generationId": "9f0c…",
  "url": "https://…public.blob.vercel-storage.com/…png",
  "style": "minimal",
  "createdAt": "2026-06-12T10:01:00.000Z"
}
```

#### `GET /api/generations/:id/images`

List all images for a generation (newest first).

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for design choices, trade-offs, and what's next.

Highlights:

- **One Next.js app, Hono for the API.** Hono gives clean REST plus a typed RPC client the frontend
  consumes through TanStack Query — no hand-written fetch types.
- **Server-side AI boundary.** OpenAI is only ever called from `server/services`, satisfying the
  security requirement that the frontend never holds provider keys.
- **Serverless-first data.** Neon's HTTP driver suits Vercel functions; Drizzle keeps the schema and
  migrations type-safe.

## Project structure

See [`CLAUDE.md`](CLAUDE.md) for the full layout and contribution conventions.

## Scripts

| Script                | Purpose                          |
| --------------------- | -------------------------------- |
| `npm run dev`         | Dev server                       |
| `npm run build`       | Production build                 |
| `npm run typecheck`   | `tsc --noEmit`                   |
| `npm run lint`        | ESLint                           |
| `npm run format`      | Prettier write                   |
| `npm run db:generate` | Generate migration from schema   |
| `npm run db:migrate`  | Apply migrations                 |
| `npm run db:push`     | Push schema (dev)                |
| `npm run db:studio`   | Drizzle Studio                   |
