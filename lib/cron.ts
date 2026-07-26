/*
<ai_context>
Shared authorization for cron route handlers. Vercel Cron invokes routes with an
`Authorization: Bearer <CRON_SECRET>` header; every cron route must verify it so the
endpoints cannot be triggered publicly.
</ai_context>
*/

import { NextResponse } from "next/server"

/**
 * Returns an unauthorized `NextResponse` when the request is not an authentic cron
 * invocation, or `null` when the request is authorized. Usage:
 *
 * ```ts
 * const denied = verifyCronRequest(req)
 * if (denied) return denied
 * ```
 */
export function verifyCronRequest(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    // Fail closed: without a configured secret we cannot authenticate the caller.
    console.error("[cron] CRON_SECRET is not configured; refusing request")
    return new NextResponse("Cron not configured", { status: 503 })
  }

  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  return null
}
