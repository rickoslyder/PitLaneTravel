/**
 * Series race-card photos sit in a padded 16:9 frame, not the viewport.
 * On a 412px phone the frame is about 332px wide (page padding 1rem, card
 * padding 1.5rem). Default mobile Lighthouse is that width at DPR 1.75, so
 * the frame needs ~580 device pixels. The srcset candidate for that slot is
 * 640. 3x phones still use the wider srcset candidates.
 *
 * Next's priority preload is an imagesrcset link with no href, which the
 * preload scanner skips. The series page preloads the 640 URL directly.
 * With SERIES_CARD_SIZES, a 412px DPR 1.75 viewport selects that same file.
 */
export const SERIES_CARD_MOBILE_MEDIA = "(max-width: 639px)"

export const SERIES_CARD_MOBILE_WIDTH = 640

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
