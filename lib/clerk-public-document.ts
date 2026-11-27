/**
 * Anonymous document loads of public pages skip Clerk's development handshake.
 * A dev instance otherwise answers the first navigation with a 307 to
 * accounts.dev (`dev-browser-missing`) before any HTML, which mobile
 * Lighthouse counts as about 1.5s of redirect before the LCP image can start.
 * Signed-in browsers still carry a session cookie and run clerkMiddleware.
 * Mutations, API routes, and protected pages always run it too.
 */

const PROTECTED_PREFIXES = ["/admin", "/trips", "/bookings", "/budget"] as const

export function hasClerkSessionCookie(cookie: string | null): boolean {
  if (!cookie) return false
  if (/(?:^|;\s*)__session(?:=|_)/.test(cookie)) return true
  const clientUat = cookie.match(/(?:^|;\s*)__client_uat=([^;]*)/)
  if (!clientUat) return false
  const value = clientUat[1]?.trim() ?? ""
  return value !== "" && value !== "0"
}

export function shouldSkipClerkHandshake(input: {
  method: string
  pathname: string
  cookie: string | null
  nextAction: string | null
  authorization: string | null
}): boolean {
  if (input.method !== "GET" && input.method !== "HEAD") return false
  if (input.nextAction) return false
  if (input.authorization?.trim()) return false
  const pathname = input.pathname
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/trpc") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup")
  ) {
    return false
  }
  if (
    PROTECTED_PREFIXES.some(
      prefix => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  ) {
    return false
  }
  return !hasClerkSessionCookie(input.cookie)
}
