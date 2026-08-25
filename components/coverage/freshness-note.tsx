import React from "react"
import {
  formatCoverageUtc,
  hasCurrentChainFreshness,
  type PublicCoverageSummary
} from "@/lib/public-coverage"

export function FreshnessNote({
  summary
}: {
  summary: PublicCoverageSummary
}) {
  if (!hasCurrentChainFreshness(summary.freshUntil, summary.derivedAt)) {
    return null
  }
  const formatted = formatCoverageUtc(summary.freshUntil)
  if (!formatted) return null

  return (
    <p className="text-muted-foreground text-sm" data-freshness-note="">
      Coverage current until {formatted}
    </p>
  )
}
