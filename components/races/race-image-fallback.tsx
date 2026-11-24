import type { CSSProperties } from "react"
import { countryFlagEmoji } from "@/lib/country-flag"
import { readableTextOn } from "@/lib/color-contrast"
import { cn } from "@/lib/utils"

/** Warm paper, editorial ink, and the site red. */
export const RACE_FALLBACK_PAPER = "#faf8f4"
export const RACE_FALLBACK_INK = "#1c1916"
export const RACE_FALLBACK_RED = "#e10600"
export const RACE_FALLBACK_MUTED = "#3f3832"

export interface RaceImageFallbackProps {
  title: string
  circuitName?: string | null
  series?: string | null
  accentColor?: string | null
  country?: string | null
  dateLabel?: string | null
  /** Accessible name. Visible type is the same facts. */
  alt?: string | null
  /** Square list thumbnails. Grid and home cards use the panel. */
  compact?: boolean
  className?: string
}

function badgeColor(accent: string | null | undefined): string {
  const value = accent?.trim()
  if (!value || !/^#[0-9a-fA-F]{6}$/.test(value)) return RACE_FALLBACK_RED
  return value
}

function clampLines(lines: number): CSSProperties {
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    margin: 0
  }
}

/**
 * Designed stand-in when a race has no series-correct photo.
 * Paper and red, with the race name, series, country, and date.
 * Venue files in track_map_url are dark diagrams, so this draws a line
 * instead of painting those files. The parent's aspect ratio holds the frame.
 */
export function RaceImageFallback({
  title,
  circuitName,
  series,
  accentColor,
  country,
  dateLabel,
  alt,
  compact = false,
  className
}: RaceImageFallbackProps) {
  const flag = countryFlagEmoji(country)
  const seriesLabel = series?.trim() || null
  const place = circuitName?.trim() || null
  const when = dateLabel?.trim() || null
  const meta = [country?.trim(), when].filter(Boolean).join(" · ")
  const background = badgeColor(accentColor)
  const label =
    alt?.trim() ||
    [seriesLabel, title, place, country?.trim(), when]
      .filter(Boolean)
      .join(", ")

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{
        backgroundColor: RACE_FALLBACK_PAPER,
        backgroundImage:
          "linear-gradient(165deg, #fffdfb 0%, #faf8f4 46%, #f3ebe3 100%)",
        color: RACE_FALLBACK_INK,
        borderLeft: `4px solid ${RACE_FALLBACK_RED}`,
        boxShadow: "inset 0 0 0 1px rgba(28, 25, 22, 0.14)"
      }}
      role="img"
      aria-label={label}
      data-race-image-fallback=""
    >
      {!compact ? (
        <svg
          aria-hidden="true"
          data-race-fallback-mark=""
          viewBox="0 0 160 96"
          style={{
            position: "absolute",
            right: 12,
            bottom: 10,
            width: "34%",
            height: "auto"
          }}
        >
          <path
            d="M24 70c2-28 24-46 52-46h16c18 0 32 12 34 28 2 18-12 32-30 32-12 0-20-6-22-16-2-12 8-20 20-18"
            fill="none"
            stroke={RACE_FALLBACK_RED}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M36 74c18 10 62 12 92-8"
            fill="none"
            stroke={RACE_FALLBACK_INK}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.35"
          />
        </svg>
      ) : null}
      <div
        aria-hidden="true"
        data-race-fallback-copy=""
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: compact ? "0.375rem" : "0.8rem 0.9rem 0.75rem"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.5rem"
          }}
        >
          {seriesLabel ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                borderRadius: 999,
                backgroundColor: background,
                color: readableTextOn(background),
                padding: compact ? "1px 5px" : "2px 8px",
                fontSize: compact ? 9 : 11,
                fontWeight: 650,
                letterSpacing: "0.08em",
                lineHeight: 1.35,
                textTransform: "uppercase"
              }}
            >
              {seriesLabel}
            </span>
          ) : (
            <span />
          )}
          {flag ? (
            <span
              data-country-flag=""
              style={{
                marginLeft: "auto",
                fontSize: compact ? 14 : 18,
                lineHeight: 1
              }}
            >
              {flag}
            </span>
          ) : null}
        </div>
        <div>
          <p
            style={{
              ...clampLines(compact ? 2 : 3),
              fontWeight: 650,
              fontSize: compact ? 10 : 16,
              lineHeight: 1.15,
              letterSpacing: "-0.01em"
            }}
          >
            {title}
          </p>
          {place && !compact ? (
            <p
              data-race-fallback-detail=""
              style={{
                ...clampLines(1),
                marginTop: 4,
                fontSize: 12,
                lineHeight: 1.3,
                color: RACE_FALLBACK_MUTED
              }}
            >
              {place}
            </p>
          ) : null}
          {meta && !compact ? (
            <p
              data-race-fallback-detail=""
              style={{
                ...clampLines(1),
                marginTop: 2,
                fontSize: 12,
                lineHeight: 1.3,
                color: RACE_FALLBACK_MUTED
              }}
            >
              {meta}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
