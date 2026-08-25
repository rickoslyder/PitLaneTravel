import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { parseString } from "xml2js"

export const SCHEMA_VERSION = 1
export const MIN_ROUTES = 1
export const MAX_ROUTES = 250
export const PROBE_CONCURRENCY = 4
export const PROBE_TIMEOUT_MS = 10_000
export const SITEMAP_TIMEOUT_MS = 15_000
export const SITEMAP_MAX_BYTES = 1_048_576
const SITEMAP_PROTOCOL_NAMESPACE =
  "http://www.sitemaps.org/schemas/sitemap/0.9"
export const CHECKER_USER_AGENT =
  "PitLaneTravelPublicRouteCheck/1.0 (+https://www.pitlanetravel.com)"
export const BROWSER_USER_AGENT =
  "Mozilla/5.0 (compatible; PitLaneTravelPublicRouteCheck/1.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
export const BROWSER_ACCEPT =
  "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"

export class PublicRouteCheckError extends Error {
  readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = "PublicRouteCheckError"
    this.code = code
  }
}

export type RouteRecord = {
  pathname: string
  status: number
  content_type: string | null
  redirect: string | null
  duration_ms: number
}

export type BaselineDocument = {
  schema_version: number
  checked_at: string
  base_url: string
  sitemap_route_count: number
  bounds: {
    min_routes: number
    max_routes: number
    concurrency: number
    request_timeout_ms: number
    sitemap_timeout_ms: number
    sitemap_max_bytes: number
  }
  status_counts: Record<string, number>
  external_redirect_count: number
  external_redirect_origins: string[]
  routes: RouteRecord[]
}

export type CliIo = {
  fetch: typeof fetch
  stdout: { write: (chunk: string) => unknown }
  stderr: { write: (chunk: string) => unknown }
  now?: () => Date
}

type XmlNode = { [key: string]: unknown }

export function isDirectCliExecution(
  metaUrl: string,
  argv1: string | undefined
): boolean {
  if (!argv1) return false
  try {
    return pathToFileURL(resolve(argv1)).href === metaUrl
  } catch {
    return false
  }
}

export function parseCliArgs(argv: string[]): { baseUrl: string } {
  let raw: string | undefined

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i] ?? ""
    if (arg === "--base-url") {
      if (raw !== undefined) {
        throw new PublicRouteCheckError("duplicate --base-url", "cli_args")
      }
      const value = argv[i + 1]
      if (!value || value.startsWith("--")) {
        throw new PublicRouteCheckError(
          "--base-url requires an https URL",
          "cli_args"
        )
      }
      raw = value
      i += 1
      continue
    }
    if (arg.startsWith("--base-url=")) {
      if (raw !== undefined) {
        throw new PublicRouteCheckError("duplicate --base-url", "cli_args")
      }
      const value = arg.slice("--base-url=".length)
      if (!value) {
        throw new PublicRouteCheckError(
          "--base-url requires an https URL",
          "cli_args"
        )
      }
      raw = value
      continue
    }
    throw new PublicRouteCheckError("unexpected argument", "cli_args")
  }

  if (!raw) {
    throw new PublicRouteCheckError("missing required --base-url", "cli_args")
  }
  return { baseUrl: normalizeBaseUrl(raw) }
}

export function normalizeBaseUrl(raw: string): string {
  const url = parseHttpsUrl(raw, "invalid_base_url", "base URL")
  if (url.pathname !== "/" && url.pathname !== "") {
    throw new PublicRouteCheckError(
      "base URL must be the origin root",
      "invalid_base_url"
    )
  }
  return url.origin
}

