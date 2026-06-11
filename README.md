# AI Content Marketing Suite

A production-style SaaS app that helps marketers **generate, improve, illustrate, and manage**
marketing content with AI. Built for the Magna Labs technical assessment.

- Generate polished copy (blog post, LinkedIn post, ad copy, email) with per-type prompt strategies.
- Generate a matching AI image for any piece of content, and regenerate it in different styles.
- Improve existing text toward a goal (shorter, more persuasive, SEO-optimized, …).
- Save everything to a fast, paginated dashboard — copy, download, or delete past generations.

All AI runs **server-side**; the browser never calls OpenAI directly.

> **Status:** repository scaffold + foundations. Feature endpoints are implemented per the PRDs in
> [`docs/PRD/`](docs/PRD) and documented in the [API](#api) section as they land.

## Tech stack

| Concern        | Choice                                                          |
| -------------- | --------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router), React 19, TypeScript — deployed to Vercel |
| API layer      | Hono (REST + end-to-end typed RPC), mounted in a Next route handler |
| Validation     | Zod                                                             |
| Env safety     | `@t3-oss/env-nextjs` (validated at startup)                     |
| Database / ORM | Neon Postgres + Drizzle ORM (`neon-http` driver)                |
| Auth           | Better Auth — passwordless email OTP                            |
| AI             | OpenAI — text generation/improvement + image generation         |
| Email          | Resend (dev console fallback)                                   |
| UI             | Tailwind v4 + shadcn/ui, TanStack Query/Table, react-hook-form, sonner |

## Getting started

### Prerequisites

- Node.js 20+ and npm
- A Neon Postgres database ([neon.tech](https://neon.tech))
- An OpenAI API key
- (Optional) A Resend API key — without it, login codes are logged to the server console

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
#   then fill in DATABASE_URL, OPENAI_API_KEY, BETTER_AUTH_SECRET, etc.
#   generate a secret: openssl rand -base64 32

# 3. Create the database schema
npm run db:push        # or: npm run db:generate && npm run db:migrate

# 4. Run
npm run dev            # http://localhost:3000
```

### Environment variables

| Variable               | Required | Description                                              |
| ---------------------- | -------- | -------------------------------------------------------- |
| `DATABASE_URL`         | yes      | Neon Postgres connection string                          |
| `BETTER_AUTH_SECRET`   | yes      | Secret for Better Auth (`openssl rand -base64 32`)       |
| `BETTER_AUTH_URL`      | yes      | Auth base URL (e.g. `http://localhost:3000`)             |
| `OPENAI_API_KEY`       | yes      | OpenAI key for text + image generation                   |
| `NEXT_PUBLIC_APP_URL`  | yes      | Public base URL (browser-exposed)                        |
| `RESEND_API_KEY`       | no       | Resend key; omit in dev to log OTP to the console        |
| `EMAIL_FROM`           | no       | From address for OTP emails                              |

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

> Feature endpoints — `POST /api/content` (generate), `POST /api/images` (generate/regenerate),
> `POST /api/improve`, and `GET/DELETE /api/history` — are documented here as each PRD is implemented.

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
