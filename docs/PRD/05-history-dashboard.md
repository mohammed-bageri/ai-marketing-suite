# PRD 05 — Content History & Dashboard

## Problem & goal

Generated content and images must be saved and browsable. Users view past generations (text + matching
image + metadata), copy, download, and delete them, in a clean, fast, **paginated** dashboard.
(20-pt Backend/API + contributes to the 15-pt UI score.)

## User stories

- As a user, I see all my past generations newest-first, with type, topic, tone, and date.
- As a user, I open one to see the full text and its matching image.
- As a user, I copy, download, or delete any generation.
- As a user, I page through results quickly and can filter by content type / search by topic.

## Scope

**In:** paginated list endpoint, detail view, delete, copy/download, filter by type, search by topic,
empty/loading states.
**Out:** bulk actions, folders/tags, sharing links (future).

## Data model

Uses `generations` (PRD 03) and `generation_images` (PRD 04). No new tables. Indexes:
`(userId, createdAt desc)` for the list; optional `contentType` filter.

## API endpoints

#### `GET /api/generations`

Paginated, owner-scoped list. Auth required.

Query: `page` (default 1), `pageSize` (default 12, max 50), `contentType?`, `q?` (topic search).

Response `200`:

```json
{
  "items": [
    { "id": "gen_…", "contentType": "email", "topic": "Q3 newsletter",
      "tone": "friendly", "createdAt": "2026-06-12T…Z",
      "previewText": "Subject: …", "imageUrl": "https://…/img.png" }
  ],
  "page": 1, "pageSize": 12, "total": 47, "totalPages": 4
}
```

#### `GET /api/generations/:id`

Full generation: inputs, structured `result`, `plainText`, and its images. `404` if not owned.

#### `DELETE /api/generations/:id`

Delete a generation (cascades to its images + Blob assets). Response `200 { "success": true }`.
`404` if not owned.

(Image list/create live in PRD 04.)

## UI/UX

- `(app)/history`: responsive **card grid** (thumbnail image + type badge + topic + tone + relative
  date) — visual and scannable; powered by TanStack Query.
- Toolbar: content-type filter (tabs/select) + topic search (debounced) + result count.
- **Pagination** control (server-side); keep it fast — query cached per page, prefetch next page.
- **Detail**: dialog or `(app)/history/[id]` route showing full text rendered per type + active image
  + variants; actions: Copy, Download (text .md/.txt + image), Delete (with `Confirm` dialog + toast).
- Empty state ("No generations yet — create your first") and skeleton grid while loading.
- Optimistic delete with rollback on error.

## Dependencies

- `@tanstack/react-query` + `@tanstack/react-table` (installed) — table optional; grid is primary.
- shadcn `badge`, `card`, `pagination`, `alert-dialog`, `skeleton`, `input`.

## Acceptance criteria

- [ ] List is paginated server-side, owner-scoped, newest-first, and fast.
- [ ] Filter by content type and search by topic work and combine with pagination.
- [ ] Detail shows full text (per type) + matching image(s) + metadata.
- [ ] Copy, download (text + image), and delete all work; delete confirms and is optimistic.
- [ ] Deleting removes DB rows and associated Blob assets.
- [ ] Empty/loading/error states are polished. typecheck / lint / format pass.
