import type { ContentfulStatusCode } from 'hono/utils/http-status'

/**
 * Typed application error. Thrown from routes/services and mapped to the
 * standard error envelope by the central `onError` handler.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: ContentfulStatusCode,
    message: string,
    public readonly code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const unauthorized = (message = 'You must be signed in') =>
  new ApiError(401, message, 'unauthorized')

export const notFound = (message = 'Not found') => new ApiError(404, message, 'not_found')

export const badRequest = (message: string, code = 'bad_request') =>
  new ApiError(400, message, code)

export const upstreamError = (message = 'The AI provider failed. Please try again.') =>
  new ApiError(502, message, 'upstream_error')
