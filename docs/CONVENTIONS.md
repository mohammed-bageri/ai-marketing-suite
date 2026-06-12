# Engineering Conventions

The single source of truth for how this app is built. Every PRD implementation follows these.
Keep it boring and consistent — consistency is the feature.

---

## 1. Layering & boundaries

Three layers, strictly separated:

```
app/        Routing + pages (Next.js). Thin. No business logic, no direct DB/AI.
server/     Backend: Hono routers (HTTP) → services (business logic) → db.
features/   Frontend feature modules: components, hooks, that call the API via RPC.
```

Hard rules:

- **The browser never calls OpenAI / Vercel Blob / the DB directly.** Only `server/services/*` do.
- **Routes are thin.** A Hono route validates input, calls a service, shapes the response. No prompt
  strings, no SQL, no provider SDK calls inside a route handler.
- **Services are HTTP-agnostic.** They take typed args and return typed data; they don't know about
  `Request`/`Response`. This keeps them testable and reusable.
- **`lib/` is shared and import-safe from both client and server** (env, auth clients, rpc, utils,
  schemas). Never import `server/*` or `db/*` from a client component.

---

## 2. Folder structure

```
app/
  (marketing)/            public landing
  (auth)/login/           email-OTP login
  (app)/                  authenticated area
    layout.tsx            session guard + shell (sidebar/topbar)
    dashboard|generate|history|improve/page.tsx
  api/[[...route]]/route.ts   Hono mount (Node runtime)
  layout.tsx  globals.css  not-found.tsx  error.tsx

server/
  app.ts                  root Hono app; chains routers; exports AppType
  routes/                 one router per resource: content.ts, generations.ts, images.ts, improve.ts
  services/               business logic (framework-agnostic)
    openai.ts             provider client singleton
    content/  image/  improve/
    prompts/              prompt registries (per content-type / per goal)
  middleware/             auth.ts (requireAuth), error.ts (onError)
  lib/                    server-only helpers: errors.ts, responses.ts, pagination.ts

db/
  schema.ts               Drizzle tables (split into schema/ if it grows)
  index.ts                drizzle client + re-exports
drizzle/                  generated SQL migrations (committed)

lib/                      shared, client+server safe
  env.ts auth.ts auth-client.ts rpc.ts email.ts utils.ts
  schemas/                Zod input schemas shared by routes AND forms (content.ts, improve.ts, image.ts)

features/<feature>/       frontend module (e.g. content-generator/, history/, content-improver/)
  components/             feature UI
  hooks/                  React Query hooks (use-generate-content.ts, ...)
components/
  ui/                     shadcn primitives (generated)
  shell/                  sidebar, topbar, theme-toggle, user-menu
  shared/                 PageHeader, EmptyState, CopyButton, Confirm, states

docs/                     PRDs, architecture, this file
```

---

## 3. Naming

- **Files & folders: kebab-case** everywhere (`content-generator.ts`, `use-generations.ts`). Matches
  the existing repo and shadcn.
- **React components**: PascalCase identifiers; one main component per file.
- **Hooks**: `useThing`, file `use-thing.ts`.
- **Types**: PascalCase, prefer `type` over `interface`. No `any`; use `unknown` + narrowing.
- **Zod schemas**: `thingSchema`; inferred type `type Thing = z.infer<typeof thingSchema>`.
- **DB**: table & column names `snake_case`; Drizzle TS fields `camelCase` (mapped in schema).
- **Env vars**: `SCREAMING_SNAKE_CASE`; client-exposed must be `NEXT_PUBLIC_*`.

---

## 4. API standard (Hono)

### Shape

- Base path `/api`. JSON in/out. RESTful, resource-oriented.
- **One router per resource** in `server/routes/`, each a chained Hono instance for type inference.
- Chained in `server/app.ts` so `AppType` stays accurate for the RPC client:

```ts
const routes = app
  .route('/content', contentRouter)
  .route('/generations', generationsRouter)
  .route('/improve', improveRouter)
export type AppType = typeof routes
```

### Endpoint conventions

| Action            | Method + path                          | Success |
| ----------------- | -------------------------------------- | ------- |
| Create / run      | `POST /api/<resource>`                 | `201`   |
| List (paginated)  | `GET /api/<resource>?page=&pageSize=`  | `200`   |
| Read one          | `GET /api/<resource>/:id`              | `200`   |
| Delete            | `DELETE /api/<resource>/:id`           | `200`   |
| Sub-resource      | `POST /api/<resource>/:id/<sub>`       | `201`   |

### Responses

- **Success returns the payload raw** (no `data` wrapper) — clean for RPC and the client:
  - single/create → the resource object
  - delete → `{ "success": true }`
  - list → a pagination envelope:

    ```json
    { "items": [ ... ], "page": 1, "pageSize": 12, "total": 47, "totalPages": 4 }
    ```

- **Errors always use one envelope:**

  ```json
  { "error": { "message": "Human-readable message", "code": "optional_machine_code" } }
  ```

### Status codes

`200` ok · `201` created · `400` validation/bad input · `401` no/invalid session ·
`403` authenticated but not owner · `404` not found (or not owned) · `409` conflict ·
`429` rate limited (future) · `502` upstream provider (OpenAI/Blob) failed · `500` unexpected.

