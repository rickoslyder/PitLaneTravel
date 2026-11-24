import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { RacePhotoCredit } from "@/components/races/race-photo-credit"
import type { RaceImageCredit } from "@/lib/race-series-image"
import { buttonVariants } from "@/components/ui/button"
import { CoverageBadge } from "@/components/coverage/coverage-badge"
import { RaceImageFallback } from "@/components/races/race-image-fallback"
import { SeriesBadge } from "@/components/series/series-badge"
import type { TicketListingState } from "@/components/races/tickets/ticket-availability"
import {
  PLAN_YOUR_TRIP_LABEL,
  RACE_TICKETS_CTA,
  TICKETS_NOT_LISTED_NOTE,
  findTicketsAccessibleName,
  planYourTripAccessibleName
} from "@/components/races/tickets/ticket-presentation"
import type { PublicCoverageSummary } from "@/lib/public-coverage"
import type { RaceTiming } from "@/lib/race-calendar-window"
import { cn } from "@/lib/utils"
import { CalendarDays, MapPin } from "lucide-react"

export type ListingCardImage = {
  src: string
  srcSet?: string
  sizes: string
  alt: string
}

export type ListingCardModel = {
  id: string
  timing: RaceTiming
  seriesSlug: string
  seriesLabel: string | null
  seriesColor: string | null
  name: string
  circuitName: string
  country: string
  location: string
  month: string
  dateIso: string
  dateLabel: string
  href: string
  cancelled: boolean
  cancellationReason: string | null
  coverage?: PublicCoverageSummary
  listingState?: TicketListingState
  image: ListingCardImage | null
  photoCredit?: RaceImageCredit | null
  fallbackTitle: string
  fallbackCircuit?: string | null
  fallbackSeries: string | null
  fallbackAccent?: string | null
  fallbackCountry: string | null
  fallbackDate?: string | null
  fallbackAlt?: string | null
}

function ListingCtas({ model }: { model: ListingCardModel }) {
  const width = "w-full"
  if (model.listingState === "listed") {
    return (
      <div
        className="race-listing-ctas flex w-full flex-col gap-2"
        data-race-card-ctas=""
      >
        <a
          className={cn(buttonVariants(), width)}
          href={`${model.href}?tab=tickets`}
          aria-label={findTicketsAccessibleName(model.name)}
        >
          {RACE_TICKETS_CTA}
        </a>
        <a
          className={cn(buttonVariants({ variant: "outline" }), width)}
          href={`${model.href}?tab=travel`}
          aria-label={planYourTripAccessibleName(model.name)}
        >
          {PLAN_YOUR_TRIP_LABEL}
        </a>
      </div>
    )
  }
  if (model.listingState === "empty") {
    return (
      <div
        className="race-listing-ctas flex w-full flex-col gap-2"
        data-race-card-ctas=""
      >
        <a
          className={cn(buttonVariants(), width)}
          href={`${model.href}?tab=travel`}
          aria-label={planYourTripAccessibleName(model.name)}
        >
          {PLAN_YOUR_TRIP_LABEL}
        </a>
        <p className="text-muted-foreground text-center text-xs leading-5">
          {TICKETS_NOT_LISTED_NOTE}
        </p>
      </div>
    )
  }
  return (
    <div className="race-listing-ctas flex w-full">
      <a
        className={cn(
          buttonVariants({ variant: model.cancelled ? "outline" : "default" }),
          width
        )}
        href={model.href}
      >
        View Details
      </a>
    </div>
  )
}

