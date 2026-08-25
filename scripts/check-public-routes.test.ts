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
  it("prints deterministic JSON and exits 0 when every route is HTTP 307", async () => {
    const xml = urlset([
      `${ORIGIN}/zeta`,
      `${ORIGIN}/`,
      `${ORIGIN}/alpha`
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
    const code = await runCli(["--base-url", ORIGIN], {
      fetch: fetchImpl,
      stdout: { write: (chunk: string) => stdout.push(String(chunk)) },
      stderr: { write: (chunk: string) => stderr.push(String(chunk)) },
      now: () => new Date("2026-08-25T12:00:00.000Z")
    })

    expect(code).toBe(0)
    expect(stderr.join("")).toBe("")
    const doc = JSON.parse(stdout.join("")) as {
      schema_version: number
      checked_at: string
      base_url: string
      sitemap_route_count: number
      bounds: Record<string, number>
      status_counts: Record<string, number>
      external_redirect_count: number
      external_redirect_origins: string[]
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
    expect(doc.sitemap_route_count).toBe(3)
    expect(doc.bounds).toMatchObject({
      min_routes: 1,
      max_routes: 250,
      concurrency: 4,
      request_timeout_ms: 10_000,
      sitemap_max_bytes: SITEMAP_MAX_BYTES
    })
    expect(Object.keys(doc.status_counts)).toEqual(["307"])
    expect(doc.status_counts["307"]).toBe(3)
    expect(doc.external_redirect_count).toBe(3)
    expect(doc.external_redirect_origins).toEqual(["https://clerk.accounts.dev"])
    expect(doc.routes.map((route) => route.pathname)).toEqual([
      "/",
      "/alpha",
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

    const printed = stdout.join("")
    expect(printed).not.toContain("SECRET")
    expect(printed).not.toContain("__clerk_handshake")
    expect(printed).not.toContain("SECRETCOOKIE")
    expect(printed).not.toContain("response-body-must-not-leak")
    expect(printed).not.toContain("set-cookie")
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
