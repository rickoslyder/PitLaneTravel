export const ANALYTICS_SCHEMA_VERSION = 1 as const

export type AnalyticsSchemaVersion = typeof ANALYTICS_SCHEMA_VERSION

export const DOMAIN_EVENT_NAMES = [
  "page viewed",
  "hero calendar CTA clicked",
  "hero compare CTA clicked",
  "race viewed",
  "trip created",
  "trip viewed",
  "flight offer selected",
  "flight checkout begun",
  "flight payment info submitted",
  "flight purchase completed"
] as const

export type DomainEventName = (typeof DOMAIN_EVENT_NAMES)[number]

export type NameOnlyEventName = Exclude<DomainEventName, "page viewed">

export const ROUTE_GROUPS = [
  "/",
  "/races",
  "/races/:slug",
  "/series/:slug",
  "/trips",
  "/trips/:id",
  "/flights",
  "/packages",
  "other"
] as const

export type RouteGroup = (typeof ROUTE_GROUPS)[number]

export type PageViewedInput = {
  event: "page viewed"
  pathname: string
}

export type NameOnlyEventInput = {
  event: NameOnlyEventName
}

export type AnalyticsEventInput = PageViewedInput | NameOnlyEventInput

export type PageViewedProperties = {
  route: RouteGroup
  schema_version: AnalyticsSchemaVersion
}

export type NameOnlyEventProperties = {
  schema_version: AnalyticsSchemaVersion
}

export type SanitizeSuccess =
  | {
      ok: true
      event: "page viewed"
      properties: PageViewedProperties
    }
  | {
      ok: true
      event: NameOnlyEventName
      properties: NameOnlyEventProperties
    }

export type SanitizeFailure = {
  ok: false
  reason: "invalid-event"
}

export type SanitizeResult = SanitizeSuccess | SanitizeFailure

const MAX_PATHNAME_LENGTH = 2048

const NAME_ONLY_EVENTS = new Set<string>(
  DOMAIN_EVENT_NAMES.filter(name => name !== "page viewed")
)

// Privacy boundary:
// - unknown event names are rejected
// - unknown keys on a known event are stripped (output is built from allowlisted fields)
// - invalid allowlisted field values are rejected
// Never spread caller input. schema_version is injected and not caller-overridable.

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false
  }
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

export function classifyRoute(pathname: string): RouteGroup {
  const withoutQueryHash = pathname.split(/[?#]/, 1)[0] ?? ""
  const trimmed =
    withoutQueryHash.length > 1 && withoutQueryHash.endsWith("/")
      ? withoutQueryHash.slice(0, -1)
      : withoutQueryHash

  if (trimmed === "/") return "/"
  if (trimmed === "/races") return "/races"
  if (trimmed === "/trips") return "/trips"
  if (trimmed === "/flights") return "/flights"
  if (trimmed === "/packages") return "/packages"

  if (/^\/races\/[^/]+$/.test(trimmed)) return "/races/:slug"
  if (/^\/series\/[^/]+$/.test(trimmed)) return "/series/:slug"
  if (/^\/trips\/[^/]+$/.test(trimmed)) return "/trips/:id"

  return "other"
}

export function sanitizeAnalyticsEvent(input: unknown): SanitizeResult {
  if (!isPlainObject(input)) {
    return { ok: false, reason: "invalid-event" }
  }

  const event = Object.hasOwn(input, "event") ? input.event : undefined

  if (event === "page viewed") {
    const pathname = Object.hasOwn(input, "pathname") ? input.pathname : undefined
    if (typeof pathname !== "string" || pathname.length === 0) {
      return { ok: false, reason: "invalid-event" }
    }
    if (pathname.length > MAX_PATHNAME_LENGTH) {
      return { ok: false, reason: "invalid-event" }
    }
    return {
      ok: true,
      event: "page viewed",
      properties: {
        route: classifyRoute(pathname),
        schema_version: ANALYTICS_SCHEMA_VERSION
      }
    }
  }

  if (typeof event === "string" && NAME_ONLY_EVENTS.has(event)) {
    return {
      ok: true,
      event: event as NameOnlyEventName,
      properties: {
        schema_version: ANALYTICS_SCHEMA_VERSION
      }
    }
  }

  return { ok: false, reason: "invalid-event" }
}
