import {
  type ListingCardImage,
  type ListingCardModel
} from "@/components/races/race-listing-card-view"
import type { TicketListingState } from "@/components/races/tickets/ticket-availability"
import {
  formatRaceCalendarDate,
  formatRaceCalendarMonth
} from "@/lib/race-datetime"
import { raceCardImage } from "@/lib/race-series-image"
import type { PublicCoverageSummary } from "@/lib/public-coverage"
import type { RaceTiming } from "@/lib/race-calendar-window"
import type { RaceWithCircuitAndSeries } from "@/types/database"
import { getImageProps } from "next/image"

const LISTING_IMAGE_SIZES =
  "(max-width: 640px) calc(100vw - 8rem), (max-width: 1024px) 50vw, 33vw"

function dateIso(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString()
}

export function toListingCardModel(
  race: RaceWithCircuitAndSeries,
  timing: RaceTiming,
  coverage: PublicCoverageSummary | undefined,
  listingState: TicketListingState | undefined
): ListingCardModel {
  const seriesSlug = race.series?.slug ?? "f1"
  const cancelled = race.status === "cancelled"
  const href = `/races/${race.slug || race.id}`
  const visual = raceCardImage(race)
  let image: ListingCardImage | null = null
  if (visual.src) {
    const { props } = getImageProps({
      src: visual.src,
      alt: visual.alt,
      fill: true,
      sizes: LISTING_IMAGE_SIZES,
      quality: 65
    })
    image = {
      src: props.src,
      srcSet: props.srcSet,
      sizes: props.sizes || LISTING_IMAGE_SIZES,
      alt: visual.alt
    }
  }

  return {
    id: race.id,
    timing,
    seriesSlug,
    seriesLabel: race.series?.short_name ?? null,
    seriesColor: race.series?.accent_color ?? null,
    name: race.name,
    circuitName: race.circuit?.name ?? "",
    country: race.country ?? "",
    location: race.circuit?.location ?? "",
    month: formatRaceCalendarMonth(race.date),
    dateIso: dateIso(race.date),
    dateLabel: formatRaceCalendarDate(
      race.date,
      undefined,
      race.circuit?.timezone_id
    ),
    href,
    cancelled,
    cancellationReason: race.cancellation_reason ?? null,
    coverage,
    listingState,
    image,
    fallbackTitle: visual.fallback.title,
    fallbackCircuit: visual.fallback.circuitName,
    fallbackSeries: visual.fallback.series,
    fallbackAccent: visual.fallback.accentColor,
    fallbackCountry: visual.fallback.country,
    fallbackDate: visual.fallback.dateLabel,
    fallbackAlt: visual.alt
  }
}
