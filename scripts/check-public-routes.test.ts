import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  MAX_ROUTES,
  PROBE_CONCURRENCY,
  PROBE_TIMEOUT_MS,
  PublicRouteCheckError,
  SITEMAP_MAX_BYTES,
  assertSitemapRoutes,
  collectPublicRouteBaseline,
  isDirectCliExecution,
  normalizeBaseUrl,
  normalizeContentType,
  parseCliArgs,
  parseSitemapLocs,
  probeRoutes,
  runCli,
  sanitizeRedirect
} from "./check-public-routes"

const ORIGIN = "https://www.pitlanetravel.com"

function urlset(locs: string[]): string {
  const urls = locs
    .map((loc) => `  <url><loc>${loc}</loc></url>`)
    .join("\n")
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function sitemapResponse(
  body: string,
  init?: { status?: number; contentType?: string }
): Response {
  return new Response(body, {
    status: init?.status ?? 200,
    headers: { "content-type": init?.contentType ?? "application/xml" }
  })
}

function probeResponse(
  status: number,
  headers: Record<string, string> = {}
): Response {
  return new Response("response-body-must-not-leak", {
    status,
    headers
  })
}

function urlOf(input: RequestInfo | URL): string {
  if (typeof input === "string") return input
  if (input instanceof URL) return input.href
  return input.url
}

function headersOf(init?: RequestInit): Headers {
  return new Headers(init?.headers)
}

function expectRejected(
  fn: () => unknown,
  code: string
): PublicRouteCheckError {
  try {
    const result = fn()
    if (result && typeof result === "object" && "then" in result) {
      throw new Error("use expectRejectedAsync for promises")
    }
    throw new Error("expected PublicRouteCheckError")
  } catch (err) {
    expect(err).toBeInstanceOf(PublicRouteCheckError)
    expect((err as PublicRouteCheckError).code).toBe(code)
    return err as PublicRouteCheckError
  }
}

async function expectRejectedAsync(
  promise: Promise<unknown>,
  code: string
): Promise<PublicRouteCheckError> {
  let err: unknown
  try {
    await promise
  } catch (caught) {
    err = caught
  }
  expect(err).toBeInstanceOf(PublicRouteCheckError)
  expect((err as PublicRouteCheckError).code).toBe(code)
  return err as PublicRouteCheckError
}

describe("isDirectCliExecution", () => {
  it("is false for the vitest entrypoint so imports have no CLI side effects", () => {
    expect(
      isDirectCliExecution(
        "file:///home/hermes/work/pitlane-travel/wt-plt-010/scripts/check-public-routes.ts",
        process.argv[1]
      )
    ).toBe(false)
  })

  it("is true only when argv points at this module", () => {
    expect(
      isDirectCliExecution(
        "file:///tmp/check-public-routes.ts",
        "/tmp/check-public-routes.ts"
      )
    ).toBe(true)
  })
})

describe("parseCliArgs / normalizeBaseUrl", () => {
  it("accepts --base-url=<https URL> and normalizes to origin", () => {
    expect(
      parseCliArgs(["--base-url=https://www.pitlanetravel.com/"])
    ).toEqual({ baseUrl: ORIGIN })
  })

  it("accepts separated --base-url VALUE", () => {
    expect(
      parseCliArgs(["--base-url", "https://WWW.PitLaneTravel.com"])
    ).toEqual({ baseUrl: ORIGIN })
  })

  it("rejects missing, empty, unknown, and duplicate args", () => {
    expectRejected(() => parseCliArgs([]), "cli_args")
    expectRejected(() => parseCliArgs(["--base-url"]), "cli_args")
    expectRejected(() => parseCliArgs(["--base-url="]), "cli_args")
    expectRejected(() => parseCliArgs(["--help"]), "cli_args")
    expectRejected(
      () => parseCliArgs(["--base-url", ORIGIN, "--strict-status"]),
      "cli_args"
    )
    expectRejected(
      () => parseCliArgs(["--base-url", ORIGIN, ORIGIN]),
      "cli_args"
    )
    expectRejected(
      () =>
        parseCliArgs([
          "--base-url=https://www.pitlanetravel.com",
          "--base-url=https://www.pitlanetravel.com"
        ]),
      "cli_args"
    )
  })

  it("rejects non-https, credentials, query, fragment, and non-root pathname", () => {
    expectRejected(() => normalizeBaseUrl("http://www.pitlanetravel.com"), "invalid_base_url")
    expectRejected(
      () => normalizeBaseUrl("https://user:pass@www.pitlanetravel.com/"),
      "invalid_base_url"
    )
    expectRejected(
      () => normalizeBaseUrl("https://www.pitlanetravel.com/?utm=1"),
      "invalid_base_url"
    )
    expectRejected(
      () => normalizeBaseUrl("https://www.pitlanetravel.com/#top"),
      "invalid_base_url"
    )
    expectRejected(
      () => normalizeBaseUrl("https://www.pitlanetravel.com/races"),
      "invalid_base_url"
    )
  })

  it("does not leak credentials or query in CLI errors", () => {
    const err = expectRejected(
      () => parseCliArgs(["--base-url=https://user:s3cret@www.pitlanetravel.com/?token=abc"]),
      "invalid_base_url"
    )
    expect(err.message).not.toContain("s3cret")
    expect(err.message).not.toContain("user:")
    expect(err.message).not.toContain("token=abc")
  })
})

describe("parseSitemapLocs", () => {
  it("parses urlset/url/loc and decodes XML entities", () => {
    const xml = urlset([
      "https://www.pitlanetravel.com/",
      "https://www.pitlanetravel.com/a&amp;b",
      "https://www.pitlanetravel.com/x&#47;y"
    ])
    expect(parseSitemapLocs(xml)).toEqual([
      "https://www.pitlanetravel.com/",
      "https://www.pitlanetravel.com/a&b",
      "https://www.pitlanetravel.com/x/y"
    ])
  })

  it("reads loc values from CDATA", () => {
    const xml = `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc><![CDATA[https://www.pitlanetravel.com/races]]></loc></url></urlset>`
    expect(parseSitemapLocs(xml)).toEqual([`${ORIGIN}/races`])
  })

  it("rejects a valid loc mixed with a url that has no loc", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${ORIGIN}/</loc></url>
  <url><lastmod>2026-08-25</lastmod></url>
</urlset>`
    expectRejected(() => parseSitemapLocs(xml), "sitemap_malformed")
  })

  it("rejects a url entry with multiple loc children", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${ORIGIN}/</loc>
    <loc>${ORIGIN}/races</loc>
  </url>
</urlset>`
    expectRejected(() => parseSitemapLocs(xml), "sitemap_malformed")
  })

  it("rejects a urlset with no Sitemap protocol namespace", () => {
    expectRejected(
      () =>
        parseSitemapLocs(
          `<?xml version="1.0"?><urlset><url><loc>${ORIGIN}/races</loc></url></urlset>`
        ),
      "sitemap_malformed"
    )
  })

  it("rejects a urlset with a lookalike Sitemap namespace", () => {
    expectRejected(
      () =>
        parseSitemapLocs(
          `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9/"><url><loc>${ORIGIN}/races</loc></url></urlset>`
        ),
      "sitemap_malformed"
    )
  })

  it("rejects sitemap indexes, missing urlset, malformed XML, and DTD entities", () => {
    expectRejected(
      () =>
        parseSitemapLocs(
          `<?xml version="1.0"?><sitemapindex><sitemap><loc>${ORIGIN}/sitemap-0.xml</loc></sitemap></sitemapindex>`
        ),
      "sitemap_index"
    )
    expectRejected(() => parseSitemapLocs("<html><loc>nope</loc></html>"), "sitemap_malformed")
    expectRejected(
      () => parseSitemapLocs(`<urlset><url><loc>${ORIGIN}/</loc></url>`),
      "sitemap_malformed"
    )
    expectRejected(
      () =>
        parseSitemapLocs(
          `<!DOCTYPE urlset [<!ENTITY xxe "https://evil.example/">]><urlset><url><loc>&xxe;</loc></url></urlset>`
        ),
      "sitemap_malformed"
    )
    expectRejected(
      () =>
        parseSitemapLocs(
          `<!DOCTYPE urlset [<!ENTITY a "aaaaaaaaaa"><!ENTITY b "&a;&a;&a;&a;"><!ENTITY c "&b;&b;&b;&b;">]><urlset><url><loc>&c;</loc></url></urlset>`
        ),
      "sitemap_malformed"
    )
  })
})

