type ResponseLike = { ok: boolean; json: () => Promise<unknown> }

/**
 * Unwraps a Hono RPC response: returns the JSON body (typed by the caller) on
 * success, or throws an Error carrying the server's error-envelope message.
 *
 * The caller supplies the type because over-the-wire JSON differs from the
 * server's TS types (e.g. `Date` arrives as an ISO string).
 */
export async function unwrap<T>(input: ResponseLike | Promise<ResponseLike>): Promise<T> {
  const res = await input
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null
    throw new Error(body?.error?.message ?? 'Request failed')
  }
  return (await res.json()) as T
}
