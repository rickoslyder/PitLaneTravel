/*
<ai_context>
Provider-neutral price-source adapter contract and collection runner. This is
the source-adapter layer only: it validates adapter descriptors (source policy
ladder admission), invokes an adapter's collect boundary at most once per run,
validates raw candidates against the ticket-price observation contract, and
persists attempts through an injected sink. It never fetches, logs, schedules,
retries, or connects to a database itself — cadence, backoff, and circuit
breakers belong to a future scheduler layer. No concrete P1 adapter exists here
while its feeds and permission response remain unresolved.
</ai_context>
*/

import { z } from "zod"
import {
  ticketPriceObservationSchema,
  type ObservationAttempt,
  type ObservationFailureReason,
  type TicketPriceObservation
} from "@/lib/ticket-price-observation"

// Local exact mirrors of the enums in lib/ticket-price-observation (not
// exported there), matching the local-mirror pattern used by
// actions/db/ticket-price-observation-persistence.ts.
const SOURCE_METHODS = [
  "api",
  "feed",
  "official_page",
  "authenticated_portal"
] as const

const AUTHORISATION_TIERS = [
  "official",
  "authorised_reseller",
  "bonded_package_operator",
  "unverified_secondary"
] as const

const stableIdentifier = z
  .string()
  .min(1)
  .refine(value => value === value.trim(), {
    message: "Identifier must not have surrounding whitespace"
  })

// Every URL refinement must go through tryParseUrl. zod's .url() rejects some
// edge strings (e.g. embedded NUL) for which a bare new URL would throw out of
// safeParse as a raw TypeError, leaking the input and bypassing the closed,
// structured descriptor-error path. No refinement may call new URL unguarded.
function tryParseUrl(value: string): URL | null {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

// ASCII control characters (NUL, C0 controls, DEL) are never valid in a
// persisted URL. The WHATWG URL parser silently accepts some of them (e.g.
// an embedded NUL in a path) and zod's .url() follows suit, so they must be
// rejected explicitly: safe URL validation must never admit them, and no
// control character may ever reach the sink verbatim.
const ASCII_CONTROL_CHARACTER = /[\x00-\x1F\x7F]/
function hasControlCharacters(value: string): boolean {
  return ASCII_CONTROL_CHARACTER.test(value)
}

const httpsUrl = z
  .string()
  .url()
  .refine(value => !hasControlCharacters(value), {
    message: "URL must not contain ASCII control characters"
  })
  .refine(value => tryParseUrl(value)?.protocol === "https:", {
    message: "URL must be HTTPS"
  })

// Documentary evidence deep links may legitimately carry a query string or
// fragment, but credentials never: failed attempts persist URLs verbatim, so
// userinfo is rejected outright here rather than stripped downstream.
const evidenceUrl = httpsUrl.refine(
  value => {
    const url = tryParseUrl(value)
    return url !== null && url.username === "" && url.password === ""
  },
  { message: "evidenceUrl must not include a username or password" }
)

// Persisted source references are public canonical URLs: no credentials, no
// query string, no fragment, and the exact canonical form — the WHATWG parser
// silently rewrites mixed-case scheme/host, explicit default ports,
// dot-segments, and trailing empty ?/#, so canonicality additionally requires
// new URL(value).href === value. A concrete adapter may privately fetch a
// credentialed URL inside its own closure, but the descriptor and candidate
// URLs that reach the sink must be the public canonical form. Reject
// outright — never strip components.
const canonicalSourceUrl = httpsUrl.refine(
  value => {
    const url = tryParseUrl(value)
    return (
      url !== null &&
      url.username === "" &&
      url.password === "" &&
      url.search === "" &&
      url.hash === "" &&
      url.href === value &&
      // A trailing empty ?/# is preserved verbatim in href while search/hash
      // stay empty, so exact canonicality must also forbid the delimiters.
      !value.includes("?") &&
      !value.includes("#")
    )
  },
  {
    message:
      "sourceUrl must be a public canonical URL without credentials, query string, or fragment"
  }
)

// Exact hostnames only: lowercase DNS names with no wildcards, protocol,
// path, port, or credentials. Host allowlists are an admission-control
// boundary, so anything broader than an exact hostname is rejected.
const exactHostname = z
  .string()
  .min(1)
  .max(253)
  .refine(value => value === value.trim(), {
    message: "Hostname must not have surrounding whitespace"
  })
  .refine(value => value === value.toLowerCase(), {
    message: "Hostname must be lowercase"
  })
  .refine(value => !value.includes("*"), {
    message: "Wildcards are not allowed in hostnames"
  })
  .refine(
    value =>
      !value.includes("://") &&
      !value.includes("/") &&
      !value.includes(":") &&
      !value.includes("@"),
    {
      message:
        "Hostname must not include a protocol, path, port, or credentials"
    }
  )
  .refine(
    value =>
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/.test(
        value
      ),
    { message: "Hostname must be a valid DNS hostname" }
  )

const checkedAt = z
  .string()
  .datetime({ offset: true })
  .transform(value => new Date(value))

export const priceSourceAdmissionSchema = z.object({
  state: z.enum(["admitted", "not_admitted"]),
  evidenceUrl,
  checkedAt
})

export const priceSourceDescriptorSchema = z
  .object({
    providerId: stableIdentifier,
    sourceUrl: canonicalSourceUrl,
    allowedHostnames: z
      .array(exactHostname)
      .min(1)
      .refine(list => new Set(list).size === list.length, {
        message: "allowedHostnames must not contain duplicates"
      }),
    sourceMethod: z.enum(SOURCE_METHODS),
    authorisationTier: z.enum(AUTHORISATION_TIERS),
    admission: priceSourceAdmissionSchema
  })
  .superRefine((descriptor, ctx) => {
    // Guarded: if sourceUrl already failed schema validation, skip rather
    // than risk a raw new URL throw escaping safeParse.
    const sourceUrl = tryParseUrl(descriptor.sourceUrl)
    if (
      sourceUrl &&
      !descriptor.allowedHostnames.includes(sourceUrl.hostname)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sourceUrl"],
        message: "sourceUrl hostname must be included in allowedHostnames"
      })
    }
    if (
      descriptor.authorisationTier === "unverified_secondary" &&
      descriptor.admission.state === "admitted"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["admission"],
        message: "unverified_secondary sources cannot be admitted"
      })
    }
  })

