/*
<ai_context>
Public coverage projection. Tier is always deriveCoverage output. This module never
exposes evidence rows, source URLs, source labels, attributes, or review internals.
</ai_context>
*/

import {
  deriveCoverage,
  type CoverageKindDiagnostic,
  type CoverageTier
} from "./coverage"

export type PublicCoverageSummary = {
  raceId: string
  tier: CoverageTier | null
  liveOfferState: CoverageKindDiagnostic
  freshUntil: string | null
  /** ISO instant the summary was derived against. Same asOf for every row. */
  derivedAt: string
}

function toIso(value: Date | null): string | null {
  if (value == null) return null
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) return null
  return value.toISOString()
}

export function toPublicCoverageSummary(
  raceId: string,
  evidence: readonly unknown[],
  asOf: Date
): PublicCoverageSummary {
  const derived = deriveCoverage(evidence, asOf)
  return {
    raceId,
    tier: derived.tier,
    liveOfferState: derived.kinds.live_offer,
    freshUntil: toIso(derived.freshUntil),
    derivedAt: asOf.toISOString()
  }
}

export function buildPublicCoverageSummaries(
  raceIds: readonly string[],
  evidence: readonly unknown[],
  asOf: Date
): PublicCoverageSummary[] {
  const grouped = new Map<string, unknown[]>()

  for (const record of evidence) {
    if (typeof record !== "object" || record == null || !("raceId" in record)) {
      continue
    }
    const raceId = (record as { raceId?: unknown }).raceId
    if (typeof raceId !== "string") continue
    const bucket = grouped.get(raceId)
    if (bucket) bucket.push(record)
    else grouped.set(raceId, [record])
  }

  const seen = new Set<string>()
  const summaries: PublicCoverageSummary[] = []
  for (const raceId of raceIds) {
    if (seen.has(raceId)) continue
    seen.add(raceId)
    summaries.push(
      toPublicCoverageSummary(raceId, grouped.get(raceId) ?? [], asOf)
    )
  }
  return summaries
}

export function coverageByRaceId(
  summaries: readonly PublicCoverageSummary[]
): Record<string, PublicCoverageSummary> {
  const map: Record<string, PublicCoverageSummary> = {}
  for (const summary of summaries) {
    map[summary.raceId] = summary
  }
  return map
}

export function coverageDepthLabel(tier: CoverageTier | null): string {
  switch (tier) {
    case null:
      return "No verified coverage"
    case 0:
      return "Calendar only"
    case 1:
      return "Logistics"
    case 2:
      return "Decision guide"
    case 3:
      return "Live offers"
    case 4:
      return "Personalized plan"
  }
}

export function offerAvailabilityLabel(
  state: CoverageKindDiagnostic
): string {
  return state === "current" ? "Current offers" : "No current offers"
}

export function formatCoverageUtc(value: string | null): string | null {
  if (value == null) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 16)} UTC`
}

export function hasCurrentChainFreshness(
  freshUntil: string | null,
  derivedAt: string
): boolean {
  if (freshUntil == null) return false
  const until = Date.parse(freshUntil)
  const asOf = Date.parse(derivedAt)
  return Number.isFinite(until) && Number.isFinite(asOf) && until > asOf
}
