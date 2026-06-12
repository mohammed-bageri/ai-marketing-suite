# Product Requirement Docs

One PRD per slice of work. We write the PRD, agree on scope, then implement against the stable
scaffold. Design comes first so every feature drops into a finished shell.

## PRDs

| #   | Feature                     | File                          | Status  |
| --- | --------------------------- | ----------------------------- | ------- |
| 01  | Design System & App Shell   | `01-design-system.md`         | planned |
| 02  | Authentication (Email OTP)  | `02-auth.md`                  | planned |
| 03  | AI Content Generator        | `03-content-generator.md`     | planned |
| 04  | AI Image Generator          | `04-image-generator.md`       | planned |
| 05  | Content History & Dashboard | `05-history-dashboard.md`     | planned |
| 06  | AI Content Improver         | `06-content-improver.md`      | planned |

## Build order & dependencies

```
01 Design System ──┬─> 02 Auth ──> 03 Content Generator ──> 04 Image Generator
                   │                        │
                   └────────────────────────┴─> 05 History & Dashboard
                                            └──> 06 Content Improver
```

Design and auth are foundational. The content generator establishes the `generations` data model
that the image generator, history dashboard, and improver all build on.

## Aesthetic direction (locked)

- **Vercel/Linear monochrome.** Grayscale only (shadcn `neutral` tokens), high contrast, hairline
  borders, dense layouts, generous whitespace at the page level. No accent color.
- **Theme:** follows the OS preference on first load, with a manual toggle.
- **The "wow" is craft, not color:** typography scale, optical spacing, snappy transitions,
  thoughtful empty/loading states, and consistent density.

## PRD template

Each PRD covers: problem & goal, user stories, scope (in/out), data model, API endpoints
(method, path, request, response, errors), prompt strategy (AI features), UI/UX, dependencies,
and acceptance criteria.

## Shared conventions

- **API base:** `/api` (Hono). JSON only. Error envelope: `{ "error": { "message", "code"? } }`.
- **Auth:** all feature endpoints require a valid Better Auth session; unauthenticated → `401`.
- **Validation:** every request body/query parsed with Zod at the route boundary.
- **AI boundary:** OpenAI is called only from `server/services/*`. Never from the client.
- **Data ownership:** every row is scoped to `userId`; queries always filter by the session user.
