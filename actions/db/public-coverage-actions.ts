/*
<ai_context>
Public coverage read model. Queries only the requested race IDs, derives summaries
against one asOf instant, and returns a safe projection. Admin matrix stays admin-only.
</ai_context>
*/

import { db } from "@/db/db"
import { coverageEvidenceTable } from "@/db/schema"
import {
  buildPublicCoverageSummaries,
  type PublicCoverageSummary
} from "@/lib/public-coverage"
import { ActionState } from "@/types"
import { inArray } from "drizzle-orm"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Hard maximum unique race IDs per public coverage read. Sized for the complete five-series catalogue. */
export const PUBLIC_COVERAGE_RACE_ID_MAX = 500

function uniqueValidRaceIds(raceIds: readonly unknown[]): string[] {
  const seen = new Set<string>()
  const ids: string[] = []
  for (const value of raceIds) {
    if (typeof value !== "string" || !UUID_RE.test(value)) continue
    if (seen.has(value)) continue
    seen.add(value)
    ids.push(value)
  }
  return ids
}

export async function getPublicCoverageSummariesAction(
  raceIds: readonly unknown[]
): Promise<ActionState<PublicCoverageSummary[]>> {
  "use server"

  const ids = uniqueValidRaceIds(Array.isArray(raceIds) ? raceIds : [])
  if (ids.length > PUBLIC_COVERAGE_RACE_ID_MAX) {
    return { isSuccess: false, message: "Too many race IDs" }
  }
  if (ids.length === 0) {
    return {
      isSuccess: true,
      message: "Coverage summaries retrieved successfully",
      data: []
    }
  }

  try {
    const asOf = new Date()
    const evidence = await db
      .select()
      .from(coverageEvidenceTable)
      .where(inArray(coverageEvidenceTable.raceId, ids))

    return {
      isSuccess: true,
      message: "Coverage summaries retrieved successfully",
      data: buildPublicCoverageSummaries(ids, evidence, asOf)
    }
  } catch (error) {
    console.error("[Coverage] Failed to get public coverage:", error)
    return { isSuccess: false, message: "Failed to load coverage" }
  }
}
