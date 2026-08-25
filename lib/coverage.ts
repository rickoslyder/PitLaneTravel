/*
<ai_context>
Pure derived coverage-tier calculation. Tier is never stored or accepted as an
admin override. Callers pass evidence records plus an explicit asOf instant.
</ai_context>
*/

export const COVERAGE_EVIDENCE_KINDS = [
  "calendar",
  "logistics",
  "decision_guide",
  "live_offer",
  "personalized_plan"
] as const

export type CoverageEvidenceKind = (typeof COVERAGE_EVIDENCE_KINDS)[number]

export const COVERAGE_KIND_ATTRIBUTE_FLAGS = {
  calendar: {
    officialSource: true,
    datesVerified: true,
    statusVerified: true
  },
  logistics: {
    primaryOrLocalSources: true,
    accessVerified: true,
    stayGuidanceVerified: true
  },
  decision_guide: {
    structuredGuide: true,
    citationsPresent: true,
    confidenceAssessed: true,
    qaPassed: true
  },
  live_offer: {
    inventoryAvailable: true,
    taggedLink: true,
    attributionConfigured: true
  },
  personalized_plan: {
    completeInputs: true,
    sourceBackedRecommendations: true,
    handoffsTracked: true
  }
} as const

export const COVERAGE_KIND_DIAGNOSTIC_PRECEDENCE = [
  "current",
  "expired",
  "not_yet_valid",
  "unverified",
  "revoked",
  "incomplete",
  "missing"
] as const

export type CoverageKindDiagnostic =
  (typeof COVERAGE_KIND_DIAGNOSTIC_PRECEDENCE)[number]

export type CoverageTier = 0 | 1 | 2 | 3 | 4

export type CoverageDerivation = {
  tier: CoverageTier | null
  kinds: Record<CoverageEvidenceKind, CoverageKindDiagnostic>
  firstLimitingKind: CoverageEvidenceKind | null
  freshUntil: Date | null
}

const KIND_SET = new Set<string>(COVERAGE_EVIDENCE_KINDS)

const DIAGNOSTIC_RANK: Record<CoverageKindDiagnostic, number> = {
  current: 0,
  expired: 1,
  not_yet_valid: 2,
  unverified: 3,
  revoked: 4,
  incomplete: 5,
  missing: 6
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime())
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isAbsoluteHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false
  try {
    const url = new URL(value)
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname.length > 0
    )
  } catch {
    return false
  }
}

function emptyKinds(): Record<CoverageEvidenceKind, CoverageKindDiagnostic> {
  return {
    calendar: "missing",
    logistics: "missing",
    decision_guide: "missing",
    live_offer: "missing",
    personalized_plan: "missing"
  }
}

function emptyResult(): CoverageDerivation {
  return {
    tier: null,
    kinds: emptyKinds(),
    firstLimitingKind: "calendar",
    freshUntil: null
  }
}

type DiagnosedRecord = {
  kind: CoverageEvidenceKind
  diagnostic: CoverageKindDiagnostic
  expiresAtMs: number | null
}

function diagnoseRecord(record: unknown, asOfMs: number): DiagnosedRecord | null {
  if (!isPlainObject(record)) return null
  if (typeof record.kind !== "string" || !KIND_SET.has(record.kind)) return null

  const kind = record.kind as CoverageEvidenceKind
  const incomplete = (): DiagnosedRecord => ({
    kind,
    diagnostic: "incomplete",
    expiresAtMs: null
  })

  if (!isValidDate(record.verifiedAt) || !isValidDate(record.expiresAt)) {
    return incomplete()
  }
  if (record.expiresAt.getTime() <= record.verifiedAt.getTime()) {
    return incomplete()
  }
  if (typeof record.sourceLabel !== "string" || record.sourceLabel.trim() === "") {
    return incomplete()
  }
  if (!isAbsoluteHttpUrl(record.sourceUrl)) {
    return incomplete()
  }
  if (!isPlainObject(record.attributes)) {
    return incomplete()
  }

  const required = COVERAGE_KIND_ATTRIBUTE_FLAGS[kind]
  for (const flag of Object.keys(required) as Array<keyof typeof required>) {
    if (record.attributes[flag] !== true) return incomplete()
  }

  if (record.revokedAt != null) {
    if (!isValidDate(record.revokedAt)) return incomplete()
    return { kind, diagnostic: "revoked", expiresAtMs: record.expiresAt.getTime() }
  }

  if (record.reviewState !== "verified") {
    if (record.reviewState === "pending" || record.reviewState === "rejected") {
      return {
        kind,
        diagnostic: "unverified",
        expiresAtMs: record.expiresAt.getTime()
      }
    }
    return incomplete()
  }

  if (record.verifiedAt.getTime() > asOfMs) {
    return {
      kind,
      diagnostic: "not_yet_valid",
      expiresAtMs: record.expiresAt.getTime()
    }
  }
  if (record.expiresAt.getTime() <= asOfMs) {
    return { kind, diagnostic: "expired", expiresAtMs: record.expiresAt.getTime() }
  }

  return { kind, diagnostic: "current", expiresAtMs: record.expiresAt.getTime() }
}

export function deriveCoverage(
  evidence: readonly unknown[],
  asOf: Date
): CoverageDerivation {
  if (!isValidDate(asOf)) {
    throw new Error("Invalid asOf")
  }

  if (!Array.isArray(evidence)) {
    return emptyResult()
  }

  const kinds = emptyKinds()
  const currentExpiryByKind: Partial<Record<CoverageEvidenceKind, number>> = {}
  const asOfMs = asOf.getTime()

  for (const record of evidence) {
    const diagnosed = diagnoseRecord(record, asOfMs)
    if (!diagnosed) continue

    if (DIAGNOSTIC_RANK[diagnosed.diagnostic] < DIAGNOSTIC_RANK[kinds[diagnosed.kind]]) {
      kinds[diagnosed.kind] = diagnosed.diagnostic
    }

    if (diagnosed.diagnostic === "current" && diagnosed.expiresAtMs != null) {
      const previous = currentExpiryByKind[diagnosed.kind]
      if (previous == null || diagnosed.expiresAtMs > previous) {
        currentExpiryByKind[diagnosed.kind] = diagnosed.expiresAtMs
      }
    }
  }

  let tier: CoverageTier | null = null
  let firstLimitingKind: CoverageEvidenceKind | null = null
  const chainExpiries: number[] = []

  for (const [index, kind] of COVERAGE_EVIDENCE_KINDS.entries()) {
    if (kinds[kind] === "current") {
      tier = index as CoverageTier
      const expiry = currentExpiryByKind[kind]
      if (expiry != null) chainExpiries.push(expiry)
      continue
    }
    firstLimitingKind = kind
    break
  }

  return {
    tier,
    kinds,
    firstLimitingKind,
    freshUntil:
      chainExpiries.length > 0 ? new Date(Math.min(...chainExpiries)) : null
  }
}
