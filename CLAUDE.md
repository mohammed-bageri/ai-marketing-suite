# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## Project

**AI Content Marketing Suite** — a SaaS app that helps marketers generate, improve, illustrate,
and manage marketing content with AI. Built as a Magna Labs technical assessment (48-hour build).

Core features:

1. **AI Content Generator** — topic / tone / audience / content type → polished copy. Each content
   type (blog post, LinkedIn post, ad copy, email) has a **distinct prompt strategy**.
2. **AI Image Generator** — server builds a visual prompt from the content and calls OpenAI images;
   user can regenerate in a different style.
3. **Content History & Dashboard** — paginated list of past generations; copy / download / delete.
4. **AI Content Improver** — paste text + goal → improved version + explanation of changes.

All AI calls are **server-side only**. The frontend never talks to OpenAI directly.

## Stack

- **Next.js 16 (App Router)** + **React 19** + **TypeScript** — full-stack, deployed on Vercel.
- **Hono** — single API app mounted at `app/api/[[...route]]/route.ts`; exposes REST + typed RPC.
- **Drizzle ORM** + **Neon Postgres** — `drizzle-orm/neon-http` driver (serverless-friendly).
- **Better Auth** — passwordless **email OTP** login.
- **Zod** — validation, shared between Hono validators and forms.
- **@t3-oss/env-nextjs** — startup-validated env vars (`lib/env.ts`).
- **OpenAI** — text generation/improvement + image generation (`gpt-image-1` / DALL·E 3).
- **Tailwind v4** + **shadcn/ui (Base UI preset)** — design system.
- **TanStack Query / Table**, **react-hook-form**, **zustand**, **sonner**, **next-themes**.

## Project structure

```
app/                       Next.js routes
  api/[[...route]]/route.ts  Hono mount (Node.js runtime)
server/
  app.ts                   Hono app + AppType (RPC source of truth)
  routes/                  feature routers (added per PRD)
  services/                AI/provider wrappers (OpenAI, etc.)
db/
  schema.ts                Drizzle schema (auth tables; feature tables per PRD)
  index.ts                 Drizzle client
lib/
  env.ts                   validated env
  auth.ts / auth-client.ts Better Auth server + client
  email.ts                 OTP email (Resend, dev console fallback)
  rpc.ts                   typed Hono RPC client
  utils.ts                 cn()
components/
  ui/                      shadcn components
  providers.tsx            React Query + theme providers
docs/
  ARCHITECTURE.md          design decisions / trade-offs
  PRD/                     per-feature product requirement docs
```

## Conventions

**Full engineering standards live in [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) — read it before
implementing.** The essentials:

- **Code style: no semicolons, single quotes, 2-space, 100 cols.** Enforced by Prettier
  (`.prettierrc.json`). Run `npm run format` before committing. Match surrounding style.
- Path alias `@/*` maps to the **repo root** (not `src/`).
- **Layers:** `app/` (routing, thin) → `server/` (Hono routes → services → db) → `features/`
  (frontend modules). The browser never calls OpenAI/Blob/DB directly.
- **API:** RESTful Hono routers chained in `server/app.ts` (keep `AppType` accurate). Success returns
  raw payload (lists use a pagination envelope); errors use `{ error: { message, code? } }`. Validate
  with `@hono/zod-validator` against schemas in `lib/schemas/` (shared with forms).
- **Auth:** every owner-scoped query filters by the session user; not-owned → `404`.
- **Frontend:** Server Components by default; server state via TanStack Query + RPC client; forms via
  react-hook-form + zod; toasts via sonner; always ship loading/empty/error states.
- Add DB tables to `db/schema.ts`, then `npm run db:generate && npm run db:migrate`.

## Commands

```bash
npm run dev            # start dev server
npm run build          # production build
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run format         # prettier --write .
npm run db:generate    # generate SQL migration from schema
npm run db:migrate     # apply migrations
npm run db:push        # push schema directly (dev)
npm run db:studio      # drizzle studio
```

`SKIP_ENV_VALIDATION=true` bypasses env validation for lint/typecheck without secrets.

## Workflow notes

- We plan each feature as a PRD in `docs/PRD/` before implementing.
- MCP servers (`.mcp.json`): **context7** for up-to-date library docs, **playwright** for driving
  the app in the browser to verify flows.
- Available skill `better-auth-best-practices` is the reference for auth changes.