describe("assertSitemapRoutes", () => {
  it("accepts 1..250 unique same-origin https routes", () => {
    expect(assertSitemapRoutes([`${ORIGIN}/`], ORIGIN)).toEqual([`${ORIGIN}/`])
    const many = Array.from({ length: 3 }, (_, i) => `${ORIGIN}/r${i}`)
    expect(assertSitemapRoutes(many, ORIGIN)).toEqual(many)
  })

  it("fails closed on empty, too many, duplicates, off-origin, and unsafe locs", () => {
    expectRejected(() => assertSitemapRoutes([], ORIGIN), "sitemap_empty")
    const tooMany = Array.from({ length: MAX_ROUTES + 1 }, (_, i) => `${ORIGIN}/r${i}`)
    expectRejected(() => assertSitemapRoutes(tooMany, ORIGIN), "too_many_routes")
    expectRejected(
      () => assertSitemapRoutes([`${ORIGIN}/`, `${ORIGIN}/`], ORIGIN),
      "duplicate_loc"
    )
    expectRejected(
      () =>
        assertSitemapRoutes(
          ["https://www.pitlanetravel.com/foo", "https://www.pitlanetravel.com/foo"],
          ORIGIN
        ),
      "duplicate_loc"
    )
    expectRejected(
      () => assertSitemapRoutes(["https://evil.example/"], ORIGIN),
      "off_origin"
    )
    expectRejected(
      () => assertSitemapRoutes(["http://www.pitlanetravel.com/"], ORIGIN),
      "invalid_route_url"
    )
    expectRejected(
      () => assertSitemapRoutes(["https://user:pass@www.pitlanetravel.com/"], ORIGIN),
      "invalid_route_url"
    )
    expectRejected(
      () => assertSitemapRoutes([`${ORIGIN}/races?ref=1`], ORIGIN),
      "invalid_route_url"
    )
    expectRejected(
      () => assertSitemapRoutes([`${ORIGIN}/races#grid`], ORIGIN),
      "invalid_route_url"
    )
  })

  it("does not leak credentials or query from a bad loc", () => {
    const err = expectRejected(
      () =>
        assertSitemapRoutes(
          ["https://user:s3cret@www.pitlanetravel.com/hidden?token=abc"],
          ORIGIN
        ),
      "invalid_route_url"
    )
    expect(err.message).not.toContain("s3cret")
    expect(err.message).not.toContain("token=abc")
    expect(err.message).not.toContain("user:")
  })
})

describe("sanitizeRedirect", () => {
  it("keeps origin+pathname and strips query, fragment, and credentials", () => {
    expect(
      sanitizeRedirect(
        "https://clerk.accounts.dev/v1/client/handshake?__clerk_handshake=SECRET#x",
        `${ORIGIN}/`
      )
    ).toBe("https://clerk.accounts.dev/v1/client/handshake")
    expect(
      sanitizeRedirect("https://user:s3cret@clerk.example/path?q=1", `${ORIGIN}/`)
    ).toBe("https://clerk.example/path")
    expect(sanitizeRedirect("/login?next=/secret", `${ORIGIN}/races`)).toBe(
      `${ORIGIN}/login`
    )
    expect(sanitizeRedirect(null)).toBeNull()
    expect(sanitizeRedirect("")).toBeNull()
    expect(sanitizeRedirect("not a url", `${ORIGIN}/`)).toBeNull()
  })
})

describe("normalizeContentType", () => {
  it("returns the media type only", () => {
    expect(normalizeContentType("application/xml; charset=utf-8")).toBe(
      "application/xml"
    )
    expect(normalizeContentType("text/html; charset=UTF-8")).toBe("text/html")
    expect(normalizeContentType(" text/xml ")).toBe("text/xml")
    expect(normalizeContentType(null)).toBeNull()
    expect(normalizeContentType("")).toBeNull()
  })
})

