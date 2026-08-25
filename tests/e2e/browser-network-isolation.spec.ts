import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import {
  classifyBrowserRequest,
  isAppOriginConsoleError,
  isNetworkOnlyConsoleError
} from "./browser-network-isolation"

const root = process.cwd()

describe("PLT-009 browser network isolation", () => {
  it("allows only loopback application requests", () => {
    expect(classifyBrowserRequest("http://localhost:3100/")).toBe("allow")
    expect(classifyBrowserRequest("http://localhost:3100/races")).toBe("allow")
    expect(
      classifyBrowserRequest("http://127.0.0.1:3100/_next/static/chunk.js")
    ).toBe("allow")
    expect(classifyBrowserRequest("http://localhost:3100/favicon-32x32.png")).toBe(
      "allow"
    )
  })

  it("suppresses known telemetry, PWA, Speed Insights, and remote-image transport", () => {
    expect(
      classifyBrowserRequest("https://www.googletagmanager.com/gtm.js?id=GTM-PF957G29")
    ).toBe("suppress")
    expect(
      classifyBrowserRequest(
        "https://server-side-tagging-kes574yyaa-uc.a.run.app/g/collect?v=2"
      )
    ).toBe("suppress")
    expect(
      classifyBrowserRequest(
        "https://progressier.app/fCbsNMgvDZeSMoERSrZK/script.js"
      )
    ).toBe("suppress")
    expect(
      classifyBrowserRequest("https://progressier.app/fCbsNMgvDZeSMoERSrZK/progressier.json")
    ).toBe("suppress")
    expect(
      classifyBrowserRequest("http://localhost:3100/_vercel/speed-insights/script.js")
    ).toBe("suppress")
    expect(
      classifyBrowserRequest("http://127.0.0.1:3100/_vercel/insights/script.js")
    ).toBe("suppress")
    expect(
      classifyBrowserRequest("https://va.vercel-scripts.com/v1/speed-insights/script.js")
    ).toBe("suppress")
    expect(
      classifyBrowserRequest("http://localhost:3100/ingest/e")
    ).toBe("suppress")
    expect(
      classifyBrowserRequest("http://127.0.0.1:3100/ingest/static/array.js")
    ).toBe("suppress")
    expect(
      classifyBrowserRequest("https://www.pitlanetravel.com/ingest/e/")
    ).toBe("suppress")
    expect(
      classifyBrowserRequest(
        "https://www.pitlanetravel.com/ingest/static/array.js"
      )
    ).toBe("suppress")
    expect(
      classifyBrowserRequest(
        "http://localhost:3100/_next/image?url=https%3A%2F%2Fci-invalid.supabase.co%2Fhero.jpeg&w=1920&q=75"
      )
    ).toBe("suppress")
    expect(
      classifyBrowserRequest(
        "https://ci.invalid/npm/@clerk/clerk-js@5/dist/clerk.browser.js"
      )
    ).toBe("suppress")
    expect(classifyBrowserRequest("https://posthog.invalid/e")).toBe("suppress")
    expect(
      classifyBrowserRequest("https://us.i.posthog.com/static/array.js")
    ).toBe("suppress")
    expect(
      classifyBrowserRequest(
        "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Bahrain_Circuit.png"
      )
    ).toBe("suppress")
  })

  it("suppresses only the known jsDelivr lite-youtube-embed assets used by YouTubeEmbed", () => {
    expect(
      classifyBrowserRequest(
        "https://cdn.jsdelivr.net/gh/paulirish/lite-youtube-embed@master/src/lite-yt-embed.css"
      )
    ).toBe("suppress")
    expect(
      classifyBrowserRequest(
        "https://cdn.jsdelivr.net/gh/paulirish/lite-youtube-embed@master/src/lite-yt-embed.js"
      )
    ).toBe("suppress")
  })

  it("denies other external hosts so they cannot succeed", () => {
    expect(classifyBrowserRequest("https://ci.invalid/v1/client")).toBe("deny")
    expect(classifyBrowserRequest("https://clerk.invalid/npm/@clerk")).toBe(
      "deny"
    )
    expect(classifyBrowserRequest("https://example.com/")).toBe("deny")
    expect(classifyBrowserRequest("https://www.pitlanetravel.com/")).toBe(
      "deny"
    )
    expect(classifyBrowserRequest("https://www.pitlanetravel.com/races")).toBe(
      "deny"
    )
    expect(
      classifyBrowserRequest("http://localhost:3100/api/cron/update-sessions")
    ).toBe("allow")
    expect(classifyBrowserRequest("http://localhost:3100/ingest-foo")).toBe(
      "allow"
    )
    expect(
      classifyBrowserRequest(
        "http://localhost:3100/_next/image?url=%2Fandroid-chrome-512x512.png&w=640&q=75"
      )
    ).toBe("allow")
    expect(
      classifyBrowserRequest(
        "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1"
      )
    ).toBe("deny")
    expect(
      classifyBrowserRequest(
        "https://cdn.jsdelivr.net/gh/paulirish/lite-youtube-embed@master/src/other.js"
      )
    ).toBe("deny")
    expect(
      classifyBrowserRequest(
        "https://cdn.jsdelivr.net/gh/paulirish/other-embed@master/src/lite-yt-embed.js"
      )
    ).toBe("deny")
    expect(
      classifyBrowserRequest(
        "https://cdn.jsdelivr.net/npm/lite-youtube-embed/src/lite-yt-embed.js"
      )
    ).toBe("deny")
    expect(
      classifyBrowserRequest(
        "https://cdn.jsdelivr.net/gh/paulirish/lite-youtube-embed@v0.3.0/src/lite-yt-embed.js"
      )
    ).toBe("deny")
    expect(
      classifyBrowserRequest(
        "https://fastly.jsdelivr.net/gh/paulirish/lite-youtube-embed@master/src/lite-yt-embed.js"
      )
    ).toBe("deny")
    expect(
      classifyBrowserRequest("https://www.youtube.com/embed/gYzVprg_NNs")
    ).toBe("deny")
    expect(
      classifyBrowserRequest("https://www.youtube.com/s/player/player.js")
    ).toBe("deny")
    expect(classifyBrowserRequest("https://example.com/lite-yt-embed.js")).toBe(
      "deny"
    )
  })

  it("keeps app-origin console failures strict and cannot hide Error fetching next race", () => {
    expect(
      isAppOriginConsoleError(
        "Error fetching next race: Error: Failed to get races"
      )
    ).toBe(true)
    expect(
      isAppOriginConsoleError(
        "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT"
      )
    ).toBe(false)
    expect(
      isAppOriginConsoleError(
        "Access to fetch at 'https://server-side-tagging.example/g/collect' from origin 'http://localhost:3100' has been blocked by CORS policy"
      )
    ).toBe(false)
  })

  it("treats same-origin HTTP 500 Failed to load resource as an app-origin console error", () => {
    const text =
      "Failed to load resource: the server responded with a status of 500 (Internal Server Error)"
    expect(isNetworkOnlyConsoleError(text)).toBe(false)
    expect(isAppOriginConsoleError(text)).toBe(true)
  })

  it("treats same-origin HTTP 404 Failed to load resource as an app-origin console error", () => {
    const text =
      "Failed to load resource: the server responded with a status of 404"
    expect(isNetworkOnlyConsoleError(text)).toBe(false)
    expect(isAppOriginConsoleError(text)).toBe(true)
  })

  it("does not treat the generic Failed to load resource phrase alone as network-only", () => {
    expect(isNetworkOnlyConsoleError("Failed to load resource")).toBe(false)
    expect(isAppOriginConsoleError("Failed to load resource")).toBe(true)
  })

  it("keeps explicit aborted-route transport failures network-only and non-app", () => {
    const blockedByClient =
      "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT"
    const nsError = "NS_ERROR_FAILURE: Component not available"
    const cors =
      "Access to fetch at 'https://server-side-tagging.example/g/collect' from origin 'http://localhost:3100' has been blocked by CORS policy"

    expect(isNetworkOnlyConsoleError(blockedByClient)).toBe(true)
    expect(isAppOriginConsoleError(blockedByClient)).toBe(false)
    expect(isNetworkOnlyConsoleError(nsError)).toBe(true)
    expect(isAppOriginConsoleError(nsError)).toBe(false)
    expect(isNetworkOnlyConsoleError(cors)).toBe(true)
    expect(isAppOriginConsoleError(cors)).toBe(false)
  })

  it("denies unknown external image, font, and video URLs while allowing loopback assets", () => {
    expect(classifyBrowserRequest("https://example.com/pixel.png")).toBe("deny")
    expect(
      classifyBrowserRequest("https://assets.example.net/font.woff2")
    ).toBe("deny")
    expect(classifyBrowserRequest("https://unknown.example/movie.mp4")).toBe(
      "deny"
    )
    expect(
      classifyBrowserRequest("http://localhost:3100/favicon-32x32.png")
    ).toBe("allow")
    expect(classifyBrowserRequest("http://127.0.0.1:3100/brand/hero.webm")).toBe(
      "allow"
    )
  })

  it("denies unknown hosts even when the path resembles a known asset", () => {
    expect(
      classifyBrowserRequest(
        "https://unknown.example/gh/paulirish/lite-youtube-embed@master/src/lite-yt-embed.js"
      )
    ).toBe("deny")
    expect(
      classifyBrowserRequest(
        "https://assets.example.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js"
      )
    ).toBe("deny")
    expect(
      classifyBrowserRequest(
        "https://cdn.unknown.example/content/dam/fom-website/Bahrain_Circuit.png"
      )
    ).toBe("deny")
  })

  it("installs isolation in the Playwright fixture before navigation and does not weaken production", () => {
    const fixtures = readFileSync(
      path.join(root, "tests/e2e/fixtures.ts"),
      "utf8"
    )
    const layout = readFileSync(path.join(root, "app/layout.tsx"), "utf8")
    const controller = readFileSync(
      path.join(root, "components/privacy/analytics-controller.tsx"),
      "utf8"
    )
    const middleware = readFileSync(path.join(root, "middleware.ts"), "utf8")

    expect(fixtures).toMatch(/classifyBrowserRequest/)
    expect(fixtures).toMatch(/page\.route\(/)
    expect(fixtures).toMatch(/route\.(fulfill|abort)/)
    expect(fixtures).toMatch(/deniedExternalRequests\.push/)
    expect(fixtures).toMatch(/expect\([\s\S]*deniedExternalRequests[\s\S]*toEqual\(\[\]\)/)
    expect(fixtures).not.toMatch(/test\.skip|test\.fixme|test\.only/)
    expect(layout).not.toMatch(/SpeedInsights/)
    expect(layout).not.toMatch(/GoogleTagManager/)
    expect(controller).toMatch(/GoogleTagManager/)
    expect(controller).toMatch(/SpeedInsights/)
    expect(layout).toMatch(/progressier\.app/)
    expect(middleware).not.toMatch(/process\.env\.(NODE_ENV|CI|PLAYWRIGHT)/)
  })
})