export function ListingCardView({ model }: { model: ListingCardModel }) {
  const badges = (
    <>
      {model.seriesLabel ? (
        <SeriesBadge
          label={model.seriesLabel}
          accentColor={model.seriesColor}
        />
      ) : null}
      {model.cancelled ? (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
          Cancelled
        </span>
      ) : null}
    </>
  )

  return (
    <Card
      data-race-card=""
      data-race-timing={model.timing}
      data-race-series={model.seriesSlug}
      data-race-name={model.name}
      data-race-circuit={model.circuitName}
      data-race-country={model.country}
      data-race-location={model.location}
      data-race-month={model.month}
      data-race-date={model.dateIso}
      data-race-href={model.href}
      className={cn(
        "group h-full cursor-pointer",
        model.cancelled && "opacity-70"
      )}
    >
      <div className="race-listing-main contents">
        <CardHeader className="race-listing-header pb-4">
          <div className="race-listing-photo relative aspect-[16/9] overflow-hidden rounded-lg">
            <div className="race-listing-badges-overlay absolute left-2 top-2 z-10 flex gap-1.5">
              {badges}
            </div>
            {model.image ? (
              // Server-resolved URL. The img is not a client component.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={model.image.src}
                srcSet={model.image.srcSet}
                sizes={model.image.sizes}
                alt={model.image.alt}
                loading="lazy"
                decoding="async"
                className="race-listing-img object-cover transition-transform duration-300 group-hover:scale-105"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent"
                }}
              />
            ) : null}
            {model.image && model.photoCredit ? (
              <div className="absolute inset-x-0 bottom-0 z-10">
                <RacePhotoCredit credit={model.photoCredit} />
              </div>
            ) : null}
            <div className={cn(model.image && "hidden")}>
              <RaceImageFallback
                title={model.fallbackTitle}
                circuitName={model.fallbackCircuit}
                series={model.fallbackSeries}
                accentColor={model.fallbackAccent}
                country={model.fallbackCountry}
                dateLabel={model.fallbackDate}
                alt={model.fallbackAlt}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="race-listing-content space-y-2.5">
          <div className="race-listing-title-row">
            <h3
              className={cn(
                "race-listing-title line-clamp-2 font-semibold",
                model.cancelled && "line-through decoration-1"
              )}
            >
              {model.name}
            </h3>
            {model.coverage ? (
              <CoverageBadge summary={model.coverage} compact />
            ) : null}
            <div className="race-listing-badges-inline hidden">{badges}</div>
          </div>
          <div className="race-listing-meta text-muted-foreground flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              <span>
                {model.location}, {model.country}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              <span>{model.dateLabel}</span>
            </div>
            {model.cancelled && model.cancellationReason ? (
              <p className="race-listing-reason text-xs text-red-600 dark:text-red-400">
                {model.cancellationReason}
              </p>
            ) : null}
          </div>
        </CardContent>
      </div>
      <CardFooter className="race-listing-footer">
        <ListingCtas model={model} />
      </CardFooter>
    </Card>
  )
}

export const raceListingListStyles = `
[data-race-view="list"] [data-race-card]{display:flex;height:auto;cursor:auto;flex-direction:column}
[data-race-view="list"] .race-listing-main{display:flex !important;flex-direction:column}
[data-race-view="list"] .race-listing-photo{aspect-ratio:auto;width:5rem;height:5rem}
[data-race-view="list"] .race-listing-badges-overlay{display:none !important}
[data-race-view="list"] .race-listing-badges-inline{display:flex !important;flex-wrap:wrap;align-items:center;gap:.5rem}
[data-race-view="list"] .race-listing-title-row{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
[data-race-view="list"] .race-listing-coverage-grid{display:none !important}
[data-race-view="list"] .race-listing-title{overflow:visible;display:inline;-webkit-line-clamp:unset}
[data-race-view="list"] .race-listing-meta{flex-direction:row;flex-wrap:wrap;align-items:center}
[data-race-view="list"] .race-listing-img{transform:none !important}
[data-race-view="list"] .race-listing-ctas a{width:auto !important}
[data-race-view="list"] .race-listing-header{padding-top:1.5rem;padding-bottom:.5rem}
[data-race-view="list"] .race-listing-content{padding-bottom:.5rem;row-gap:.375rem}
[data-race-view="list"] .race-listing-title-row > [data-coverage-badge]{margin-top:0}
.race-listing-title-row > [data-coverage-badge]{margin-top:.625rem}
.race-listing-photo[data-race-photo-failed] .race-listing-img,
.race-listing-photo[data-race-photo-failed] .race-photo-credit{display:none !important}
.race-listing-photo[data-race-photo-failed] > .hidden{display:block !important}
[data-race-view="list"] .race-photo-credit{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
[data-race-view="list"] .race-listing-photo [data-race-fallback-copy]{padding:.375rem !important}
[data-race-view="list"] .race-listing-photo [data-race-image-fallback] p{font-size:10px !important;line-height:1.15 !important;-webkit-line-clamp:2}
[data-race-view="list"] .race-listing-photo [data-race-fallback-detail],
[data-race-view="list"] .race-listing-photo [data-race-fallback-mark]{display:none !important}
@media (min-width:640px){
  [data-race-view="list"] [data-race-card]{flex-direction:row;align-items:center;justify-content:space-between}
  [data-race-view="list"] .race-listing-main{flex-direction:row;align-items:center;gap:1.5rem}
  [data-race-view="list"] .race-listing-header{padding-bottom:1.5rem}
  [data-race-view="list"] .race-listing-content{padding-top:1.5rem;padding-bottom:1.5rem}
}
`
