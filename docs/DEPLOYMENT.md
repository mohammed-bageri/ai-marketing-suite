# Deployment (Vercel + Neon)

Deploy the app to Vercel with a Neon Postgres database, Vercel Blob for images, and a real email
transport for login codes.

## Services you'll set up

| Service       | Purpose                  | Env var(s)                                    |
| ------------- | ------------------------ | --------------------------------------------- |
| Neon          | Production Postgres      | `DATABASE_URL`                                |
| Vercel Blob   | Image storage            | `BLOB_READ_WRITE_TOKEN` (auto-injected)       |
| OpenAI        | Text + image generation  | `OPENAI_API_KEY`                              |
| Email (SMTP)  | Login OTP delivery       | `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `EMAIL_FROM` |
| Better Auth   | Sessions                 | `BETTER_AUTH_SECRET` `BETTER_AUTH_URL` `NEXT_PUBLIC_APP_URL` |

> **Order matters:** all env vars must exist in Vercel **before** the build — env is validated at
> startup, and `NEXT_PUBLIC_APP_URL` is inlined into the client bundle at build time.

## 1. Neon (Postgres)

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the **pooled** connection string (it contains `-pooler`), e.g.
   `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require`
3. Apply the schema from your machine (one time):
   ```bash
   DATABASE_URL='<neon-pooled-url>' npm run db:migrate
   ```

## 2. Email (free, real delivery)

Pick one and grab SMTP credentials:

- **Brevo** (recommended, 300/day free, no domain needed): create account → **SMTP & API → SMTP**.
  - `SMTP_HOST=smtp-relay.brevo.com` · `SMTP_PORT=587` · `SMTP_USER=<your login>` · `SMTP_PASS=<SMTP key>`
  - `EMAIL_FROM="AI Marketing Suite <your-verified@email>"`
- **Gmail** (needs 2FA): create an **App Password**.
  - `SMTP_HOST=smtp.gmail.com` · `SMTP_PORT=587` · `SMTP_USER=<you@gmail.com>` · `SMTP_PASS=<app password>`
  - `EMAIL_FROM="AI Marketing Suite <you@gmail.com>"`

(You can also use Resend instead by setting `RESEND_API_KEY` and leaving `SMTP_*` empty.)

## 3. Secrets

```bash
openssl rand -base64 32   # → BETTER_AUTH_SECRET
```

## 4. Import the repo into Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → import `ai-marketing-suite` from GitHub.
2. Framework preset: **Next.js** (auto-detected). Leave build/output defaults.
3. Add **Environment Variables** (Production) before deploying:
   - `DATABASE_URL` = Neon pooled URL
   - `BETTER_AUTH_SECRET` = the generated secret
   - `OPENAI_API_KEY` = your key
   - `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `EMAIL_FROM` (from step 2)
   - `BETTER_AUTH_URL` = `https://<your-project>.vercel.app` (your production domain)
   - `NEXT_PUBLIC_APP_URL` = same production domain
4. **Deploy.**

## 5. Add Vercel Blob

1. In the project → **Storage → Create → Blob** → connect it.
2. Vercel injects `BLOB_READ_WRITE_TOKEN` into the project automatically.
3. **Redeploy** so the new env var is picked up (Deployments → ⋯ → Redeploy).

## 6. Fix the URLs (if needed) and redeploy

After the first deploy you'll see the real domain. If it differs from what you set in step 4, update
`BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to the actual domain and **redeploy** (these must match the
live origin for auth + the RPC client to work).

## 7. Smoke test the live app

1. Open the URL → **sign in** (check your email for the code).
2. **Generate** content → confirm copy/download.
3. **Generate image** → confirm it appears and **regenerate** with another style.
4. **Improve** a draft, check **History** (pagination, delete), and the **Account** page.

## Notes / gotchas

- Use the **pooled** Neon string; the app's postgres.js client is set to `max: 1, prepare: false`
  for serverless + pooler compatibility.
- Re-run `npm run db:migrate` against Neon whenever the schema changes.
- The API route runs on the Node.js runtime (Better Auth, postgres.js, nodemailer, Blob all need it).
- Local dev keeps using Docker (Postgres + Mailpit) via `.env.local`; production uses the values above.
