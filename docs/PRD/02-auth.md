# PRD 02 — Authentication (Email OTP)

## Problem & goal

Users must log in before using the product, and every generation is scoped to a user. We use
passwordless **email OTP**: enter email → receive a 6-digit code → enter code → session. Better
Auth is already configured (`lib/auth.ts`, `emailOTP` plugin, `nextCookies`); this PRD delivers the
UI, route protection, and session UX.

## User stories

- As a visitor, I enter my email and receive a one-time code.
- As a visitor, I enter the code and land in the dashboard; my account is created on first sign-in.
- As a user, I stay signed in across reloads and can sign out from the user menu.
- As a user, visiting an app route while signed out sends me to login and back after.

## Scope

**In:** login screen (two-step: email → OTP), resend code, sign-out, session display in the user
menu, route protection for `(app)/*`, redirect handling.
**Out:** social logins, password auth, org/teams, email template design beyond a clean text email.

## Data model

No changes — Better Auth's `user`, `session`, `account`, `verification` tables already exist in
`db/schema.ts`. The `emailOTP` plugin stores codes in `verification`.

## API endpoints

All under `/api/auth/*`, handled by Better Auth (documented for the README):

| Method | Path                                          | Purpose                         |
| ------ | --------------------------------------------- | ------------------------------- |
| POST   | `/api/auth/email-otp/send-verification-otp`   | Send a login code to an email   |
| POST   | `/api/auth/sign-in/email-otp`                 | Verify code, create session     |
| GET    | `/api/auth/get-session`                       | Current session (or null)       |
| POST   | `/api/auth/sign-out`                          | Clear session                   |

**Send code** — request:

```json
{ "email": "marketer@acme.com", "type": "sign-in" }
```

Response `200`: `{ "success": true }`

**Verify code** — request:

```json
{ "email": "marketer@acme.com", "otp": "123456" }
```

Response `200`: `{ "token": "...", "user": { "id": "...", "email": "..." } }`
Errors: `400` invalid/expired code (`{ "error": { "message": "Invalid code" } }`).

Client calls these via `authClient` (`lib/auth-client.ts`): `authClient.emailOtp.sendVerificationOtp`
and `authClient.signIn.emailOtp`.

## UI/UX

- Split-panel `(auth)` layout: left = form card, right = monochrome brand panel (hidden on mobile).
- **Step 1:** email input + "Send code" (react-hook-form + Zod). On success, advance to step 2.
- **Step 2:** `input-otp` 6-cell field, auto-submit on complete, "Resend" with a 30s cooldown,
  "Use a different email" back link. Show the destination email.
- Loading and error states inline; `sonner` toast on send/verify failures.
- After verify → redirect to `redirect` query param or `/dashboard`.

## Route protection

- `(app)/layout.tsx` (server component): `await auth.api.getSession(...)`; if no session, redirect
  to `/login?redirect=<path>`.
- Optionally a `middleware.ts` fast-path that checks the session cookie to avoid flashes.
- User menu: shows email + initials avatar; "Sign out" calls `authClient.signOut()` then routes to
  `/login`.

## Dependencies

- shadcn `input-otp`, `form`, `card`, `avatar`, `dropdown-menu` (from PRD 01 inventory).
- Resend key for real email delivery; dev falls back to console (`lib/email.ts`).

## Acceptance criteria

- [ ] Full email → code → session flow works end-to-end (incl. account creation on first sign-in).
- [ ] Invalid/expired codes show a clear error; resend works with cooldown.
- [ ] `(app)/*` is unreachable when signed out; redirect returns the user to the intended page.
- [ ] Session persists across reload; sign-out clears it and redirects to login.
- [ ] No layout flash for authenticated routes; works in light/dark and mobile.
- [ ] typecheck / lint / format pass.