export type PriceSourceDescriptor = Readonly<
  z.infer<typeof priceSourceDescriptorSchema>
>

// Safe collection-failure taxonomy. Adapters signal a known failure class by
// throwing AdapterCollectionError; anything else the runner records as
// "unknown" and never leaks the original error message. Local mirror of the
// OBSERVATION_FAILURE_REASONS enum in lib/ticket-price-observation (not
// exported there).
const OBSERVATION_FAILURE_REASONS = [
  "auth",
  "rate_limited",
  "unavailable",
  "invalid_payload",
  "network",
  "unknown"
] as const

const failureReasonSchema = z.enum(OBSERVATION_FAILURE_REASONS)

export class AdapterCollectionError extends Error {
  readonly reason: ObservationFailureReason

  constructor(reason: ObservationFailureReason, message?: string) {
    // Runtime guard: an arbitrary cast or runtime string must never reach
    // the sink as a failureReason. Throws a structured validation error with
    // a static message — the rejected value is deliberately not echoed.
    if (!failureReasonSchema.safeParse(reason).success) {
      throw new Error(
        `AdapterCollectionError reason must be one of: ${OBSERVATION_FAILURE_REASONS.join(", ")}`
      )
    }
    super(message)
    this.name = "AdapterCollectionError"
    this.reason = reason
  }
}

// Immutable collection request/context. The runner passes it through to the
// adapter unchanged; the adapter owns all source-specific interpretation.
export type PriceSourceCollectContext = Readonly<Record<string, unknown>>

export interface PriceSourceAdapter {
  // Declared as unknown on purpose: the runner is the trust boundary and
  // validates the descriptor against priceSourceDescriptorSchema before any
  // collection or persistence happens.
  readonly descriptor: unknown
  collect(
    request: PriceSourceCollectContext,
    signal: AbortSignal
  ): Promise<unknown[]>
}

// Injected persistence boundary. Semantics match
// actions/db/ticket-price-observation-persistence.ts: an observed attempt
// carries a validated observation, a failed attempt carries only provider,
// source URL, attempted-at, and a safe failure reason. The runner does not
// know or care whether the sink is a database.
export interface ObservationAttemptSink {
  persist(attempt: ObservationAttempt): Promise<unknown>
}

export interface RunPriceSourceCollectionOptions {
  request: PriceSourceCollectContext
  sink: ObservationAttemptSink
  signal?: AbortSignal
  now?: () => Date
}

export interface PriceSourceCollectionResult {
  // "refused": admission gate stopped the run before collect or the sink.
  // "failed": collect threw or returned a non-array; exactly one failed
  //   attempt was persisted and no candidates were processed.
  // "collected": collect returned an array; every candidate was validated
  //   and each attempt was persisted (observed or invalid_payload).
  readonly status: "refused" | "collected" | "failed"
  readonly providerId: string
  readonly candidates: number
  readonly persisted: number
  readonly failed: number
  readonly attempts: readonly ObservationAttempt[]
}

