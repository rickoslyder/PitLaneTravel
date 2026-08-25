import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { NextURL } from "next/dist/server/web/next-url"
import { getRelativeURL } from "next/dist/shared/lib/router/utils/relativize-url"
import playwrightConfig from "../../playwright.config"

const CANONICAL_HOSTNAME = "localhost"
const CANONICAL_ORIGIN = "http://localhost:3100"

describe("PLT-009 loopback origin alignment", () => {
  it("normalizes 127.0.0.1 to localhost the way Next middleware request URLs do", () => {
    expect(new NextURL("http://127.0.0.1:3100/").href).toBe(
      "http://localhost:3100/"
    )
  })

  it("lets Next relativize a Clerk absolute rewrite when initUrl uses localhost", () => {
    const clerkRewrite = new NextURL("http://127.0.0.1:3100/").href
    expect(getRelativeURL(clerkRewrite, "http://localhost:3100/")).toBe("/")
    expect(getRelativeURL(clerkRewrite, "http://127.0.0.1:3100/")).toBe(
      "http://localhost:3100/"
    )
  })

  it("uses one canonical localhost origin for Playwright and the production bind", () => {
    const baseURL = playwrightConfig.use?.baseURL
    expect(baseURL).toBe(CANONICAL_ORIGIN)
    expect(new URL(String(baseURL)).hostname).toBe(CANONICAL_HOSTNAME)

    const webServer = playwrightConfig.webServer
    expect(webServer && !Array.isArray(webServer)).toBe(true)
    if (!webServer || Array.isArray(webServer)) {
      throw new Error("expected a single Playwright webServer config")
    }

    expect(webServer.url).toBe(baseURL)
    expect(new URL(String(webServer.url)).origin).toBe(CANONICAL_ORIGIN)
    expect(webServer.command).toMatch(/--hostname localhost(?:\s|$)/)
    expect(webServer.command).toMatch(/--port 3100(?:\s|$)/)
    expect(webServer.command).not.toMatch(/127\.0\.0\.1/)
  })
})

describe("production middleware remains Clerk-backed without a rewrite intern", () => {
  const root = process.cwd()
  const middlewareSource = readFileSync(path.join(root, "middleware.ts"), "utf8")

  it("exports clerkMiddleware as the production default and still calls auth()", () => {
    expect(middlewareSource).toMatch(
      /import\s*\{\s*clerkMiddleware[\s\S]*\}\s*from\s*["']@clerk\/nextjs\/server["']/
    )
    expect(middlewareSource).toMatch(/export default clerkMiddleware\s*\(/)
    expect(middlewareSource).toMatch(/isProtectedRoute\(req\)/)
    expect(middlewareSource).toMatch(/await auth\(\)/)
    expect(middlewareSource).toMatch(/redirect_url/)
    expect(middlewareSource).not.toMatch(/process\.env\.(NODE_ENV|VERCEL_ENV)/)
    expect(middlewareSource).not.toMatch(/process\.env\.CI\b/)
    expect(middlewareSource).not.toMatch(/PLAYWRIGHT/)
    expect(middlewareSource).toMatch(
      /from\s+["']@\/lib\/clerk-middleware-options["']/
    )
    expect(middlewareSource).toMatch(
      /export default clerkMiddleware\s*\([\s\S]*clerkMiddlewareNetworklessOptions\s*\(\s*\)/
    )
    expect(middlewareSource).not.toMatch(/process\.env\.CLERK_JWT_KEY/)
  })

  it("does not keep a same-origin rewrite intern helper or wrapper", () => {
    expect(middlewareSource).not.toMatch(/internSameOriginMiddlewareRewrite/)
    expect(middlewareSource).not.toMatch(
      /export default async function middleware/
    )
    expect(
      existsSync(path.join(root, "lib/intern-same-origin-middleware-rewrite.ts"))
    ).toBe(false)
    expect(
      existsSync(
        path.join(root, "lib/intern-same-origin-middleware-rewrite.test.ts")
      )
    ).toBe(false)
  })
})
