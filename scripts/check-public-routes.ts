import { readFileSync, statSync } from "node:fs"
import { isAbsolute, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { parseString } from "xml2js"

export const SCHEMA_VERSION = 1
export const SCENARIO_SCHEMA_VERSION = 1
export const MIN_ROUTES = 1
export const MAX_ROUTES = 250
export const PROBE_CONCURRENCY = 4
export const PROBE_TIMEOUT_MS = 10_000
export const SITEMAP_TIMEOUT_MS = 15_000
export const SITEMAP_MAX_BYTES = 1_048_576
export const HTML_BODY_MAX_BYTES = 1_048_576
export const SCENARIOS_MAX_BYTES = 65_536
export const REPO_ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "..")
export const DEFAULT_SCENARIOS_PATH = resolve(
  REPO_ROOT,
  "data/qa/public-route-scenarios.json"
)
const SITEMAP_PROTOCOL_NAMESPACE =
  "http://www.sitemaps.org/schemas/sitemap/0.9"
const REQUIRED_SERIES_SLUGS = [
  "f1",
  "formula-e",
  "indycar",
  "motogp",
  "wec"
] as const
const SCENARIO_ROUTE_CLASSES = new Set([
  "core",
  "series",
  "guided_circuit_index",
  "guided_circuit",
  "marketing",
  "legal"
])
const SCENARIO_TOP_LEVEL_KEYS = new Set([
  "schema_version",
  "error_shell_markers",
  "intended_active_series",
  "routes",
  "coverage"
])
const SAFE_PATH_PATTERN = /^[\^$/a-z0-9+[\]_-]+$/i
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

export type RouteCheckFailure = {
  code: string
  pathname?: string
}

export type RouteScenario = {
  id: string
  class: string
  pathname: string
  required_markers: string[]
  forbidden_markers: string[]
}

export type CoverageScenario = {
  id: string
  class: string
  path_pattern: string
  min_count: number
  max_count: number
  required_markers: string[]
  forbidden_markers: string[]
}

export type RouteScenarios = {
  schema_version: number
  error_shell_markers: string[]
  intended_active_series: Array<{ slug: string; name: string }>
  routes: RouteScenario[]
  coverage: CoverageScenario[]
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
  failures: RouteCheckFailure[]
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

export function parseCliArgs(argv: string[]): {
  baseUrl: string
  scenariosPath?: string
} {
  let raw: string | undefined
  let scenariosRaw: string | undefined

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
    if (arg === "--scenarios") {
      if (scenariosRaw !== undefined) {
        throw new PublicRouteCheckError("duplicate --scenarios", "cli_args")
      }
      const value = argv[i + 1]
      if (!value || value.startsWith("--")) {
        throw new PublicRouteCheckError(
          "--scenarios requires a json file path",
          "cli_args"
        )
      }
      scenariosRaw = value
      i += 1
      continue
    }
    if (arg.startsWith("--scenarios=")) {
      if (scenariosRaw !== undefined) {
        throw new PublicRouteCheckError("duplicate --scenarios", "cli_args")
      }
      const value = arg.slice("--scenarios=".length)
      if (!value) {
        throw new PublicRouteCheckError(
          "--scenarios requires a json file path",
          "cli_args"
        )
      }
      scenariosRaw = value
      continue
    }
    throw new PublicRouteCheckError("unexpected argument", "cli_args")
  }

  if (!raw) {
    throw new PublicRouteCheckError("missing required --base-url", "cli_args")
  }
  return {
    baseUrl: normalizeBaseUrl(raw),
    ...(scenariosRaw ? { scenariosPath: scenariosRaw } : {})
  }
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

export function validateRouteScenarios(raw: unknown): RouteScenarios {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
  }
  const doc = raw as Record<string, unknown>
  for (const key of Object.keys(doc)) {
    if (!SCENARIO_TOP_LEVEL_KEYS.has(key)) {
      throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
    }
  }
  if (doc.schema_version !== SCENARIO_SCHEMA_VERSION) {
    throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
  }

  const errorShellMarkers = parseMarkerList(doc.error_shell_markers, 1, 32)
  const seriesRaw = doc.intended_active_series
  if (!Array.isArray(seriesRaw) || seriesRaw.length !== REQUIRED_SERIES_SLUGS.length) {
    throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
  }
  const series: Array<{ slug: string; name: string }> = []
  const seriesSlugs = new Set<string>()
  for (const item of seriesRaw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
    }
    const row = item as Record<string, unknown>
    if (Object.keys(row).some(key => key !== "slug" && key !== "name")) {
      throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
    }
    if (typeof row.slug !== "string" || typeof row.name !== "string") {
      throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
    }
    const slug = row.slug.trim()
    const name = row.name.trim()
    if (!slug || !name || name.length > 80 || seriesSlugs.has(slug)) {
      throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
    }
    seriesSlugs.add(slug)
    series.push({ slug, name })
  }
  const required = new Set<string>(REQUIRED_SERIES_SLUGS)
  if (seriesSlugs.size !== required.size || [...seriesSlugs].some(slug => !required.has(slug))) {
    throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
  }

  const ids = new Set<string>()
  const routes = parseRouteScenarios(doc.routes, ids)
  const coverage = parseCoverageScenarios(doc.coverage, ids)
  return {
    schema_version: SCENARIO_SCHEMA_VERSION,
    error_shell_markers: errorShellMarkers,
    intended_active_series: series,
    routes,
    coverage
  }
}

