/*
<ai_context>
Admin coverage-matrix read model. Tier is derived via PLT-013, never stored or trusted
as an integer column. requireAdmin runs before any database access.
</ai_context>
*/

import { db } from "@/db/db"
import {
  circuitsTable,
  coverageEvidenceTable,
  racesTable,
  seriesTable
} from "@/db/schema"
import {
  deriveCoverage,
  type CoverageDerivation,
  type CoverageEvidenceKind,
  type CoverageKindDiagnostic,
  type CoverageTier
} from "@/lib/coverage"
import { AuthError, requireAdmin } from "@/lib/auth"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"

export type CoverageInventoryState = CoverageKindDiagnostic

export type CoverageMatrixRow = {
  raceId: string
  raceName: string
  raceSlug: string | null
  raceDate: string
  seriesName: string | null
  seriesShortName: string | null
  circuitName: string | null
  tier: CoverageTier | null
  kinds: Record<CoverageEvidenceKind, CoverageKindDiagnostic>
  firstLimitingKind: CoverageEvidenceKind | null
  freshUntil: string | null
  inventoryState: CoverageInventoryState
  inventoryLabel: string
  nextAction: string
}

export type CoverageRaceRecord = {
  id: string
  name: string
  slug: string | null
  date: Date
  seriesName: string | null
  seriesShortName: string | null
  circuitName: string | null
}

const KIND_ACTION_LABEL: Record<CoverageEvidenceKind, string> = {
  calendar: "calendar",
  logistics: "logistics",
  decision_guide: "decision-guide",
  live_offer: "live-offer",
  personalized_plan: "personalized-plan"
}

function toIso(value: Date | null): string | null {
  if (value == null) return null
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) return null
  return value.toISOString()
}

function inventoryFromLiveOffer(diagnostic: CoverageKindDiagnostic): {
  inventoryState: CoverageInventoryState
  inventoryLabel: string
} {
  switch (diagnostic) {
    case "current":
      return { inventoryState: "current", inventoryLabel: "Current inventory" }
    case "expired":
      return { inventoryState: "expired", inventoryLabel: "Offers expired" }
    case "missing":
      return { inventoryState: "missing", inventoryLabel: "No current offers" }
    case "incomplete":
      return {
        inventoryState: "incomplete",
        inventoryLabel: "Incomplete live-offer evidence"
      }
    case "unverified":
      return {
        inventoryState: "unverified",
        inventoryLabel: "Unverified live-offer evidence"
      }
    case "not_yet_valid":
      return {
        inventoryState: "not_yet_valid",
        inventoryLabel: "Not-yet-valid live-offer evidence"
      }
    case "revoked":
      return {
        inventoryState: "revoked",
        inventoryLabel: "Revoked live-offer evidence"
      }
  }
}

function nextActionFromDerivation(derivation: CoverageDerivation): string {
  if (derivation.tier === 4 || derivation.firstLimitingKind == null) {
    return "Maintain/refresh coverage"
  }

  const kindLabel = KIND_ACTION_LABEL[derivation.firstLimitingKind]
  switch (derivation.kinds[derivation.firstLimitingKind]) {
    case "missing":
      return `Add missing ${kindLabel} evidence`
    case "expired":
      return `Refresh expired ${kindLabel} evidence`
    case "unverified":
      return `Review unverified ${kindLabel} evidence`
    case "incomplete":
      return `Complete incomplete ${kindLabel} evidence`
    case "revoked":
      return `Replace revoked ${kindLabel} evidence`
    case "not_yet_valid":
      return `Wait for not-yet-valid ${kindLabel} evidence`
    case "current":
      return "Maintain/refresh coverage"
  }
}

function compareRows(a: CoverageMatrixRow, b: CoverageMatrixRow): number {
  if (a.raceDate !== b.raceDate) return a.raceDate < b.raceDate ? -1 : 1
  if (a.raceName !== b.raceName) return a.raceName < b.raceName ? -1 : 1
  if (a.raceId !== b.raceId) return a.raceId < b.raceId ? -1 : 1
  return 0
}

export function buildCoverageMatrixRows(
  races: readonly CoverageRaceRecord[],
  evidence: readonly unknown[],
  asOf: Date
): CoverageMatrixRow[] {
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

  const rows = races.map(race => {
    const derived = deriveCoverage(grouped.get(race.id) ?? [], asOf)
    const inventory = inventoryFromLiveOffer(derived.kinds.live_offer)

    return {
      raceId: race.id,
      raceName: race.name,
      raceSlug: race.slug,
      raceDate: toIso(race.date) ?? "",
      seriesName: race.seriesName,
      seriesShortName: race.seriesShortName,
      circuitName: race.circuitName,
      tier: derived.tier,
      kinds: derived.kinds,
      firstLimitingKind: derived.firstLimitingKind,
      freshUntil: toIso(derived.freshUntil),
      inventoryState: inventory.inventoryState,
      inventoryLabel: inventory.inventoryLabel,
      nextAction: nextActionFromDerivation(derived)
    }
  })

  return rows.sort(compareRows)
}

export async function getCoverageMatrixAction(): Promise<
  ActionState<CoverageMatrixRow[]>
> {
  "use server"

  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    throw error
  }

  try {
    const asOf = new Date()

    const races = await db
      .select({
        id: racesTable.id,
        name: racesTable.name,
        slug: racesTable.slug,
        date: racesTable.date,
        seriesName: seriesTable.name,
        seriesShortName: seriesTable.shortName,
        circuitName: circuitsTable.name
      })
      .from(racesTable)
      .leftJoin(seriesTable, eq(racesTable.seriesId, seriesTable.id))
      .leftJoin(circuitsTable, eq(racesTable.circuitId, circuitsTable.id))

    const evidence = await db.select().from(coverageEvidenceTable)

    return {
      isSuccess: true,
      message: "Coverage matrix retrieved successfully",
      data: buildCoverageMatrixRows(races, evidence, asOf)
    }
  } catch (error) {
    console.error("[Coverage] Failed to get coverage matrix:", error)
    return { isSuccess: false, message: "Failed to get coverage matrix" }
  }
}
