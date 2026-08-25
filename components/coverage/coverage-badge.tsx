import React from "react"
import {
  coverageDepthLabel,
  offerAvailabilityLabel,
  type PublicCoverageSummary
} from "@/lib/public-coverage"
import { cn } from "@/lib/utils"

export function CoverageBadge({
  summary,
  compact = false
}: {
  summary: PublicCoverageSummary
  compact?: boolean
}) {
  const depth = coverageDepthLabel(summary.tier)
  const offer = offerAvailabilityLabel(summary.liveOfferState)
  const restrained = summary.tier == null || summary.tier === 0

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5",
        compact ? "text-[11px] leading-tight" : "text-xs"
      )}
      data-coverage-badge=""
      data-coverage-tier={summary.tier == null ? "none" : String(summary.tier)}
      data-coverage-tone={restrained ? "muted" : "emphasis"}
    >
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-2 py-0.5 font-medium",
          restrained
            ? "border-muted-foreground/20 bg-muted/40 text-muted-foreground"
            : "border-transparent bg-secondary text-secondary-foreground"
        )}
      >
        {depth}
      </span>
      <span className="text-muted-foreground inline-flex items-center rounded-full border border-dashed px-2 py-0.5 font-medium">
        {offer}
      </span>
    </div>
  )
}