describe("probeRoutes", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("never exceeds concurrency 4", async () => {
    const urls = Array.from({ length: 8 }, (_, i) => `${ORIGIN}/r${i}`)
    let inflight = 0
    let maxInflight = 0
    const fetchImpl: typeof fetch = async () => {
      inflight += 1
      maxInflight = Math.max(maxInflight, inflight)
      await Promise.resolve()
      inflight -= 1
      return probeResponse(200, { "content-type": "text/html" })
    }

    const records = await probeRoutes(urls, { fetch: fetchImpl })
    expect(PROBE_CONCURRENCY).toBe(4)
    expect(maxInflight).toBeGreaterThan(0)
    expect(maxInflight).toBeLessThanOrEqual(4)
    expect(records).toHaveLength(8)
  })

  it("probes with GET, manual redirects, browser-shaped headers, and a 10s timeout", async () => {
    let init: RequestInit | undefined
    const fetchImpl: typeof fetch = async (_input, requestInit) => {
      init = requestInit
      return probeResponse(307, {
        location: "https://clerk.accounts.dev/v1/client/handshake?__clerk_handshake=SECRET",
        "content-type": "text/html; charset=utf-8"
      })
    }

    const [record] = await probeRoutes([`${ORIGIN}/`], { fetch: fetchImpl })
    expect(init?.redirect).toBe("manual")
    expect((init?.method ?? "GET").toUpperCase()).toBe("GET")
    expect(init?.signal).toBeInstanceOf(AbortSignal)
    expect(PROBE_TIMEOUT_MS).toBe(10_000)
    const headers = headersOf(init)
    expect(headers.get("accept")).toMatch(/text\/html/)
    expect(headers.get("user-agent")).toMatch(/Mozilla\/5\.0/)
    expect(headers.has("cookie")).toBe(false)
    expect(headers.has("authorization")).toBe(false)
    expect(record.status).toBe(307)
    expect(record.pathname).toBe("/")
    expect(record.content_type).toBe("text/html")
    expect(record.redirect).toBe("https://clerk.accounts.dev/v1/client/handshake")
    expect(Number.isInteger(record.duration_ms)).toBe(true)
    expect(record.duration_ms).toBeGreaterThanOrEqual(0)
  })

  it("rejects probe timeouts and network failures without leaking unsafe URLs", async () => {
    const timeoutErr = await expectRejectedAsync(
      probeRoutes([`${ORIGIN}/`], {
        fetch: async () => {
          throw new DOMException(
            "The operation was aborted due to timeout",
            "TimeoutError"
          )
        }
      }),
      "probe_timeout"
    )
    expect(timeoutErr.message).not.toMatch(/https?:\/\//)

    const networkErr = await expectRejectedAsync(
      probeRoutes([`${ORIGIN}/`], {
        fetch: async () => {
          throw new TypeError("fetch failed for https://user:s3cret@example/?token=abc")
        }
      }),
      "probe_network"
    )
    expect(networkErr.message).not.toContain("s3cret")
    expect(networkErr.message).not.toContain("token=abc")
  })
})