// Deep-freeze a structured-cloneable value graph. Used to prove at runtime
// that adapters cannot mutate the collection request.
function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const key of Object.keys(value)) {
      deepFreeze((value as Record<string, unknown>)[key])
    }
    Object.freeze(value)
  }
  return value
}

// Request validation boundary. Before structuredClone, options.request must
// be an acyclic plain JSON-like record: the root is a non-array object; root
// and nested objects have Object.prototype or a null prototype; arrays are
// allowed; leaves are limited to null, string, boolean, and finite number.
// Exotic objects (Date, Map, Set, RegExp, typed arrays, ArrayBuffer),
// bigint, undefined, functions, symbols, NaN/Infinity, custom prototypes,
// cycles, accessor properties, symbol-keyed properties, sparse arrays, and
// non-index array properties are all rejected. Validation never invokes user
// code — accessors are detected from their property descriptor, never read —
// and every rejection throws the same static non-leaking error before
// collect or the sink run.
const REQUEST_VALIDATION_MESSAGE =
  "Price source collection request must be a plain JSON-like object"

function invalidRequest(): never {
  throw new Error(REQUEST_VALIDATION_MESSAGE)
}

function isArrayIndex(key: string): boolean {
  if (!/^\d+$/.test(key)) {
    return false
  }
  const index = Number(key)
  return Number.isSafeInteger(index) && index < 2 ** 32 - 1
}

function validateRequestValue(value: unknown, ancestors: Set<object>): void {
  if (value === null) {
    return
  }
  const kind = typeof value
  if (kind === "string" || kind === "boolean") {
    return
  }
  if (kind === "number") {
    if (!Number.isFinite(value)) {
      invalidRequest()
    }
    return
  }
  if (kind !== "object") {
    // undefined, function, symbol, bigint
    invalidRequest()
  }
  const object = value as object
  if (ancestors.has(object)) {
    invalidRequest()
  }
  const isArray = Array.isArray(object)
  const prototype = Object.getPrototypeOf(object)
  if (
    isArray
      ? prototype !== Array.prototype && prototype !== null
      : prototype !== Object.prototype && prototype !== null
  ) {
    invalidRequest()
  }
  ancestors.add(object)
  try {
    if (Object.getOwnPropertySymbols(object).length > 0) {
      invalidRequest()
    }
    for (const key of Object.getOwnPropertyNames(object)) {
      const descriptor = Object.getOwnPropertyDescriptor(object, key)
      // Accessors are rejected from the descriptor alone; the getter or
      // setter is never invoked.
      if (descriptor === undefined || !("value" in descriptor)) {
        invalidRequest()
      }
      if (isArray) {
        if (key === "length") {
          continue
        }
        // Arrays carry index properties only — a named property is not
        // JSON-like and would silently survive a structuredClone.
        if (!isArrayIndex(key)) {
          invalidRequest()
        }
      }
      if (descriptor.enumerable === true) {
        validateRequestValue(descriptor.value, ancestors)
      }
    }
    if (
      isArray &&
      Object.keys(object).length !== (object as unknown[]).length
    ) {
      // A hole is not JSON-like: sparse arrays are rejected outright.
      invalidRequest()
    }
  } finally {
    // Track the current path only: a shared acyclic reference (diamond)
    // remains valid, matching structuredClone semantics.
    ancestors.delete(object)
  }
}

function validateRequest(request: unknown): void {
  // The request must be a record at the root — not an array or a scalar.
  if (request === null || typeof request !== "object") {
    invalidRequest()
  }
  if (Array.isArray(request)) {
    invalidRequest()
  }
  validateRequestValue(request, new Set())
}

