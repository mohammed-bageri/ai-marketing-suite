# Architecture Notes

_AI Content Marketing Suite — Magna Labs assessment._

## Design choices

**One Next.js app, Hono for the API.** Rather than split frontend and backend, the whole product is
a single Next.js 16 app deployed to Vercel. Hono runs as one application mounted at
`app/api/[[...route]]/route.ts`. This gives a clean, conventional REST surface _and_ an end-to-end
typed RPC client (`hono/client`) the frontend consumes through TanStack Query — request and response
types can't drift from the server. It keeps deployment to a single artifact, which matters in a
48-hour build.

**Server-side AI boundary.** OpenAI is called only from `server/services`. The browser never holds
provider keys and never calls OpenAI directly, satisfying the brief's security rule. The same
boundary covers both text and image generation; the image prompt is _built_ server-side from the
content's topic, tone, type, and body so the frontend just clicks "generate image."

**Per-content-type prompt strategy.** Content generation is not one generic prompt. Each type (blog
post, LinkedIn post, ad copy, email) has its own system prompt, structure, and constraints, selected
server-side from the request — this is where most of the output-quality score lives.

**Serverless-first persistence.** Neon Postgres with Drizzle's `neon-http` driver avoids holding TCP
pools open in short-lived Vercel functions. Drizzle keeps schema, migrations, and queries type-safe
and close to SQL.

**Passwordless auth.** Better Auth with email OTP — no password storage, fast to use in a demo, and
production-reasonable. Resend delivers codes, with a console fallback so the flow works locally
before a domain is verified.

**Validated configuration.** `@t3-oss/env-nextjs` validates every env var at startup, so a missing
key fails fast at build/boot rather than as a runtime 500 mid-demo.

## Trade-offs

- **RPC coupling vs. plain REST.** The typed RPC client couples the frontend to the server's types.
  That's a deliberate win for a solo, full-stack build; a public/third-party API would favor a
  decoupled, versioned REST contract (still possible — the routes _are_ REST).
- **`neon-http` vs. WebSocket pooling.** HTTP is simplest and serverless-friendly but does one round
  trip per query (no interactive transactions). Acceptable for this workload; the driver can be
  swapped for the WebSocket pool if multi-statement transactions become necessary.
- **OpenAI for both text and images.** Fewer moving parts and one key, at the cost of provider
  diversity. The `server/services` boundary keeps providers swappable.
- **Scaffold-first.** Foundations (auth, db, env, API mount, design system) were built before
  features so each feature PRD drops into a stable, typed skeleton — favoring quality over a faster
  first feature.

## What I'd build next with more time

- Brand voice settings persisted per user and injected into prompts (bonus).
- Image style picker + thumbnail variants; store images in object storage (R2/S3) instead of URLs.
- Streaming generation (token-by-token) for better perceived latency.
- Rate limiting and per-user usage quotas on AI endpoints.
- Export to PDF / DOCX (bonus) and shareable read-only links.
- Background job queue for image generation with optimistic UI and retries.
- Test coverage: unit tests for prompt builders, integration tests for the API routes.