export function resolveScenariosPath(raw: string): string {
  if (!raw || raw.includes("\0")) {
    throw new PublicRouteCheckError("scenarios path is invalid", "scenarios_path")
  }
  const resolved = isAbsolute(raw) ? resolve(raw) : resolve(REPO_ROOT, raw)
  if (!resolved.endsWith(".json")) {
    throw new PublicRouteCheckError("scenarios path is invalid", "scenarios_path")
  }
  return resolved
}

export function loadRouteScenarios(path: string): RouteScenarios {
  const resolved = resolveScenariosPath(path)
  let stat
  try {
    stat = statSync(resolved)
  } catch {
    throw new PublicRouteCheckError("scenarios file is not readable", "scenarios_path")
  }
  if (!stat.isFile()) {
    throw new PublicRouteCheckError("scenarios file is not readable", "scenarios_path")
  }
  if (stat.size > SCENARIOS_MAX_BYTES) {
    throw new PublicRouteCheckError("scenarios file exceeds byte cap", "scenarios_too_large")
  }
  let text: string
  try {
    text = readFileSync(resolved, "utf8")
  } catch {
    throw new PublicRouteCheckError("scenarios file is not readable", "scenarios_path")
  }
  if (Buffer.byteLength(text, "utf8") > SCENARIOS_MAX_BYTES) {
    throw new PublicRouteCheckError("scenarios file exceeds byte cap", "scenarios_too_large")
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new PublicRouteCheckError("scenarios JSON is malformed", "invalid_scenarios")
  }
  return validateRouteScenarios(parsed)
}

export function extractCanonicalHrefs(html: string): string[] {
  const hrefs: string[] = []
  const linkRe = /<link\b[^>]*>/gi
  let match: RegExpExecArray | null
  while ((match = linkRe.exec(html)) !== null) {
    const tag = match[0] ?? ""
    const rel = getHtmlAttr(tag, "rel")
    if (!rel) continue
    const tokens = rel.trim().toLowerCase().split(/\s+/)
    if (!tokens.includes("canonical")) continue
    const href = getHtmlAttr(tag, "href")
    if (href !== null) hrefs.push(href.trim())
  }
  return hrefs
}

export function inspectHtmlDocument(
  html: string,
  input: {
    pathname: string
    origin: string
    errorShellMarkers: string[]
    requiredMarkers?: string[]
    forbiddenMarkers?: string[]
  }
): { failures: RouteCheckFailure[]; canonicals: string[] } {
  const pathname = input.pathname
  for (const marker of input.errorShellMarkers) {
    if (marker && html.includes(marker)) {
      return {
        failures: [{ code: "error_shell", pathname }],
        canonicals: []
      }
    }
  }

  const failures: RouteCheckFailure[] = []
  const rawCanonicals = extractCanonicalHrefs(html)
  const canonicals: string[] = []
  if (rawCanonicals.length === 0) {
    failures.push({ code: "missing_canonical", pathname })
  } else if (rawCanonicals.length > 1) {
    failures.push({ code: "duplicate_canonical", pathname })
  } else {
    const resolved = resolveCanonicalHref(
      rawCanonicals[0] ?? "",
      input.origin,
      pathname
    )
    if (resolved.failure) {
      failures.push(resolved.failure)
    }
    if (resolved.href) {
      canonicals.push(resolved.href)
    }
  }

  for (const marker of input.requiredMarkers ?? []) {
    if (marker && !html.includes(marker)) {
      failures.push({ code: "missing_required_content", pathname })
      break
    }
  }
  for (const marker of input.forbiddenMarkers ?? []) {
    if (marker && html.includes(marker)) {
      failures.push({ code: "forbidden_content", pathname })
      break
    }
  }

  return { failures, canonicals }
}