### Validation

- Validate at the boundary with `@hono/zod-validator`:

  ```ts
  app.post('/', requireAuth, zValidator('json', createContentSchema), (c) => {
    const input = c.req.valid('json') // typed + validated
  })
  ```

- Schemas live in `lib/schemas/` and are imported by **both** the route and the matching
  react-hook-form. Inputs validated client-side too, but the server is the source of truth.

### Errors

- Throw a typed `ApiError(status, message, code?)` from `server/lib/errors.ts` in routes/services.
- A single Hono `onError` in `server/middleware/error.ts` maps:
  - `ApiError` → its status + envelope,
  - Zod errors → `400` with the first message,
  - anything else → `500` (log server-side, generic message to client; never leak stack/keys).
- Never `console.log` secrets or full provider responses to the client.

### Auth in routes

- `requireAuth` middleware loads the Better Auth session, sets context vars, else throws `401`:

  ```ts
  new Hono<{ Variables: { user: User; session: Session } }>()
  // requireAuth → c.set('user', session.user)
  const user = c.get('user') // available in handlers
  ```

- **Every owner-scoped query filters by `c.get('user').id`.** Reading/deleting another user's row
  returns `404` (don't reveal existence).

---

## 5. Data layer (Drizzle + Neon)

- IDs: `text` PK, `$defaultFn(() => crypto.randomUUID())` for our tables (Better Auth manages its own).
- Timestamps: `createdAt` (default now) on every table; `updatedAt` where rows mutate.
- Ownership: every user-owned table has `userId text → user.id` with `onDelete: 'cascade'`.
- Indexes: add `(userId, createdAt desc)` for any listed resource.
- JSON: structured AI output stored as `jsonb` (`result`), with a flattened `plainText` for
  search/copy/download.
- Migrations workflow: edit `db/schema.ts` → `npm run db:generate` → review the SQL in `drizzle/` →
  `npm run db:migrate` → commit the migration. Use `db:push` only for throwaway local iteration.
- Queries live in services (or `server/lib`), never in routes or components.

---

## 6. AI / services standard

- One provider client singleton (`server/services/openai.ts`) using `env.OPENAI_API_KEY`.
- **Structured output**: every generation uses OpenAI JSON-schema structured outputs, validated
  against the matching Zod schema before returning. Never `JSON.parse` blind.
- **Prompt strategy lives in registries** (`server/services/prompts/`) keyed by content-type / goal —
  distinct system prompts, not one generic prompt (this is graded).
- Services return typed results; routes persist + shape the HTTP response.
- Wrap provider calls in try/catch → throw `ApiError(502, ...)` on upstream failure with a friendly
  message; surface a retry affordance in the UI.

---

## 7. Frontend standard

- **Server Components by default.** Add `'use client'` only for interactivity (forms, hooks, state).
- **Server state → TanStack Query**, always through the typed RPC client (`lib/rpc.ts`). No raw
  `fetch` in components.
  - Query key convention: `['<resource>', params?]` e.g. `['generations', { page, contentType, q }]`.
  - Hooks per feature in `features/<x>/hooks/`. Mutations invalidate the relevant keys; use optimistic
    updates where a PRD calls for it (e.g. delete).
- **Forms → react-hook-form + `zodResolver`** using the shared schema from `lib/schemas/`.
- **Client state**: local `useState` for ephemeral UI; **zustand only** for genuine cross-component
  client state (introduce a store lazily, don't pre-build one).
- **Feedback**: `sonner` toasts for success/error; inline messages for form/field errors.
- **States are first-class**: every data view ships loading (skeleton matching layout), empty
  (`EmptyState`), and error states — not just the happy path.
- Reuse `components/shared/*` (`PageHeader`, `EmptyState`, `CopyButton`, `Confirm`) — don't re-roll.

---

## 8. Type safety

- TS `strict`; no `any`. Prefer inference over annotation.
- End-to-end types: env (`lib/env.ts`) → DB (Drizzle infer) → API (`AppType` via RPC) → UI. A change
  to a route signature should surface as a type error in the client.
- Path alias `@/*` → repo root.

---

## 9. Tooling & quality gate

Before any commit, these must pass:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (flat config)
npm run format      # prettier --write  (no-semi, single-quote, 100 col)
```

- Prettier owns formatting; don't hand-format. Match surrounding style.
- `SKIP_ENV_VALIDATION=true` for typecheck/lint without secrets.

---

## 10. Git & workflow

- **Conventional commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `style:`, `test:`.
  One logical change per commit; imperative subject; co-author trailer for AI-assisted commits.
- One PRD = one focused branch (`feat/01-design-system`) merged to `main`; `main` stays deployable.
- Verify flows in the browser via the Playwright MCP before calling a PRD done.

---

## 11. Testing (time-boxed)

Given the 48h window, the safety net is **typecheck + lint + manual/Playwright verification**.
Add lightweight unit tests only for pure, high-value logic (prompt builders, pagination, the visual-
prompt builder). Don't invest in broad coverage at the expense of shipping.

---

## New dependencies implied by these standards

- `@hono/zod-validator` — request validation (add when starting the API).
- `@vercel/blob` — image storage (PRD 04).