export function parseSitemapLocs(xml: string): string[] {
  if (/<!DOCTYPE/i.test(xml) || /<!ENTITY/i.test(xml)) {
    throw new PublicRouteCheckError(
      "sitemap DTD/entity declarations are not allowed",
      "sitemap_malformed"
    )
  }

  const parsed = parseXmlSync(xml)
  if (parsed.sitemapindex !== undefined) {
    throw new PublicRouteCheckError(
      "sitemap indexes are not supported",
      "sitemap_index"
    )
  }
  if (parsed.urlset === undefined || typeof parsed.urlset !== "object") {
    throw new PublicRouteCheckError("sitemap must be a urlset", "sitemap_malformed")
  }

  const urlset = parsed.urlset as XmlNode
  if (urlsetNamespace(urlset) !== SITEMAP_PROTOCOL_NAMESPACE) {
    throw new PublicRouteCheckError(
      "sitemap urlset must use the Sitemap protocol namespace",
      "sitemap_malformed"
    )
  }

  const urls = asArray(urlset.url)
  const locs: string[] = []
  for (const entry of urls) {
    if (!entry || typeof entry !== "object") {
      throw new PublicRouteCheckError(
        "malformed sitemap url entry",
        "sitemap_malformed"
      )
    }
    const locNodes = asArray((entry as XmlNode).loc)
    if (locNodes.length !== 1) {
      throw new PublicRouteCheckError(
        "sitemap url must contain exactly one loc",
        "sitemap_malformed"
      )
    }
    const loc = locNodes[0]
    if (typeof loc !== "string") {
      throw new PublicRouteCheckError("malformed sitemap loc", "sitemap_malformed")
    }
    const trimmed = loc.trim()
    if (!trimmed) {
      throw new PublicRouteCheckError("empty sitemap loc", "sitemap_malformed")
    }
    locs.push(trimmed)
  }
  return locs
}

export function assertSitemapRoutes(locs: string[], origin: string): string[] {
  if (locs.length === 0) {
    throw new PublicRouteCheckError("sitemap contains no routes", "sitemap_empty")
  }
  if (locs.length > MAX_ROUTES) {
    throw new PublicRouteCheckError(
      `sitemap has more than ${MAX_ROUTES} routes`,
      "too_many_routes"
    )
  }

  const seen = new Set<string>()
  const urls: string[] = []
  for (const loc of locs) {
    const url = parseHttpsUrl(loc, "invalid_route_url", "sitemap loc")
    if (url.origin !== origin) {
      throw new PublicRouteCheckError("sitemap loc is off-origin", "off_origin")
    }
    const key = `${url.origin}${url.pathname}`
    if (seen.has(key)) {
      throw new PublicRouteCheckError("duplicate sitemap loc", "duplicate_loc")
    }
    seen.add(key)
    urls.push(key)
  }
  return urls
}

export function sanitizeRedirect(
  location: string | null | undefined,
  requestUrl?: string
): string | null {
  if (!location) return null
  const trimmed = location.trim()
  if (!trimmed) return null

  try {
    let url: URL
    if (/^[a-zA-Z][a-zA-Z+\-.]*:/.test(trimmed)) {
      url = new URL(trimmed)
    } else if (trimmed.startsWith("/") && requestUrl) {
      url = new URL(trimmed, requestUrl)
    } else {
      return null
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null
    }
    return `${url.origin}${url.pathname}`
  } catch {
    return null
  }
}

export function normalizeContentType(
  header: string | null | undefined
): string | null {
  if (!header) return null
  const media = header.split(";", 1)[0]?.trim().toLowerCase()
  return media || null
}

export async function probeRoutes(
  urls: string[],
  deps: { fetch: typeof fetch }
): Promise<RouteRecord[]> {
  return mapPool(urls, PROBE_CONCURRENCY, async (target) => {
    const started = performance.now()
    let res: Response
    try {
      res = await deps.fetch(target, {
        method: "GET",
        redirect: "manual",
        credentials: "omit",
        signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
        headers: {
          Accept: BROWSER_ACCEPT,
          "User-Agent": BROWSER_USER_AGENT
        }
      })
    } catch (err) {
      if (isTimeoutError(err)) {
        throw new PublicRouteCheckError("route probe timed out", "probe_timeout")
      }
      throw new PublicRouteCheckError("route probe failed", "probe_network")
    }

    await discardBody(res)
    const url = new URL(target)
    return {
      pathname: url.pathname,
      status: res.status,
      content_type: normalizeContentType(res.headers.get("content-type")),
      redirect: sanitizeRedirect(res.headers.get("location"), target),
      duration_ms: Math.max(0, Math.round(performance.now() - started))
    }
  })
}