export async function probeRoutes(
  urls: string[],
  deps: { fetch: typeof fetch }
): Promise<RouteRecord[]> {
  const pages = await probeRoutePages(urls, deps)
  return pages.map(page => page.record)
}

export async function collectPublicRouteBaseline(
  input: { baseUrl: string; scenariosPath?: string },
  deps: { fetch: typeof fetch; now?: () => Date }
): Promise<BaselineDocument> {
  const origin = normalizeBaseUrl(input.baseUrl)
  const scenarios = loadRouteScenarios(
    input.scenariosPath ?? DEFAULT_SCENARIOS_PATH
  )
  const xml = await fetchSitemapXml(origin, deps)
  const locs = parseSitemapLocs(xml)
  const routes = assertSitemapRoutes(locs, origin)
  const pages = await probeRoutePages(routes, deps)
  const records = pages.map(page => page.record)
  const failures = evaluateRouteHealth(origin, pages, scenarios)
  return buildBaselineDocument(
    origin,
    records,
    deps.now?.() ?? new Date(),
    failures
  )
}

export async function runCli(argv: string[], io: CliIo): Promise<number> {
  try {
    const { baseUrl, scenariosPath } = parseCliArgs(argv)
    const document = await collectPublicRouteBaseline(
      { baseUrl, scenariosPath },
      io
    )
    io.stdout.write(`${JSON.stringify(document, null, 2)}\n`)
    if (document.failures.length > 0) {
      for (const failure of document.failures) {
        const suffix = failure.pathname ? ` ${failure.pathname}` : ""
        io.stderr.write(`${failure.code}${suffix}\n`)
      }
      return 1
    }
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

function parseMarkerList(
  raw: unknown,
  min: number,
  max: number
): string[] {
  if (!Array.isArray(raw) || raw.length < min || raw.length > max) {
    throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
  }
  const markers: string[] = []
  for (const item of raw) {
    if (typeof item !== "string") {
      throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
    }
    if (!item || item.length > 200) {
      throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
    }
    markers.push(item)
  }
  return markers
}

function parseOptionalMarkers(raw: unknown): string[] {
  if (raw === undefined) return []
  return parseMarkerList(raw, 0, 16)
}

function takeScenarioId(raw: unknown, ids: Set<string>): string {
  if (typeof raw !== "string" || !/^[a-z0-9-]+$/.test(raw) || raw.length > 64) {
    throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
  }
  if (ids.has(raw)) {
    throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
  }
  ids.add(raw)
  return raw
}

function assertScenarioPathname(pathname: string): string {
  if (!pathname.startsWith("/") || pathname.includes("//")) {
    throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
  }
  if (pathname.includes("?") || pathname.includes("#") || pathname.includes("\\")) {
    throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
  }
  if (pathname.length > 1 && pathname.endsWith("/")) {
    throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
  }
  return pathname
}

function parseRouteScenarios(raw: unknown, ids: Set<string>): RouteScenario[] {
  if (!Array.isArray(raw) || raw.length > 100) {
    throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
  }
  const routes: RouteScenario[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
    }
    const row = item as Record<string, unknown>
    for (const key of Object.keys(row)) {
      if (
        key !== "id" &&
        key !== "class" &&
        key !== "pathname" &&
        key !== "required_markers" &&
        key !== "forbidden_markers"
      ) {
        throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
      }
    }
    if (typeof row.class !== "string" || !SCENARIO_ROUTE_CLASSES.has(row.class)) {
      throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
    }
    if (typeof row.pathname !== "string") {
      throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
    }
    routes.push({
      id: takeScenarioId(row.id, ids),
      class: row.class,
      pathname: assertScenarioPathname(row.pathname),
      required_markers: parseOptionalMarkers(row.required_markers),
      forbidden_markers: parseOptionalMarkers(row.forbidden_markers)
    })
  }
  return routes
}

function parseCoverageScenarios(raw: unknown, ids: Set<string>): CoverageScenario[] {
  if (!Array.isArray(raw) || raw.length > 16) {
    throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
  }
  const coverage: CoverageScenario[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
    }
    const row = item as Record<string, unknown>
    for (const key of Object.keys(row)) {
      if (
        key !== "id" &&
        key !== "class" &&
        key !== "path_pattern" &&
        key !== "min_count" &&
        key !== "max_count" &&
        key !== "required_markers" &&
        key !== "forbidden_markers"
      ) {
        throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
      }
    }
    if (typeof row.class !== "string" || !SCENARIO_ROUTE_CLASSES.has(row.class)) {
      throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
    }
    if (
      typeof row.path_pattern !== "string" ||
      !row.path_pattern.startsWith("^") ||
      !row.path_pattern.endsWith("$") ||
      !SAFE_PATH_PATTERN.test(row.path_pattern)
    ) {
      throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
    }
    if (
      typeof row.min_count !== "number" ||
      !Number.isInteger(row.min_count) ||
      typeof row.max_count !== "number" ||
      !Number.isInteger(row.max_count) ||
      row.min_count < 0 ||
      row.max_count > MAX_ROUTES ||
      row.min_count > row.max_count
    ) {
      throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
    }
    try {
      new RegExp(row.path_pattern)
    } catch {
      throw new PublicRouteCheckError("scenarios document is invalid", "invalid_scenarios")
    }
    coverage.push({
      id: takeScenarioId(row.id, ids),
      class: row.class,
      path_pattern: row.path_pattern,
      min_count: row.min_count,
      max_count: row.max_count,
      required_markers: parseOptionalMarkers(row.required_markers),
      forbidden_markers: parseOptionalMarkers(row.forbidden_markers)
    })
  }
  return coverage
}

