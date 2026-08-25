import React from "react"
import type { CoverageMatrixRow } from "@/actions/db/coverage-actions"
import type { CoverageEvidenceKind } from "@/lib/coverage"

const KIND_HEADINGS: Array<{ kind: CoverageEvidenceKind; label: string }> = [
  { kind: "calendar", label: "Calendar" },
  { kind: "logistics", label: "Logistics" },
  { kind: "decision_guide", label: "Decision guide" },
  { kind: "live_offer", label: "Live offer" },
  { kind: "personalized_plan", label: "Personalized plan" }
]

export function formatUtcTimestamp(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 16)} UTC`
}

export function formatDiagnostic(value: string): string {
  return value.replaceAll("_", " ")
}

function tierWording(tier: CoverageMatrixRow["tier"]): string {
  if (tier == null) return "No verified coverage"
  if (tier === 0) return "Calendar only"
  return `Tier ${tier}`
}

function whyTier(row: CoverageMatrixRow): string {
  if (row.tier === 4 || row.firstLimitingKind == null) {
    return "All required evidence is current"
  }
  if (row.tier == null && row.kinds.calendar === "missing") {
    return "No verified coverage"
  }
  if (row.tier === 0) return "Calendar only"
  return `Limited by ${formatDiagnostic(row.kinds[row.firstLimitingKind])} ${formatDiagnostic(row.firstLimitingKind)}`
}

function summarize(rows: CoverageMatrixRow[]) {
  const counts = {
    total: rows.length,
    null: 0,
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0
  }
  for (const row of rows) {
    if (row.tier == null) counts.null += 1
    else counts[row.tier] += 1
  }
  return counts
}

export function CoverageTable({ rows }: { rows: CoverageMatrixRow[] }) {
  const counts = summarize(rows)

  return (
    <div className="min-w-0 space-y-4">
      <ul
        className="flex flex-wrap gap-3 text-sm"
        aria-label="Coverage summary"
      >
        <li>Total {counts.total}</li>
        <li>No verified coverage {counts.null}</li>
        <li>Tier 0 {counts[0]}</li>
        <li>Tier 1 {counts[1]}</li>
        <li>Tier 2 {counts[2]}</li>
        <li>Tier 3 {counts[3]}</li>
        <li>Tier 4 {counts[4]}</li>
      </ul>

      <div
        className="overflow-x-auto rounded-md border"
        role="region"
        aria-label="Coverage matrix"
        tabIndex={0}
      >
        <table className="w-full min-w-[72rem] text-sm">
          <caption className="sr-only">
            Coverage matrix for every supplied event
          </caption>
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th scope="col" className="p-3">
                Event
              </th>
              <th scope="col" className="p-3">
                Series
              </th>
              <th scope="col" className="p-3">
                Circuit
              </th>
              <th scope="col" className="p-3">
                Date
              </th>
              <th scope="col" className="p-3">
                Tier
              </th>
              <th scope="col" className="p-3">
                Why this tier
              </th>
              {KIND_HEADINGS.map(column => (
                <th key={column.kind} scope="col" className="p-3">
                  {column.label}
                </th>
              ))}
              <th scope="col" className="p-3">
                Fresh until
              </th>
              <th scope="col" className="p-3">
                Inventory
              </th>
              <th scope="col" className="p-3">
                Next action
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.raceId} className="border-t align-top">
                <td className="p-3 font-medium">
                  <div>{row.raceName}</div>
                  {row.raceSlug ? (
                    <div className="text-muted-foreground font-mono text-xs">
                      {row.raceSlug}
                    </div>
                  ) : null}
                </td>
                <td className="p-3">{row.seriesName ?? "—"}</td>
                <td className="p-3">{row.circuitName ?? "—"}</td>
                <td className="p-3 font-mono text-xs">
                  {formatUtcTimestamp(row.raceDate)}
                </td>
                <td className="p-3">{tierWording(row.tier)}</td>
                <td className="p-3">{whyTier(row)}</td>
                {KIND_HEADINGS.map(column => (
                  <td key={column.kind} className="p-3 text-xs">
                    {formatDiagnostic(row.kinds[column.kind])}
                  </td>
                ))}
                <td className="p-3 font-mono text-xs">
                  {row.freshUntil
                    ? formatUtcTimestamp(row.freshUntil)
                    : "No freshness window"}
                </td>
                <td className="p-3">{row.inventoryLabel}</td>
                <td className="p-3">{row.nextAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