describe("runCli", () => {
  it("prints deterministic JSON and exits 1 when every route is HTTP 307", async () => {
    const scenariosDir = mkdtempSync(join(tmpdir(), "plt-307-"))
    const scenariosPath = join(scenariosDir, "public-route-scenarios.json")
    writeFileSync(
      scenariosPath,
      JSON.stringify({
        schema_version: 1,
        error_shell_markers: [
          "Application error: a server-side exception has occurred"
        ],
        intended_active_series: [
          { slug: "f1", name: "Formula 1" },
          { slug: "formula-e", name: "Formula E" },
          { slug: "motogp", name: "MotoGP" },
          { slug: "indycar", name: "IndyCar" },
          { slug: "wec", name: "WEC" }
        ],
        routes: [
          { id: "home", class: "core", pathname: "/" },
          { id: "alpha", class: "core", pathname: "/alpha" },
          { id: "zeta", class: "core", pathname: "/zeta" }
        ],
        coverage: [
          {
            id: "guided-circuit-pages",
            class: "guided_circuit",
            path_pattern: "^/circuits/[^/]+/grandstands$",
            min_count: 0,
            max_count: 64
          }
        ]
      })
    )
    const xml = urlset([
      `${ORIGIN}/zeta`,
      `${ORIGIN}/`,
      `${ORIGIN}/alpha`,
      `${ORIGIN}/series/f1`,
      `${ORIGIN}/series/formula-e`,
      `${ORIGIN}/series/motogp`,
      `${ORIGIN}/series/indycar`,
      `${ORIGIN}/series/wec`
    ])
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = urlOf(input)
      if (url === `${ORIGIN}/sitemap.xml`) {
        expect(init?.redirect).toBe("manual")
        return sitemapResponse(xml, { contentType: "application/xml; charset=utf-8" })
      }
      return probeResponse(307, {
        "content-type": "text/html; charset=utf-8",
        location: "https://clerk.accounts.dev/v1/client/handshake?__clerk_handshake=SECRET#frag",
        "set-cookie": "session=SECRETCOOKIE"
      })
    }

    const stdout: string[] = []
    const stderr: string[] = []
    const code = await runCli(["--base-url", ORIGIN, "--scenarios", scenariosPath], {
      fetch: fetchImpl,
      stdout: { write: (chunk: string) => stdout.push(String(chunk)) },
      stderr: { write: (chunk: string) => stderr.push(String(chunk)) },
      now: () => new Date("2026-08-25T12:00:00.000Z")
    })
    rmSync(scenariosDir, { recursive: true, force: true })

    expect(code).toBe(1)
    const printed = `${stdout.join("")}${stderr.join("")}`
    expect(printed).not.toContain("SECRET")
    expect(printed).not.toContain("__clerk_handshake")
    expect(printed).not.toContain("SECRETCOOKIE")
    expect(printed).not.toContain("response-body-must-not-leak")
    expect(printed).not.toContain("set-cookie")
    expect(printed).not.toContain("?__clerk_handshake=")
    expect(printed).not.toContain("#frag")
    const doc = JSON.parse(stdout.join("")) as {
      schema_version: number
      checked_at: string
      base_url: string
      sitemap_route_count: number
      bounds: Record<string, number>
      status_counts: Record<string, number>
      external_redirect_count: number
      external_redirect_origins: string[]
      failures: Array<{ code: string; pathname?: string }>
      routes: Array<{
        pathname: string
        status: number
        content_type: string | null
        redirect: string | null
        duration_ms: number
      }>
    }

    expect(doc.schema_version).toBe(1)
    expect(doc.checked_at).toBe("2026-08-25T12:00:00.000Z")
    expect(doc.base_url).toBe(ORIGIN)
    expect(doc.sitemap_route_count).toBe(8)
    expect(doc.failures).toEqual(
      [
        "/",
        "/alpha",
        "/series/f1",
        "/series/formula-e",
        "/series/indycar",
        "/series/motogp",
        "/series/wec",
        "/zeta"
      ].map(pathname => ({ code: "unexpected_status", pathname }))
    )
    expect(doc.bounds).toMatchObject({
      min_routes: 1,
      max_routes: 250,
      concurrency: 4,
      request_timeout_ms: 10_000,
      sitemap_max_bytes: SITEMAP_MAX_BYTES
    })
    expect(Object.keys(doc.status_counts)).toEqual(["307"])
    expect(doc.status_counts["307"]).toBe(8)
    expect(doc.external_redirect_count).toBe(8)
    expect(doc.external_redirect_origins).toEqual(["https://clerk.accounts.dev"])
    expect(doc.routes.map((route) => route.pathname)).toEqual([
      "/",
      "/alpha",
      "/series/f1",
      "/series/formula-e",
      "/series/indycar",
      "/series/motogp",
      "/series/wec",
      "/zeta"
    ])
    expect(doc.routes.every((route) => route.status === 307)).toBe(true)
    expect(doc.routes.every((route) => route.content_type === "text/html")).toBe(
      true
    )
    expect(
      doc.routes.every(
        (route) =>
          route.redirect === "https://clerk.accounts.dev/v1/client/handshake"
      )
    ).toBe(true)
  })

  it("exits nonzero for sitemap/invariant/network failures and keeps stderr free of secrets", async () => {
    const stdout: string[] = []
    const stderr: string[] = []
    const io = {
      fetch: (async () => {
        throw new TypeError("fetch failed https://user:s3cret@example/?token=abc")
      }) as typeof fetch,
      stdout: { write: (chunk: string) => stdout.push(String(chunk)) },
      stderr: { write: (chunk: string) => stderr.push(String(chunk)) }
    }

    const missing = await runCli([], io)
    expect(missing).toBe(1)
    expect(stdout.join("")).toBe("")
    expect(stderr.join("")).toMatch(/base-url/i)

    const network = await runCli(["--base-url", ORIGIN], io)
    expect(network).toBe(1)
    expect(stderr.join("")).not.toContain("s3cret")
    expect(stderr.join("")).not.toContain("token=abc")

    const badSitemap = await runCli(["--base-url", ORIGIN], {
      ...io,
      fetch: async () => sitemapResponse("<html>nope</html>", { contentType: "text/html" })
    })
    expect(badSitemap).toBe(1)

    const offOrigin = await runCli(["--base-url", ORIGIN], {
      ...io,
      fetch: async () => sitemapResponse(urlset(["https://evil.example/"]))
    })
    expect(offOrigin).toBe(1)

    const tooLarge = await runCli(["--base-url", ORIGIN], {
      ...io,
      fetch: async () =>
        sitemapResponse(`<urlset>${"x".repeat(SITEMAP_MAX_BYTES + 1)}</urlset>`)
    })
    expect(tooLarge).toBe(1)
  })

  it("rejects invalid UTF-8 sitemap bodies as sitemap_malformed without leaking bytes or URLs", async () => {
    const prefix = new TextEncoder().encode(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${ORIGIN}/secret-path</loc></url></urlset>`
    )
    const body = new Uint8Array(prefix.length + 2)
    body.set(prefix)
    body[prefix.length] = 0xff
    body[prefix.length + 1] = 0xfe
    const fetchImpl: typeof fetch = async () =>
      new Response(body, {
        status: 200,
        headers: { "content-type": "application/xml" }
      })

    const collected = await expectRejectedAsync(
      collectPublicRouteBaseline({ baseUrl: ORIGIN }, { fetch: fetchImpl }),
      "sitemap_malformed"
    )
    expect(collected.message).not.toMatch(/https?:\/\//)
    expect(collected.message).not.toContain("secret-path")
    expect(collected.message).not.toContain("\uFFFD")

    const stdout: string[] = []
    const stderr: string[] = []
    const code = await runCli(["--base-url", ORIGIN], {
      fetch: fetchImpl,
      stdout: { write: (chunk: string) => stdout.push(String(chunk)) },
      stderr: { write: (chunk: string) => stderr.push(String(chunk)) }
    })
    expect(code).toBe(1)
    expect(stdout.join("")).toBe("")
    expect(stderr.join("")).not.toContain("secret-path")
    expect(stderr.join("")).not.toMatch(/https?:\/\//)
    expect(stderr.join("")).not.toContain("\uFFFD")
  })
})

const DEFAULT_REGISTRY_PATH = resolve(
  import.meta.dirname ?? __dirname,
  "../data/qa/public-route-scenarios.json"
)
const REQUIRED_SERIES = ["f1", "formula-e", "indycar", "motogp", "wec"] as const
const CORE_PATHS = [
  "/",
  "/races",
  "/races/map",
  "/races/compare",
  "/circuits/grandstands",
  "/flights",
  "/hotels",
  "/transport",
  "/packages",
  "/about",
  "/faq",
  "/contact",
  "/help",
  "/privacy",
  "/terms"
] as const

type ScenarioDoc = {
  schema_version: number
  error_shell_markers: string[]
  intended_active_series: Array<{ slug: string; name: string }>
  routes: Array<{
    id: string
    class: string
    pathname: string
    required_markers?: string[]
    forbidden_markers?: string[]
  }>
  coverage: Array<{
    id: string
    class: string
    path_pattern: string
    min_count: number
    max_count: number
    required_markers?: string[]
    forbidden_markers?: string[]
  }>
}

const tempDirs: string[] = []

function writeScenarios(doc: unknown, name = "public-route-scenarios.json"): string {
  const dir = mkdtempSync(join(tmpdir(), "plt-scenarios-"))
  tempDirs.push(dir)
  const path = join(dir, name)
  writeFileSync(path, typeof doc === "string" ? doc : `${JSON.stringify(doc)}\n`)
  return path
}

function validScenarios(overrides: Partial<ScenarioDoc> = {}): ScenarioDoc {
  return {
    schema_version: 1,
    error_shell_markers: [
      "Application error: a server-side exception has occurred",
      "An unexpected error occurred",
      "This page could not be found"
    ],
    intended_active_series: [
      { slug: "f1", name: "Formula 1" },
      { slug: "formula-e", name: "Formula E" },
      { slug: "motogp", name: "MotoGP" },
      { slug: "indycar", name: "IndyCar" },
      { slug: "wec", name: "WEC" }
    ],
    routes: [
      { id: "home", class: "core", pathname: "/" },
      {
        id: "series-f1",
        class: "series",
        pathname: "/series/f1",
        required_markers: ["Formula 1"]
      }
    ],
    coverage: [
      {
        id: "guided-circuit-pages",
        class: "guided_circuit",
        path_pattern: "^/circuits/[^/]+/grandstands$",
        min_count: 1,
        max_count: 64,
        required_markers: ["Best grandstands at"]
      }
    ],
    ...overrides
  }
}

function locFor(pathname: string): string {
  return pathname === "/" ? `${ORIGIN}/` : `${ORIGIN}${pathname}`
}

function healthyHtml(
  pathname: string,
  extra = "",
  canonical = locFor(pathname)
): string {
  return `<!doctype html><html><head><link rel="canonical" href="${canonical}"></head><body><main>PitLane Travel ${extra}</main></body></html>`
}

function htmlResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" }
  })
}

function pagesFetch(spec: {
  sitemap: string[]
  html?: Record<string, string>
  status?: Record<string, number>
}): typeof fetch {
  return async input => {
    const url = urlOf(input)
    if (url === `${ORIGIN}/sitemap.xml`) {
      return sitemapResponse(urlset(spec.sitemap.map(locFor)))
    }
    const pathname = new URL(url).pathname
    const status = spec.status?.[pathname] ?? 200
    if (status >= 300 && status < 400) {
      return probeResponse(status, {
        location: `${ORIGIN}/login`,
        "content-type": "text/html"
      })
    }
    return htmlResponse(spec.html?.[pathname] ?? healthyHtml(pathname), status)
  }
}

function failuresOf(doc: unknown): Array<{ code: string; pathname?: string }> {
  const failures = (doc as { failures?: Array<{ code: string; pathname?: string }> })
    .failures
  expect(Array.isArray(failures)).toBe(true)
  return failures ?? []
}

async function loadChecker(): Promise<Record<string, unknown>> {
  return (await import("./check-public-routes")) as Record<string, unknown>
}

describe("parseCliArgs scenarios override", () => {
  it("accepts --scenarios and rejects duplicate or empty values", () => {
    const path = "/tmp/public-route-scenarios.json"
    expect(parseCliArgs(["--base-url", ORIGIN, "--scenarios", path])).toEqual({
      baseUrl: ORIGIN,
      scenariosPath: path
    })
    expect(
      parseCliArgs([`--base-url=${ORIGIN}`, `--scenarios=${path}`])
    ).toEqual({
      baseUrl: ORIGIN,
      scenariosPath: path
    })
    expectRejected(
      () => parseCliArgs(["--base-url", ORIGIN, "--scenarios"]),
      "cli_args"
    )
    expectRejected(
      () => parseCliArgs(["--base-url", ORIGIN, "--scenarios="]),
      "cli_args"
    )
    expectRejected(
      () =>
        parseCliArgs([
          "--base-url",
          ORIGIN,
          "--scenarios",
          path,
          "--scenarios",
          path
        ]),
      "cli_args"
    )
  })
})

describe("public route scenario registry", () => {
  afterEach(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop()
      if (dir) rmSync(dir, { recursive: true, force: true })
    }
  })

  it("validateRouteScenarios accepts the versioned registry and rejects invalid documents", async () => {
    const { validateRouteScenarios, PublicRouteCheckError: Err } =
      (await loadChecker()) as {
        validateRouteScenarios?: (raw: unknown) => ScenarioDoc
        PublicRouteCheckError: typeof PublicRouteCheckError
      }
    expect(validateRouteScenarios).toEqual(expect.any(Function))
    const valid = validScenarios()
    expect(validateRouteScenarios!(valid)).toMatchObject({
      schema_version: 1,
      intended_active_series: expect.arrayContaining([
        expect.objectContaining({ slug: "f1" }),
        expect.objectContaining({ slug: "formula-e" }),
        expect.objectContaining({ slug: "motogp" }),
        expect.objectContaining({ slug: "indycar" }),
        expect.objectContaining({ slug: "wec" })
      ])
    })

    const rejected = (raw: unknown, code: string) => {
      try {
        validateRouteScenarios!(raw)
        throw new Error("expected PublicRouteCheckError")
      } catch (err) {
        expect(err).toBeInstanceOf(Err)
        expect((err as PublicRouteCheckError).code).toBe(code)
        expect((err as Error).message).not.toContain("postgresql://")
        expect((err as Error).message).not.toContain("s3cret")
      }
    }

    rejected({ ...valid, schema_version: 2 }, "invalid_scenarios")
    rejected({ ...valid, intended_active_series: valid.intended_active_series.slice(0, 4) }, "invalid_scenarios")
    rejected(
      {
        ...valid,
        intended_active_series: [
          ...valid.intended_active_series,
          { slug: "nascar", name: "NASCAR" }
        ]
      },
      "invalid_scenarios"
    )
    rejected({ ...valid, routes: [{ id: "bad", class: "core", pathname: "/races?x=1" }] }, "invalid_scenarios")
    rejected(
      {
        ...valid,
        coverage: [
          {
            id: "unsafe",
            class: "guided_circuit",
            path_pattern: "(.*)+",
            min_count: 1,
            max_count: 64
          }
        ]
      },
      "invalid_scenarios"
    )
    rejected(
      { ...valid, database_url: "postgresql://user:s3cret@db/prod" },
      "invalid_scenarios"
    )
    rejected(
      {
        ...valid,
        coverage: [
          {
            id: "guided-circuit-pages",
            class: "guided_circuit",
            path_pattern: "^/circuits/[^/]+/grandstands$",
            min_count: 1
          }
        ]
      },
      "invalid_scenarios"
    )
    rejected(
      {
        ...valid,
        coverage: [
          {
            id: "guided-circuit-pages",
            class: "guided_circuit",
            path_pattern: "^/circuits/[^/]+/grandstands$",
            min_count: 2,
            max_count: 1
          }
        ]
      },
      "invalid_scenarios"
    )
    rejected(
      {
        ...valid,
        coverage: [
          {
            id: "guided-circuit-pages",
            class: "guided_circuit",
            path_pattern: "^/circuits/[^/]+/grandstands$",
            min_count: 0,
            max_count: MAX_ROUTES + 1
          }
        ]
      },
      "invalid_scenarios"
    )
  })

  it("default committed registry lists every intended active series and core/guided coverage", () => {
    const raw = JSON.parse(readFileSync(DEFAULT_REGISTRY_PATH, "utf8")) as ScenarioDoc
    expect(raw.schema_version).toBe(1)
    expect(
      raw.intended_active_series.map(series => series.slug).sort()
    ).toEqual([...REQUIRED_SERIES])
    const pathnames = new Set(raw.routes.map(route => route.pathname))
    for (const pathname of CORE_PATHS) {
      expect(pathnames.has(pathname)).toBe(true)
    }
    for (const slug of REQUIRED_SERIES) {
      expect(pathnames.has(`/series/${slug}`)).toBe(true)
    }
    expect(
      raw.coverage.some(
        item =>
          item.class === "guided_circuit" &&
          item.min_count >= 1 &&
          item.max_count === 64 &&
          item.min_count <= item.max_count &&
          item.max_count <= MAX_ROUTES &&
          item.path_pattern.includes("/circuits/")
      )
    ).toBe(true)
    const serialized = JSON.stringify(raw)
    expect(serialized).not.toMatch(/20\d{2}-\d{2}-\d{2}/)
    expect(serialized).not.toMatch(/postgres(ql)?:\/\//i)
    expect(serialized).not.toMatch(/api[_-]?key/i)
  })
})

describe("HTML inspection helpers", () => {
  it("fails a 200 application error shell and ignores ordinary error prose", async () => {
    const { inspectHtmlDocument } = (await loadChecker()) as {
      inspectHtmlDocument?: (
        html: string,
        input: {
          pathname: string
          origin: string
          errorShellMarkers: string[]
        }
      ) => { failures: Array<{ code: string; pathname?: string }> }
    }
    expect(inspectHtmlDocument).toEqual(expect.any(Function))
    const markers = [
      "Application error: a server-side exception has occurred",
      "An unexpected error occurred",
      "This page could not be found"
    ]
    const shell = inspectHtmlDocument!(
      `<!doctype html><html><head><link rel="canonical" href="${ORIGIN}/races"></head><body><h2>Application error: a server-side exception has occurred</h2></body></html>`,
      { pathname: "/races", origin: ORIGIN, errorShellMarkers: markers }
    )
    expect(shell.failures).toEqual([
      expect.objectContaining({ code: "error_shell", pathname: "/races" })
    ])

    const prose = inspectHtmlDocument!(
      `<!doctype html><html><head><link rel="canonical" href="${ORIGIN}/faq"></head><body><p>If something went wrong with planning, or you see an error in a supplier email, contact us.</p></body></html>`,
      { pathname: "/faq", origin: ORIGIN, errorShellMarkers: markers }
    )
    expect(prose.failures.filter(item => item.code === "error_shell")).toEqual([])
  })

  it("extracts canonical hrefs and fails missing, duplicate, or off-origin declarations", async () => {
    const { extractCanonicalHrefs, inspectHtmlDocument } = (await loadChecker()) as {
      extractCanonicalHrefs?: (html: string) => string[]
      inspectHtmlDocument?: (
        html: string,
        input: { pathname: string; origin: string; errorShellMarkers: string[] }
      ) => { failures: Array<{ code: string; pathname?: string }>; canonicals: string[] }
    }
    expect(extractCanonicalHrefs).toEqual(expect.any(Function))
    expect(inspectHtmlDocument).toEqual(expect.any(Function))
    expect(
      extractCanonicalHrefs!(
        `<link href="${ORIGIN}/races" rel="canonical"><LINK REL='CANONICAL' HREF='${ORIGIN}/races/compare'>`
      )
    ).toEqual([`${ORIGIN}/races`, `${ORIGIN}/races/compare`])

    const missing = inspectHtmlDocument!(
      `<html><head></head><body>PitLane Travel</body></html>`,
      { pathname: "/races", origin: ORIGIN, errorShellMarkers: [] }
    )
    expect(missing.failures).toEqual([
      expect.objectContaining({ code: "missing_canonical", pathname: "/races" })
    ])

    const duplicate = inspectHtmlDocument!(
      `<link rel="canonical" href="${ORIGIN}/races"><link rel="canonical" href="${ORIGIN}/races">`,
      { pathname: "/races", origin: ORIGIN, errorShellMarkers: [] }
    )
    expect(duplicate.failures).toEqual([
      expect.objectContaining({ code: "duplicate_canonical", pathname: "/races" })
    ])

    const offOrigin = inspectHtmlDocument!(
      `<link rel="canonical" href="https://evil.example/races">`,
      { pathname: "/races", origin: ORIGIN, errorShellMarkers: [] }
    )
    expect(offOrigin.failures).toEqual([
      expect.objectContaining({ code: "canonical_off_origin", pathname: "/races" })
    ])

    const query = inspectHtmlDocument!(
      `<link rel="canonical" href="${ORIGIN}/races?variant=secret-variant">`,
      { pathname: "/races", origin: ORIGIN, errorShellMarkers: [] }
    )
    expect(query.failures).toEqual([
      expect.objectContaining({ code: "canonical_mismatch", pathname: "/races" })
    ])
    expect(JSON.stringify(query)).not.toContain("variant=")
    expect(JSON.stringify(query)).not.toContain("secret-variant")

    const fragment = inspectHtmlDocument!(
      `<link rel="canonical" href="${ORIGIN}/races#clerk-nonce">`,
      { pathname: "/races", origin: ORIGIN, errorShellMarkers: [] }
    )
    expect(fragment.failures).toEqual([
      expect.objectContaining({ code: "canonical_mismatch", pathname: "/races" })
    ])
    expect(JSON.stringify(fragment)).not.toContain("clerk-nonce")
    expect(JSON.stringify(fragment)).not.toContain("#clerk")
  })
})

describe("collectPublicRouteBaseline content and registry checks", () => {
  afterEach(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop()
      if (dir) rmSync(dir, { recursive: true, force: true })
    }
  })

  it("fails when a sitemap route canonical does not match its normalized public URL", async () => {
    const scenariosPath = writeScenarios(
      validScenarios({
        coverage: [
          {
            id: "guided-circuit-pages",
            class: "guided_circuit",
            path_pattern: "^/circuits/[^/]+/grandstands$",
            min_count: 0,
            max_count: 64
          }
        ]
      })
    )
    const sitemap = ["/", "/series/f1", "/series/formula-e", "/series/motogp", "/series/indycar", "/series/wec"]
    const doc = await collectPublicRouteBaseline(
      { baseUrl: ORIGIN, scenariosPath },
      {
        fetch: pagesFetch({
          sitemap,
          html: {
            "/series/f1": healthyHtml("/series/f1", "Formula 1", `${ORIGIN}/`)
          }
        })
      }
    )
    expect(failuresOf(doc)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "canonical_mismatch",
          pathname: "/series/f1"
        })
      ])
    )
  })

  it("fails sitemap canonicals that add a query string or fragment without printing those values", async () => {
    const scenariosPath = writeScenarios(
      validScenarios({
        coverage: [
          {
            id: "guided-circuit-pages",
            class: "guided_circuit",
            path_pattern: "^/circuits/[^/]+/grandstands$",
            min_count: 0,
            max_count: 64
          }
        ]
      })
    )
    const sitemap = ["/", "/series/f1", "/series/formula-e", "/series/motogp", "/series/indycar", "/series/wec"]
    const doc = await collectPublicRouteBaseline(
      { baseUrl: ORIGIN, scenariosPath },
      {
        fetch: pagesFetch({
          sitemap,
          html: {
            "/": healthyHtml("/", "", `${ORIGIN}/?utm=secret-fragment#clerk-nonce`),
            "/series/f1": healthyHtml(
              "/series/f1",
              "Formula 1",
              `${ORIGIN}/series/f1?variant=secret-variant`
            )
          }
        })
      }
    )
    expect(failuresOf(doc)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "canonical_mismatch", pathname: "/" }),
        expect.objectContaining({
          code: "canonical_mismatch",
          pathname: "/series/f1"
        })
      ])
    )
    const printed = JSON.stringify(doc)
    expect(printed).not.toContain("variant=")
    expect(printed).not.toContain("secret-variant")
    expect(printed).not.toContain("secret-fragment")
    expect(printed).not.toContain("clerk-nonce")
    expect(printed).not.toContain("utm=")
    expect(printed).not.toContain("#clerk")
  })

  it("fails cross-route canonical collisions", async () => {
    const scenariosPath = writeScenarios(
      validScenarios({
        coverage: [
          {
            id: "guided-circuit-pages",
            class: "guided_circuit",
            path_pattern: "^/circuits/[^/]+/grandstands$",
            min_count: 0,
            max_count: 64
          }
        ]
      })
    )
    const sitemap = ["/", "/series/f1", "/series/formula-e", "/series/motogp", "/series/indycar", "/series/wec"]
    const doc = await collectPublicRouteBaseline(
      { baseUrl: ORIGIN, scenariosPath },
      {
        fetch: pagesFetch({
          sitemap,
          html: {
            "/series/f1": healthyHtml("/series/f1", "Formula 1", `${ORIGIN}/series/formula-e`),
            "/series/formula-e": healthyHtml("/series/formula-e", "Formula E")
          }
        })
      }
    )
    expect(failuresOf(doc)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "canonical_collision" })
      ])
    )
  })

  it("reports missing expected series and core routes", async () => {
    const scenariosPath = writeScenarios(validScenarios())
    const doc = await collectPublicRouteBaseline(
      { baseUrl: ORIGIN, scenariosPath },
      {
        fetch: pagesFetch({
          sitemap: ["/"],
          html: { "/": healthyHtml("/") }
        })
      }
    )
    const failures = failuresOf(doc)
    expect(failures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing_expected_series",
          pathname: "/series/motogp"
        }),
        expect.objectContaining({
          code: "missing_expected_route",
          pathname: "/series/f1"
        })
      ])
    )
  })

  it("reports missing guided-circuit coverage", async () => {
    const scenariosPath = writeScenarios(validScenarios())
    const sitemap = ["/", "/series/f1", "/series/formula-e", "/series/motogp", "/series/indycar", "/series/wec"]
    const doc = await collectPublicRouteBaseline(
      { baseUrl: ORIGIN, scenariosPath },
      {
        fetch: pagesFetch({
          sitemap,
          html: { "/series/f1": healthyHtml("/series/f1", "Formula 1") }
        })
      }
    )
    expect(failuresOf(doc)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "guided_circuit_coverage" })
      ])
    )
  })

  it("reports guided_circuit_overflow when coverage matches exceed max_count", async () => {
    const scenariosPath = writeScenarios(
      validScenarios({
        coverage: [
          {
            id: "guided-circuit-pages",
            class: "guided_circuit",
            path_pattern: "^/circuits/[^/]+/grandstands$",
            min_count: 1,
            max_count: 1
          }
        ]
      })
    )
    const sitemap = [
      "/",
      "/series/f1",
      "/series/formula-e",
      "/series/motogp",
      "/series/indycar",
      "/series/wec",
      "/circuits/spa/grandstands",
      "/circuits/monza/grandstands"
    ]
    const doc = await collectPublicRouteBaseline(
      { baseUrl: ORIGIN, scenariosPath },
      {
        fetch: pagesFetch({
          sitemap,
          html: { "/series/f1": healthyHtml("/series/f1", "Formula 1") }
        })
      }
    )
    expect(failuresOf(doc)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "guided_circuit_overflow" })
      ])
    )
  })

  it("reports missing required and forbidden content markers", async () => {
    const scenariosPath = writeScenarios(
      validScenarios({
        routes: [
          { id: "home", class: "core", pathname: "/" },
          {
            id: "series-f1",
            class: "series",
            pathname: "/series/f1",
            required_markers: ["Formula 1"],
            forbidden_markers: ["Join thousands of race fans"]
          }
        ],
        coverage: [
          {
            id: "guided-circuit-pages",
            class: "guided_circuit",
            path_pattern: "^/circuits/[^/]+/grandstands$",
            min_count: 0,
            max_count: 64
          }
        ]
      })
    )
    const sitemap = ["/", "/series/f1", "/series/formula-e", "/series/motogp", "/series/indycar", "/series/wec"]
    const doc = await collectPublicRouteBaseline(
      { baseUrl: ORIGIN, scenariosPath },
      {
        fetch: pagesFetch({
          sitemap,
          html: {
            "/series/f1": healthyHtml(
              "/series/f1",
              "Join thousands of race fans"
            )
          }
        })
      }
    )
    expect(failuresOf(doc)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing_required_content",
          pathname: "/series/f1"
        }),
        expect.objectContaining({
          code: "forbidden_content",
          pathname: "/series/f1"
        })
      ])
    )
  })

  it("still probes every sitemap route that is not listed in the registry", async () => {
    const scenariosPath = writeScenarios(
      validScenarios({
        coverage: [
          {
            id: "guided-circuit-pages",
            class: "guided_circuit",
            path_pattern: "^/circuits/[^/]+/grandstands$",
            min_count: 0,
            max_count: 64
          }
        ]
      })
    )
    const sitemap = [
      "/",
      "/alpha",
      "/series/f1",
      "/series/formula-e",
      "/series/motogp",
      "/series/indycar",
      "/series/wec"
    ]
    const probed: string[] = []
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = urlOf(input)
      probed.push(new URL(url).pathname)
      return pagesFetch({
        sitemap,
        html: { "/series/f1": healthyHtml("/series/f1", "Formula 1") }
      })(input, init)
    }
    const doc = await collectPublicRouteBaseline(
      { baseUrl: ORIGIN, scenariosPath },
      { fetch: fetchImpl }
    )
    expect(probed).toContain("/alpha")
    expect(doc.sitemap_route_count).toBe(7)
    expect(doc.routes.map(route => route.pathname)).toContain("/alpha")
  })

  it("fails 404 and 500 sitemap pages with unexpected_status and discards bodies", async () => {
    const scenariosPath = writeScenarios(
      validScenarios({
        coverage: [
          {
            id: "guided-circuit-pages",
            class: "guided_circuit",
            path_pattern: "^/circuits/[^/]+/grandstands$",
            min_count: 0,
            max_count: 64
          }
        ]
      })
    )
    const sitemap = ["/", "/series/f1", "/series/formula-e", "/series/motogp", "/series/indycar", "/series/wec"]
    const doc = await collectPublicRouteBaseline(
      { baseUrl: ORIGIN, scenariosPath },
      {
        fetch: pagesFetch({
          sitemap,
          status: { "/series/f1": 404, "/series/motogp": 500 },
          html: {
            "/series/f1":
              "<html><body>Application error: a server-side exception has occurred secret-404-body</body></html>",
            "/series/motogp": "<html><body>secret-500-body</body></html>",
            "/series/formula-e": healthyHtml("/series/formula-e", "Formula E")
          }
        })
      }
    )
    const failures = failuresOf(doc)
    expect(failures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "unexpected_status",
          pathname: "/series/f1"
        }),
        expect.objectContaining({
          code: "unexpected_status",
          pathname: "/series/motogp"
        })
      ])
    )
    expect(
      failures.some(
        item => item.pathname === "/series/f1" && item.code === "error_shell"
      )
    ).toBe(false)
    expect(
      failures.some(
        item =>
          item.pathname === "/series/f1" && item.code === "missing_required_content"
      )
    ).toBe(false)
    expect(doc.routes.find(route => route.pathname === "/series/f1")?.status).toBe(
      404
    )
    expect(
      doc.routes.find(route => route.pathname === "/series/motogp")?.status
    ).toBe(500)
    const printed = JSON.stringify(doc)
    expect(printed).not.toContain("secret-404-body")
    expect(printed).not.toContain("secret-500-body")
    expect(printed).not.toContain("<html")
  })

  it("fails 200 application/json sitemap pages with unexpected_content_type and discards bodies", async () => {
    const scenariosPath = writeScenarios(
      validScenarios({
        coverage: [
          {
            id: "guided-circuit-pages",
            class: "guided_circuit",
            path_pattern: "^/circuits/[^/]+/grandstands$",
            min_count: 0,
            max_count: 64
          }
        ]
      })
    )
    const sitemap = ["/", "/series/f1", "/series/formula-e", "/series/motogp", "/series/indycar", "/series/wec"]
    const fetchImpl: typeof fetch = async input => {
      const url = urlOf(input)
      if (url === `${ORIGIN}/sitemap.xml`) {
        return sitemapResponse(urlset(sitemap.map(locFor)))
      }
      const pathname = new URL(url).pathname
      if (pathname === "/series/f1") {
        return new Response(
          `{"token":"json-secret","__clerk_handshake":"nope"}`,
          { status: 200, headers: { "content-type": "application/json" } }
        )
      }
      const extra =
        pathname === "/series/formula-e"
          ? "Formula E"
          : pathname === "/series/motogp"
            ? "MotoGP"
            : pathname === "/series/indycar"
              ? "IndyCar"
              : pathname === "/series/wec"
                ? "World Endurance Championship"
                : ""
      return htmlResponse(healthyHtml(pathname, extra))
    }
    const doc = await collectPublicRouteBaseline(
      { baseUrl: ORIGIN, scenariosPath },
      { fetch: fetchImpl }
    )
    const failures = failuresOf(doc)
    expect(failures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "unexpected_content_type",
          pathname: "/series/f1"
        })
      ])
    )
    expect(
      failures.some(
        item =>
          item.pathname === "/series/f1" && item.code === "missing_required_content"
      )
    ).toBe(false)
    expect(
      doc.routes.find(route => route.pathname === "/series/f1")?.content_type
    ).toBe("application/json")
    expect(
      doc.routes.find(route => route.pathname === "/series/f1")?.status
    ).toBe(200)
    const printed = JSON.stringify(doc)
    expect(printed).not.toContain("json-secret")
    expect(printed).not.toContain("__clerk_handshake")
    expect(printed).not.toContain("token")
  })
})

