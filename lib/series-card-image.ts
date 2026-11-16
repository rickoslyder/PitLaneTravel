/**
 * Series race-card photos sit in a padded 16:9 frame, not the viewport.
 * On a 412px phone the frame is about 332px wide (page padding 1rem, card
 * padding 1.5rem). Default mobile Lighthouse is that width at DPR 1.75, so
 * the frame needs ~580 device pixels. The srcset candidate for that slot is
 * 640. 3x phones still use the wider srcset candidates.
 *
 * Next's priority preload is an imagesrcset link with no href, which the
 * preload scanner skips. The series page preloads the 640 URL directly, and
 * only when the padded frame's device pixels fall in (384, 640]. A wider
 * phone or a higher DPR selects 750+ from the srcset, so a width-only media
 * query would download 640 as well and contend with the real photo.
 */
export const SERIES_CARD_MOBILE_WIDTH = 640

/**
 * Viewport and density box where `seriesCardSelectedWidth` is 640.
 * Includes the default Lighthouse phone (412 CSS px, 1.75 DPR).
 * Corners: 400px at 1.5 DPR is 480 device px; 430px at 1.75 DPR is 612.5.
 */
export const SERIES_CARD_LCP_PRELOAD_MEDIA =
  "(min-width: 400px) and (max-width: 430px) and (min-resolution: 1.5dppx) and (max-resolution: 1.75dppx)"

/** Widths next/image emits for SERIES_CARD_SIZES (candidates at least 320). */
export const SERIES_CARD_SRCSET_WIDTHS = [
  384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840
] as const

const SERIES_CARD_CHROME_PX = 16 * 2 + 24 * 2

export function seriesCardSelectedWidth(
  viewportPx: number,
  dpr: number
): number {
  const devicePixels = (viewportPx - SERIES_CARD_CHROME_PX) * dpr
  return (
    SERIES_CARD_SRCSET_WIDTHS.find(width => width >= devicePixels) ??
    SERIES_CARD_SRCSET_WIDTHS[SERIES_CARD_SRCSET_WIDTHS.length - 1]
  )
}

export const SERIES_CARD_IMAGE_QUALITY = 65

export const SERIES_CARD_SIZES =
  "(max-width: 639px) calc(100vw - 5rem), (max-width: 1023px) calc(50vw - 5.75rem), 22rem"

export type SeriesCalendarRace = {
  id: string
  name: string
  slug: string | null
  date: string
  season: number
  country: string
  status: "in_progress" | "upcoming" | "completed" | "cancelled"
  weekend_end?: string | null
  cancellation_reason?: string | null
  series?: { short_name: string; accent_color: string | null } | null
  circuit: {
    name: string
    location: string
    country: string
    image_url: string | null
    timezone_id: string | null
  } | null
}

export function seriesCardMobileImageHref(src: string): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${SERIES_CARD_MOBILE_WIDTH}&q=${SERIES_CARD_IMAGE_QUALITY}`
}