function validateCandidate(
  candidate: unknown,
  descriptor: PriceSourceDescriptor
): TicketPriceObservation | null {
  // The observation schema's URL refinement can throw (not just fail) on
  // edge strings such as embedded NUL. That must never escape past the
  // invalid_payload path — a throw here would crash the run mid-loop after
  // earlier attempts were already persisted.
  let parsed: ReturnType<typeof ticketPriceObservationSchema.safeParse>
  try {
    parsed = ticketPriceObservationSchema.safeParse(candidate)
  } catch {
    return null
  }
  if (!parsed.success) {
    return null
  }
  const observation = parsed.data
  if (
    observation.provider !== descriptor.providerId ||
    observation.sourceMethod !== descriptor.sourceMethod ||
    observation.authorisationTier !== descriptor.authorisationTier
  ) {
    return null
  }
  // Persisted observation URLs must be public canonical references, matching
  // the descriptor rule: no control characters, credentials, query string, or
  // fragment, and the exact canonical form (url.href === sourceUrl) so parser
  // rewrites such as case, default ports, dot-segments, or trailing empty ?/#
  // are rejected rather than normalized. A concrete adapter may fetch a
  // credentialed URL privately in its closure, but it must emit only the
  // public canonical URL. Reject outright —
  // the raw candidate URL is never recorded or returned.
  const url = tryParseUrl(observation.sourceUrl)
  if (
    !url ||
    hasControlCharacters(observation.sourceUrl) ||
    url.username !== "" ||
    url.password !== "" ||
    url.search !== "" ||
    url.hash !== "" ||
    url.href !== observation.sourceUrl ||
    // A trailing empty ?/# survives in href with empty search/hash, so the
    // delimiters themselves must be forbidden for exact canonicality.
    observation.sourceUrl.includes("?") ||
    observation.sourceUrl.includes("#")
  ) {
    return null
  }
  if (!descriptor.allowedHostnames.includes(url.hostname)) {
    return null
  }
  return observation
}

export async function runPriceSourceCollection(
  adapter: PriceSourceAdapter,
  options: RunPriceSourceCollectionOptions
): Promise<PriceSourceCollectionResult> {
  // Fail closed: an invalid descriptor never reaches collect or the sink.
  const descriptor = priceSourceDescriptorSchema.parse(adapter.descriptor)

  if (descriptor.admission.state !== "admitted") {
    return {
      status: "refused",
      providerId: descriptor.providerId,
      candidates: 0,
      persisted: 0,
      failed: 0,
      attempts: []
    }
  }

  const now = options.now ?? (() => new Date())
  const signal = options.signal ?? new AbortController().signal
  const attempts: ObservationAttempt[] = []

  // Request immutability is proven at runtime: the adapter receives a
  // deep-frozen structured clone, never the caller-owned object. The request
  // is first validated as an acyclic plain JSON-like record (no exotic
  // objects, accessors, symbol keys, non-finite numbers, cycles, or sparse /
  // augmented arrays); any rejection fails closed here — before collect or
  // the sink — with one static error that never carries raw request values.
  validateRequest(options.request)
  let frozenRequest: PriceSourceCollectContext
  try {
    frozenRequest = deepFreeze(structuredClone(options.request))
  } catch {
    // A validated JSON-like graph always clones; this is a fail-closed
    // backstop if a host structuredClone ever rejects anyway.
    throw new Error(REQUEST_VALIDATION_MESSAGE)
  }

  let candidates: unknown[]
  try {
    const collected = await adapter.collect(frozenRequest, signal)
    if (!Array.isArray(collected)) {
      throw new AdapterCollectionError(
        "unknown",
        "collect must return an array of candidate observations"
      )
    }
    candidates = collected
  } catch (error) {
    const reason =
      error instanceof AdapterCollectionError ? error.reason : "unknown"
    const attempt: ObservationAttempt = {
      status: "failed",
      provider: descriptor.providerId,
      sourceUrl: descriptor.sourceUrl,
      attemptedAt: now(),
      failureReason: reason
    }
    // Sink failure propagates: never report a failed attempt as persisted
    // when persistence itself failed.
    await options.sink.persist(attempt)
    attempts.push(attempt)
    return {
      // A collection throw or non-array return is never "collected".
      status: "failed",
      providerId: descriptor.providerId,
      candidates: 0,
      persisted: 0,
      failed: 1,
      attempts
    }
  }

  let persisted = 0
  let failed = 0
  // Known residual: persistence is append-only per attempt, NOT batch-atomic.
  // If a sink call fails mid-loop, earlier attempts remain committed and the
  // sink error propagates; callers must not assume all-or-nothing semantics.
  for (const candidate of candidates) {
    const observation = validateCandidate(candidate, descriptor)
    if (observation) {
      const attempt: ObservationAttempt = { status: "observed", observation }
      await options.sink.persist(attempt)
      attempts.push(attempt)
      persisted += 1
    } else {
      // Failed invalid_payload attempts carry descriptor identity only — the
      // raw candidate payload is never recorded or returned.
      const attempt: ObservationAttempt = {
        status: "failed",
        provider: descriptor.providerId,
        sourceUrl: descriptor.sourceUrl,
        attemptedAt: now(),
        failureReason: "invalid_payload"
      }
      await options.sink.persist(attempt)
      attempts.push(attempt)
      failed += 1
    }
  }

  return {
    status: "collected",
    providerId: descriptor.providerId,
    candidates: candidates.length,
    persisted,
    failed,
    attempts
  }
}