function getHtmlAttr(tag: string, name: string): string | null {
  const re = new RegExp(
    `\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i"
  )
  const match = tag.match(re)
  if (!match) return null
  return match[1] ?? match[2] ?? match[3] ?? null
}

function normalizePublicUrl(url: URL): string {
  let pathname = url.pathname || "/"
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1)
  }
  return `${url.origin}${pathname}`
}

function resolveCanonicalHref(
  href: string,
  origin: string,
  pathname: string
): { href?: string; failure?: RouteCheckFailure } {
  const pageUrl = pathname === "/" ? `${origin}/` : `${origin}${pathname}`
  let url: URL
  try {
    url = new URL(href, pageUrl)
  } catch {
    return { failure: { code: "canonical_invalid", pathname } }
  }
  if (url.protocol !== "https:" || url.origin !== origin) {
    return { failure: { code: "canonical_off_origin", pathname } }
  }
  if (url.username || url.password) {
    return { failure: { code: "canonical_invalid", pathname } }
  }
  if (url.search !== "" || url.hash !== "") {
    return { failure: { code: "canonical_mismatch", pathname } }
  }
  const normalized = normalizePublicUrl(url)
  const expected = normalizePublicUrl(new URL(pageUrl))
  if (normalized !== expected) {
    return {
      href: normalized,
      failure: { code: "canonical_mismatch", pathname }
    }
  }
  return { href: normalized }
}

type ProbedPage = {
  record: RouteRecord
  html: string | null
  htmlTooLarge: boolean
}

async function probeRoutePages(
  urls: string[],
  deps: { fetch: typeof fetch }
): Promise<ProbedPage[]> {
  return mapPool(urls, PROBE_CONCURRENCY, async target => {
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

    const url = new URL(target)
    const record: RouteRecord = {
      pathname: url.pathname,
      status: res.status,
      content_type: normalizeContentType(res.headers.get("content-type")),
      redirect: sanitizeRedirect(res.headers.get("location"), target),
      duration_ms: Math.max(0, Math.round(performance.now() - started))
    }

    const inspectable =
      record.status === 200 && isHtmlContentType(record.content_type)
    if (!inspectable) {
      await discardBody(res)
      return { record, html: null, htmlTooLarge: false }
    }

    try {
      const html = await readBoundedText(res, HTML_BODY_MAX_BYTES, "html")
      return { record, html, htmlTooLarge: false }
    } catch (err) {
      if (err instanceof PublicRouteCheckError && err.code === "html_too_large") {
        return { record, html: null, htmlTooLarge: true }
      }
      throw err
    }
  })
}

function evaluateRouteHealth(
  origin: string,
  pages: ProbedPage[],
  scenarios: RouteScenarios
): RouteCheckFailure[] {
  const failures: RouteCheckFailure[] = []
  const sitemapPathnames = new Set(pages.map(page => page.record.pathname))

  for (const series of scenarios.intended_active_series) {
    const pathname = `/series/${series.slug}`
    if (!sitemapPathnames.has(pathname)) {
      failures.push({ code: "missing_expected_series", pathname })
    }
  }
  for (const route of scenarios.routes) {
    if (!sitemapPathnames.has(route.pathname)) {
      failures.push({ code: "missing_expected_route", pathname: route.pathname })
    }
  }

  const compiledCoverage = scenarios.coverage.map(item => ({
    ...item,
    regex: new RegExp(item.path_pattern)
  }))
  for (const item of compiledCoverage) {
    const matches = [...sitemapPathnames].filter(pathname => item.regex.test(pathname))
    if (matches.length < item.min_count) {
      failures.push({ code: "guided_circuit_coverage" })
    }
    if (matches.length > item.max_count) {
      failures.push({ code: "guided_circuit_overflow" })
    }
  }

  const routeByPath = new Map(scenarios.routes.map(route => [route.pathname, route]))
  const canonicalOwner = new Map<string, string>()

  for (const page of pages) {
    const pathname = page.record.pathname
    if (page.record.status !== 200) {
      failures.push({ code: "unexpected_status", pathname })
      continue
    }
    if (!isHtmlContentType(page.record.content_type)) {
      failures.push({ code: "unexpected_content_type", pathname })
      continue
    }
    if (page.htmlTooLarge) {
      failures.push({ code: "html_too_large", pathname })
      continue
    }
    if (page.html === null) continue

    const route = routeByPath.get(pathname)
    const coverageHits = compiledCoverage.filter(item => item.regex.test(pathname))
    const required = [
      ...(route?.required_markers ?? []),
      ...coverageHits.flatMap(item => item.required_markers)
    ]
    const forbidden = [
      ...(route?.forbidden_markers ?? []),
      ...coverageHits.flatMap(item => item.forbidden_markers)
    ]
    const inspected = inspectHtmlDocument(page.html, {
      pathname,
      origin,
      errorShellMarkers: scenarios.error_shell_markers,
      requiredMarkers: required,
      forbiddenMarkers: forbidden
    })
    failures.push(...inspected.failures)
    for (const canonical of inspected.canonicals) {
      const owner = canonicalOwner.get(canonical)
      if (owner && owner !== pathname) {
        failures.push({ code: "canonical_collision", pathname })
        if (!failures.some(item => item.code === "canonical_collision" && item.pathname === owner)) {
          failures.push({ code: "canonical_collision", pathname: owner })
        }
      } else {
        canonicalOwner.set(canonical, pathname)
      }
    }
  }

  return sortFailures(dedupeFailures(failures))
}

function dedupeFailures(failures: RouteCheckFailure[]): RouteCheckFailure[] {
  const seen = new Set<string>()
  const unique: RouteCheckFailure[] = []
  for (const failure of failures) {
    const key = `${failure.code}\0${failure.pathname ?? ""}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(failure)
  }
  return unique
}

