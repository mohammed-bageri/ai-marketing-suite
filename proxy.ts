import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Fast UX guard: redirects unauthenticated users away from app routes before render.
 * This is a presence check only (no DB call); the (app) layout re-verifies the session
 * server-side as the real gate.
 */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)

  if (!sessionCookie) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/generate/:path*', '/improve/:path*', '/history/:path*']
}
