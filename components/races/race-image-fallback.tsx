import { countryFlagEmoji } from "@/lib/country-flag"
import { cn } from "@/lib/utils"

/** Editorial ink and paper from the existing palette. */
export const RACE_FALLBACK_INK = "#1c1916"
export const RACE_FALLBACK_PAPER = "#f6f1ea"

export interface RaceImageFallbackProps {
  title: string
  series?: string | null
  country?: string | null
  /** Square list thumbnails. The grid and home cards use the panel. */
  compact?: boolean
  className?: string
}

/**
 * Designed stand-in for a race card with no circuit photo.
 * Monochrome ink and paper only: no series marks, team crests, or wordmarks.
 */
export function RaceImageFallback({
  title,
  series,
  country,
  compact = false,
  className
}: RaceImageFallbackProps) {
  const flag = countryFlagEmoji(country)
  const seriesLabel = series?.trim() || null

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col justify-between overflow-hidden",
        compact ? "p-1.5" : "p-3 sm:p-4",
        className
      )}
      style={{ backgroundColor: RACE_FALLBACK_INK, color: RACE_FALLBACK_PAPER }}
      data-race-image-fallback=""
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-6 top-2 h-10 w-24 -rotate-12 border border-[#f6f1ea]/25 sm:h-14 sm:w-36" />
        <div className="absolute inset-x-0 bottom-5 h-px bg-[#f6f1ea]/30" />
        <div className="absolute inset-x-6 bottom-2 h-px bg-[#f6f1ea]/15" />
      </div>
      <div className="relative flex items-start justify-between gap-2">
        {seriesLabel ? (
          <p
            className={cn(
              "font-semibold uppercase tracking-[0.16em]",
              compact ? "text-[9px] leading-tight" : "text-[0.65rem]"
            )}
          >
            {seriesLabel}
          </p>
        ) : (
          <span className="sr-only">Circuit photo unavailable</span>
        )}
        {flag ? (
          <span
            data-country-flag=""
            className={cn("leading-none", compact ? "text-sm" : "text-lg")}
            aria-hidden="true"
          >
            {flag}
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "relative font-semibold",
          compact
            ? "line-clamp-2 text-[10px] leading-tight"
            : "line-clamp-3 text-base leading-tight sm:text-lg"
        )}
      >
        {title}
      </p>
      {country ? <span className="sr-only">{country}</span> : null}
    </div>
  )
}