export async function collectPublicRouteBaseline(
  input: { baseUrl: string },
  deps: { fetch: typeof fetch; now?: () => Date }
): Promise<BaselineDocument> {
  const origin = normalizeBaseUrl(input.baseUrl)
  const xml = await fetchSitemapXml(origin, deps)
  const locs = parseSitemapLocs(xml)
  const routes = assertSitemapRoutes(locs, origin)
  const records = await probeRoutes(routes, deps)
  return buildBaselineDocument(origin, records, deps.now?.() ?? new Date())
}

export async function runCli(argv: string[], io: CliIo): Promise<number> {
  try {
    const { baseUrl } = parseCliArgs(argv)
    const document = await collectPublicRouteBaseline({ baseUrl }, io)
    io.stdout.write(`${JSON.stringify(document, null, 2)}\n`)
    return 0
  } catch (err) {
    const message =
      err instanceof PublicRouteCheckError
        ? err.message
        : "public route check failed"
    io.stderr.write(`${message}\n`)
    return 1
  }
}

function parseHttpsUrl(
  raw: string,
  code: "invalid_base_url" | "invalid_route_url",
  label: string
): URL {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new PublicRouteCheckError(`${label} is not a valid https URL`, code)
  }
  if (url.protocol !== "https:") {
    throw new PublicRouteCheckError(`${label} must be https`, code)
  }
  if (url.username || url.password) {
    throw new PublicRouteCheckError(`${label} must not include credentials`, code)
  }
  if (url.search) {
    throw new PublicRouteCheckError(`${label} must not include a query`, code)
  }
  if (url.hash) {
    throw new PublicRouteCheckError(`${label} must not include a fragment`, code)
  }
  return url
}

function parseXmlSync(xml: string): XmlNode {
  let parsed: unknown
  let error: Error | undefined
  parseString(
    xml,
    { explicitArray: true, ignoreAttrs: false, trim: true },
    (err: Error | null, result: unknown) => {
      if (err) error = err
      else parsed = result
    }
  )
  if (error || !parsed || typeof parsed !== "object") {
    throw new PublicRouteCheckError("malformed sitemap xml", "sitemap_malformed")
  }
  return parsed as XmlNode
}

function asArray(value: unknown): unknown[] {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

function urlsetNamespace(urlset: XmlNode): string | undefined {
  const attrs = urlset.$
  if (!attrs || typeof attrs !== "object" || Array.isArray(attrs)) {
    return undefined
  }
  const xmlns = (attrs as { [key: string]: unknown }).xmlns
  return typeof xmlns === "string" ? xmlns : undefined
}

function isTimeoutError(err: unknown): boolean {
  return (
    err instanceof Error &&
    (err.name === "TimeoutError" || err.name === "AbortError")
  )
}

function isXmlContentType(media: string | null): boolean {
  if (!media) return false
  return (
    media === "application/xml" || media === "text/xml" || media.endsWith("+xml")
  )
}

async function fetchSitemapXml(
  origin: string,
  deps: { fetch: typeof fetch }
): Promise<string> {
  let res: Response
  try {
    res = await deps.fetch(`${origin}/sitemap.xml`, {
      method: "GET",
      redirect: "manual",
      credentials: "omit",
      signal: AbortSignal.timeout(SITEMAP_TIMEOUT_MS),
      headers: {
        Accept: "application/xml, text/xml;q=0.9, */*;q=0.1",
        "User-Agent": CHECKER_USER_AGENT
      }
    })
  } catch (err) {
    if (isTimeoutError(err)) {
      throw new PublicRouteCheckError("sitemap request timed out", "sitemap_timeout")
    }
    throw new PublicRouteCheckError("sitemap request failed", "sitemap_network")
  }

  if (res.status !== 200) {
    await discardBody(res)
    throw new PublicRouteCheckError(
      `sitemap returned HTTP ${res.status}`,
      "sitemap_http"
    )
  }

  const media = normalizeContentType(res.headers.get("content-type"))
  if (!isXmlContentType(media)) {
    await discardBody(res)
    throw new PublicRouteCheckError(
      "sitemap content type must be XML",
      "sitemap_content_type"
    )
  }

  return readBoundedText(res, SITEMAP_MAX_BYTES)
}

async function readBoundedText(
  res: Response,
  maxBytes: number
): Promise<string> {
  const declared = Number(res.headers.get("content-length"))
  if (Number.isFinite(declared) && declared > maxBytes) {
    await discardBody(res)
    throw new PublicRouteCheckError(
      `sitemap exceeds ${maxBytes} byte cap`,
      "sitemap_too_large"
    )
  }

  if (!res.body) {
    throw new PublicRouteCheckError("empty sitemap body", "sitemap_malformed")
  }

  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue
      total += value.byteLength
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined)
        throw new PublicRouteCheckError(
          `sitemap exceeds ${maxBytes} byte cap`,
          "sitemap_too_large"
        )
      }
      chunks.push(value)
    }
  } catch (err) {
    if (err instanceof PublicRouteCheckError) throw err
    throw new PublicRouteCheckError("failed to read sitemap body", "sitemap_network")
  }

  const merged = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(merged)
  } catch {
    throw new PublicRouteCheckError("sitemap is not valid UTF-8", "sitemap_malformed")
  }
}

