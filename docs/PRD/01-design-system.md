# PRD 01 — Design System & App Shell

## Problem & goal

Before any feature, the product needs a finished-feeling skin: an opinionated, **Vercel/Linear-grade
monochrome** design system and a reusable application shell. The goal is that the moment someone
opens the app — landing, login, or dashboard — it reads as a polished, real SaaS product. Every
later feature should drop into this shell without bespoke layout work.

This PRD is the foundation for the 15-pt Frontend/UI-UX score and the overall "feels like a real
product" impression.

## Success criteria (the "wow")

- First paint of the landing and dashboard looks intentional and premium, not like a template.
- Perfectly consistent spacing, type scale, and border treatment across every screen.
- Snappy, subtle motion (hover, focus, route/skeleton transitions) — never flashy.
- Looks equally sharp in light and dark, and from mobile to wide desktop.

## Design language

**Palette — monochrome only.** Reuse the existing shadcn `neutral` tokens in `app/globals.css`
(true grayscale: `oklch` with zero chroma). No accent/brand color. Contrast comes from
near-black/near-white `primary`, `muted-foreground` for secondary text, and `border` hairlines.
`destructive` (subtle red) is the only non-gray, reserved for delete/error.

**Typography.**

- Sans: **Geist** (already wired as `--font-sans`).
- Mono: add **Geist Mono** as `--font-mono` for metadata, counts, timestamps, code, and the
  monospace numerals that give the Linear/Vercel feel.
- Type scale (Tailwind): page title `text-2xl/3xl font-semibold tracking-tight`, section
  `text-lg font-medium`, body `text-sm`, meta `text-xs text-muted-foreground`. Use `text-balance`
  on headings and `text-pretty` on prose.

**Shape & density.**

- Radius: tighten `--radius` to `0.5rem` for a sharper, more "tool-like" feel.
- Borders: 1px hairlines (`border-border`); prefer borders over shadows. Shadows only `shadow-xs`.
- Density: compact controls (default button/input height ~`h-8`/`h-9`), tight table rows, but
  roomy page padding (`p-6`/`p-8`) and clear section rhythm.

**Motion.** `transition-colors`/`transition-all` ~150ms on interactive elements; skeleton
shimmer for loading; `disableTransitionOnChange` already set on the theme provider to avoid flash.

## App shell & layout

Route groups under `app/`:

```
app/
  (marketing)/
    layout.tsx          minimal top nav + footer
    page.tsx            landing (hero, feature grid, CTA)
  (auth)/
    layout.tsx          centered, split-panel auth layout
    login/page.tsx      email OTP (PRD 02)
  (app)/
    layout.tsx          authenticated shell: sidebar + topbar
    dashboard/page.tsx  overview / launchpad
    generate/page.tsx   content generator (PRD 03)
    history/page.tsx     history dashboard (PRD 05)
    improve/page.tsx    content improver (PRD 06)
```

**Authenticated shell (`(app)/layout.tsx`):**

- **Collapsible sidebar** (shadcn `sidebar` block): brand mark, primary nav (Dashboard, Generate,
  History, Improve), collapses to icons; mobile = off-canvas sheet.
- **Topbar:** breadcrumb (route-aware), right-aligned theme toggle + user menu (avatar → email,
  sign out). Sticky, hairline bottom border, subtle backdrop blur.
- **Content area:** max-width container, consistent page header pattern (title + description +
  optional primary action), then the page body.

**Reusable patterns to standardize (used by every feature PRD):**

- `PageHeader` (title, description, actions slot).
- `EmptyState` (icon, title, hint, primary action) — e.g., "No generations yet."
- `LoadingState` / skeletons matching final layout (cards, table rows).
- Toasts via `sonner` (already mounted) for success/error.
- `CopyButton`, `Confirm` (destructive dialog) — shared across features.

## Component inventory (shadcn)

Install via the shadcn CLI, **using the project's current Base UI preset** so primitives stay
consistent (the repo was initialized with the Base UI registry, not Radix):

`sidebar`, `button` (present), `input`, `textarea`, `label`, `select`, `dropdown-menu`, `card`,
`table`, `tabs`, `dialog`/`alert-dialog`, `badge`, `avatar`, `separator`, `tooltip`, `skeleton`,
`scroll-area`, `sonner` (present), `breadcrumb`, `sheet`, `form` (react-hook-form wiring),
`input-otp` (for PRD 02), `pagination`.

> **Reuse blocks where possible:** start from a shadcn **login block** and **sidebar/dashboard
> block**, then strip to monochrome and adapt to the OTP flow and our nav. If a block ships
> Radix-based components that conflict with the Base UI preset, compose the screen from the
> primitives above instead — the block is a layout reference, not a hard dependency.

## Screens in scope for this PRD

1. **Landing** (`(marketing)`): hero with bold monochrome headline + subhead + dual CTA, a 3–4
   card feature grid (Generate / Illustrate / Improve / History), a thin footer. Refines the
   placeholder already in `app/page.tsx`.
2. **App shell**: sidebar + topbar + theme toggle + user menu (user menu finalized in PRD 02).
3. **Dashboard** (`(app)/dashboard`): a launchpad — greeting, quick-action cards linking to each
   feature, and a "recent generations" slot (wired to real data in PRD 05; shows `EmptyState`
   until then).
4. **Global states**: 404 (`not-found.tsx`), error boundary (`error.tsx`), loading skeletons.

## Dependencies

- shadcn components listed above (CLI).
- `next/font/google` Geist Mono (`--font-mono`).
- No new runtime libraries beyond what's installed.

## Out of scope

- Real auth gating of `(app)` routes → PRD 02.
- Any AI calls or data fetching → PRD 03+.
- Persisted user settings / brand voice → future (bonus).

## Acceptance criteria

- [ ] Theme toggle works; respects system on first load; no flash on switch.
- [ ] Geist + Geist Mono applied; type scale and `tracking-tight` headings consistent.
- [ ] `--radius` and hairline-border treatment applied globally; zero non-gray color except
      `destructive`.
- [ ] Authenticated shell renders sidebar (collapsible + mobile sheet) and topbar with breadcrumb,
      theme toggle, and user-menu placeholder.
- [ ] Landing, dashboard, 404, and error/loading states all look finished and on-brand.
- [ ] Fully responsive 360px → 1440px+; no layout breakage; keyboard-focusable controls.
- [ ] `PageHeader`, `EmptyState`, skeletons, `CopyButton`, and `Confirm` exist and are reused.
- [ ] `npm run typecheck`, `npm run lint`, `npm run format:check` pass.
