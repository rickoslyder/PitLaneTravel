/*
<ai_context>
Contains middleware for protecting routes, checking user authentication, and redirecting as needed.
</ai_context>
*/

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Routes that require an authenticated session. Server actions and route handlers
// still enforce their own authorization (see lib/auth.ts); this is defense-in-depth.
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/trips(.*)",
  "/bookings(.*)",
  "/budget(.*)"
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      const signIn = new URL("/login", req.url)
      signIn.searchParams.set("redirect_url", req.nextUrl.pathname)
      return NextResponse.redirect(signIn)
    }
  }
})

// Keep the matcher pattern for static assets
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/trips(.*)",
    "/progressier(.*)"
  ]
}