async function discardBody(res: Response): Promise<void> {
  try {
    if (res.body) await res.body.cancel()
  } catch {
    // Best-effort drain/cancel only.
  }
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0

  async function run(): Promise<void> {
    while (next < items.length) {
      const index = next
      next += 1
      results[index] = await worker(items[index] as T)
    }
  }

  const size = Math.min(limit, items.length)
  await Promise.all(Array.from({ length: size }, () => run()))
  return results
}

function buildBaselineDocument(
  origin: string,
  records: RouteRecord[],
  now: Date
): BaselineDocument {
  const routes = [...records].sort((left, right) => {
    if (left.pathname < right.pathname) return -1
    if (left.pathname > right.pathname) return 1
    return 0
  })

  const tallies = new Map<number, number>()
  for (const record of routes) {
    tallies.set(record.status, (tallies.get(record.status) ?? 0) + 1)
  }
  const status_counts: Record<string, number> = {}
  for (const status of [...tallies.keys()].sort((a, b) => a - b)) {
    status_counts[String(status)] = tallies.get(status) ?? 0
  }

  const externalOrigins = new Set<string>()
  let externalCount = 0
  for (const record of routes) {
    if (!record.redirect) continue
    try {
      const redirectOrigin = new URL(record.redirect).origin
      if (redirectOrigin !== origin) {
        externalCount += 1
        externalOrigins.add(redirectOrigin)
      }
    } catch {
      // Sanitized redirects are origin+pathname; ignore any residual parse miss.
    }
  }

  return {
    schema_version: SCHEMA_VERSION,
    checked_at: now.toISOString(),
    base_url: origin,
    sitemap_route_count: routes.length,
    bounds: {
      min_routes: MIN_ROUTES,
      max_routes: MAX_ROUTES,
      concurrency: PROBE_CONCURRENCY,
      request_timeout_ms: PROBE_TIMEOUT_MS,
      sitemap_timeout_ms: SITEMAP_TIMEOUT_MS,
      sitemap_max_bytes: SITEMAP_MAX_BYTES
    },
    status_counts,
    external_redirect_count: externalCount,
    external_redirect_origins: [...externalOrigins].sort(),
    routes
  }
}

if (isDirectCliExecution(import.meta.url, process.argv[1])) {
  void runCli(process.argv.slice(2), {
    fetch: globalThis.fetch,
    stdout: process.stdout,
    stderr: process.stderr
  })
    .then((code) => {
      process.exit(code)
    })
    .catch(() => {
      process.stderr.write("public route check failed\n")
      process.exit(1)
    })
}
