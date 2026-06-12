import { env } from '@/lib/env'

/**
 * Blob is usable if either:
 *  - BLOB_READ_WRITE_TOKEN is set (works anywhere, incl. local dev), or
 *  - BLOB_STORE_ID is present (Vercel-connected store → SDK uses OIDC, no token needed).
 */
export const blobConfigured = Boolean(env.BLOB_READ_WRITE_TOKEN || env.BLOB_STORE_ID)

/**
 * Token option for @vercel/blob calls. Pass the explicit token when present;
 * otherwise omit it so the SDK falls back to OIDC on Vercel.
 */
export const blobTokenOption: { token?: string } = env.BLOB_READ_WRITE_TOKEN
  ? { token: env.BLOB_READ_WRITE_TOKEN }
  : {}
