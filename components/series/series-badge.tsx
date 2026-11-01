import { cn } from "@/lib/utils"
import { readableTextOn } from "@/lib/color-contrast"

const FALLBACK_SERIES_COLOR = "#e10600"

interface SeriesBadgeProps {
  label: string
  accentColor?: string | null
  className?: string
}

/**
 * The only place a series colour is painted. Text colour is chosen so the
 * pair clears WCAG AA 4.5:1 (Formula E cyan uses ink, not white).
 */
export function SeriesBadge({
  label,
  accentColor,
  className
}: SeriesBadgeProps) {
  const background = accentColor || FALLBACK_SERIES_COLOR
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        className
      )}
      style={{ backgroundColor: background, color: readableTextOn(background) }}
    >
      {label}
    </span>
  )
}