function sortFailures(failures: RouteCheckFailure[]): RouteCheckFailure[] {
  return [...failures].sort((left, right) => {
    if (left.code !== right.code) return left.code.localeCompare(right.code)
    return (left.pathname ?? "").localeCompare(right.pathname ?? "")
  })
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

function isHtmlContentType(media: string | null): boolean {
  return media === "text/html" || media === "application/xhtml+xml"
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
  maxBytes: number,
  kind: "sitemap" | "html" = "sitemap"
): Promise<string> {
  const tooLargeCode = kind === "html" ? "html_too_large" : "sitemap_too_large"
  const emptyCode = kind === "html" ? "html_malformed" : "sitemap_malformed"
  const networkCode = kind === "html" ? "probe_network" : "sitemap_network"
  const malformedCode = kind === "html" ? "html_malformed" : "sitemap_malformed"
  const label = kind === "html" ? "html body" : "sitemap"

  const declared = Number(res.headers.get("content-length"))
  if (Number.isFinite(declared) && declared > maxBytes) {
    await discardBody(res)
    throw new PublicRouteCheckError(
      `${label} exceeds ${maxBytes} byte cap`,
      tooLargeCode
    )
  }

  if (!res.body) {
    throw new PublicRouteCheckError(`empty ${label}`, emptyCode)
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
          `${label} exceeds ${maxBytes} byte cap`,
          tooLargeCode
        )
      }
      chunks.push(value)
    }
  } catch (err) {
    if (err instanceof PublicRouteCheckError) throw err
    throw new PublicRouteCheckError(`failed to read ${label}`, networkCode)
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
    throw new PublicRouteCheckError(`${label} is not valid UTF-8`, malformedCode)
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
  now: Date,
  failures: RouteCheckFailure[] = []
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
    routes,
    failures
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