describe("runCli packet A", () => {
  afterEach(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop()
      if (dir) rmSync(dir, { recursive: true, force: true })
    }
  })

  it("exits 1 with machine-readable failures and never prints HTML or secrets", async () => {
    const scenariosPath = writeScenarios(
      validScenarios({
        coverage: [
          {
            id: "guided-circuit-pages",
            class: "guided_circuit",
            path_pattern: "^/circuits/[^/]+/grandstands$",
            min_count: 0,
            max_count: 64
          }
        ]
      })
    )
    const leak = "postgresql://user:s3cret@db/prod?token=abc"
    const stdout: string[] = []
    const stderr: string[] = []
    const code = await runCli(["--base-url", ORIGIN, "--scenarios", scenariosPath], {
      fetch: pagesFetch({
        sitemap: ["/", "/series/f1", "/series/formula-e", "/series/motogp", "/series/indycar", "/series/wec"],
        html: {
          "/": `<html><head><link rel="canonical" href="${ORIGIN}/"></head><body><h2>Application error: a server-side exception has occurred</h2><pre>${leak}</pre></body></html>`
        }
      }),
      stdout: { write: chunk => stdout.push(String(chunk)) },
      stderr: { write: chunk => stderr.push(String(chunk)) },
      now: () => new Date("2026-08-25T12:00:00.000Z")
    })
    expect(code).toBe(1)
    const printed = `${stdout.join("")}${stderr.join("")}`
    expect(printed).not.toContain(leak)
    expect(printed).not.toContain("s3cret")
    expect(printed).not.toContain("<html")
    expect(printed).not.toContain("<pre>")
    const doc = JSON.parse(stdout.join("")) as {
      failures: Array<{ code: string; pathname?: string }>
    }
    expect(doc.failures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "error_shell", pathname: "/" })
      ])
    )
  })

  it("loads the default repo registry when --scenarios is omitted", async () => {
    const stdout: string[] = []
    const stderr: string[] = []
    const code = await runCli(["--base-url", ORIGIN], {
      fetch: pagesFetch({
        sitemap: ["/"],
        html: { "/": healthyHtml("/") }
      }),
      stdout: { write: chunk => stdout.push(String(chunk)) },
      stderr: { write: chunk => stderr.push(String(chunk)) }
    })
    expect(code).toBe(1)
    const doc = JSON.parse(stdout.join("")) as {
      failures: Array<{ code: string; pathname?: string }>
    }
    expect(doc.failures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing_expected_series",
          pathname: "/series/f1"
        })
      ])
    )
    expect(stderr.join("")).not.toMatch(/https?:\/\/[^\s]*[?&](token|key)=/i)
  })

  it("rejects an unsafe or oversized --scenarios path without leaking file contents", async () => {
    const stdout: string[] = []
    const stderr: string[] = []
    const io = {
      fetch: pagesFetch({ sitemap: ["/"], html: { "/": healthyHtml("/") } }),
      stdout: { write: (chunk: string) => stdout.push(String(chunk)) },
      stderr: { write: (chunk: string) => stderr.push(String(chunk)) }
    }

    const missing = await runCli(
      ["--base-url", ORIGIN, "--scenarios", "/tmp/does-not-exist-plt.json"],
      io
    )
    expect(missing).toBe(1)
    expect(stdout.join("")).toBe("")

    const envPath = writeScenarios("DATABASE_URL=postgresql://user:s3cret@db/prod\n", "secrets.env")
    const wrongExt = await runCli(["--base-url", ORIGIN, "--scenarios", envPath], io)
    expect(wrongExt).toBe(1)
    expect(stdout.join("")).toBe("")
    expect(stderr.join("")).not.toContain("s3cret")
    expect(stderr.join("")).not.toContain("postgresql://")

    const huge = writeScenarios(`${"{\"x\":"}${"1".repeat(80_000)}`, "too-big.json")
    const oversized = await runCli(["--base-url", ORIGIN, "--scenarios", huge], io)
    expect(oversized).toBe(1)
    expect(stdout.join("")).toBe("")
  })
})
