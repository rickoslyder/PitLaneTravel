"use server"

import { cache } from "react"
import { Suspense } from "react"
import { getAuthedUserId } from "@/lib/auth"
import {
  getRaceByIdAction,
  getRaceBySlugAction
} from "@/actions/db/races-actions"
import { getCircuitWithDetailsAction } from "@/actions/db/circuits-actions"
import { getGrandstandsByCircuitAction } from "@/actions/db/grandstands-actions"
import { getUserTripForRaceAction } from "@/actions/db/trips-actions"
import { notFound } from "next/navigation"
import { RaceDetailsPage } from "@/components/races/RaceDetailsPage"
import { RaceHeroIsland } from "@/components/races/race-hero-island"
import { RaceTrail } from "@/components/races/race-trail"
import { raceDetailTrail } from "@/lib/race-trail"
import LocalAttractions from "@/components/races/LocalAttractions"
import { RaceWithDetails } from "@/types/race"
import { getRaceHistoryAction } from "@/actions/db/race-history-actions"
import { getPublicCoverageSummariesAction } from "@/actions/db/public-coverage-actions"
import { Metadata } from "next"
import {
  buildRacePageMetadata,
  RACE_PAGE_NOT_FOUND_DESCRIPTION,
  RACE_PAGE_NOT_FOUND_TITLE
} from "@/lib/race-page-metadata"
import { raceHasFinished } from "@/lib/finished-race"
import {
  buildSportsEventJsonLd,
  pageSeo,
  serializeJsonLd
} from "@/lib/site-metadata"
import { raceHasTicketListingsAction } from "@/actions/db/ticket-listing-actions"
import { grandstandHrefForRace } from "@/lib/circuit-race-links"
import { raceCardImage } from "@/lib/race-series-image"
import {
  RACE_HERO_LCP_PRELOAD_MEDIA,
  raceHeroLcpHref
} from "@/lib/race-hero-lcp"

const RACE_TABS = [
  "info",
  "tickets",
  "travel",
  "schedule",
  "reviews",
  "itinerary"
] as const

interface RacePageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    tab?: string | string[]
  }>
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Helper function to reduce code duplication. Cached so metadata and the page
// share one race lookup in the same request.
const getRaceData = cache(async function getRaceData(id: string) {
  // UUIDs are primary keys; anything else is a slug (series- and season-agnostic).
  let raceResult
  if (UUID_RE.test(id)) {
    raceResult = await getRaceByIdAction(id)
    if (!raceResult.isSuccess) {
      raceResult = await getRaceBySlugAction(id)
    }
  } else {
    raceResult = await getRaceBySlugAction(id)
    if (!raceResult.isSuccess) {
      raceResult = await getRaceByIdAction(id)
    }
  }

  if (!raceResult.isSuccess || !raceResult.data.circuit) {
    return null
  }

  return {
    race: raceResult.data
  }
})

export async function generateMetadata({
  params
}: RacePageProps): Promise<Metadata> {
  const { id } = await params
  const data = await getRaceData(id)

  if (!data) {
    return {
      title: RACE_PAGE_NOT_FOUND_TITLE,
      description: RACE_PAGE_NOT_FOUND_DESCRIPTION
    }
  }

  const { race } = data
  const circuit = race.circuit
  const copy = buildRacePageMetadata({
    raceName: race.name,
    series: race.series,
    circuitName: circuit?.name,
    circuitLocation: circuit?.location
  })

  const finished = raceHasFinished(
    {
      status: race.status,
      date: race.date,
      weekend_end: race.weekend_end
    },
    new Date()
  )
  const seo = pageSeo(race.slug ? `/races/${race.slug}` : `/races/${id}`)

  return {
    title: copy.title,
    description: copy.description,
    alternates: seo.alternates,
    openGraph: {
      title: copy.openGraph.title,
      description: copy.openGraph.description,
      url: seo.openGraph.url,
      images: seo.openGraph.images
    },
    ...(finished ? { robots: { index: false, follow: true } } : {})
  }
}

function requestedRaceTab(
  tab: string | string[] | undefined
): string | undefined {
  const value = Array.isArray(tab) ? tab[0] : tab
  return value && RACE_TABS.some(option => option === value) ? value : undefined
}

export default async function RacePage({
  params,
  searchParams
}: RacePageProps) {
  const [resolvedParams, resolvedSearch] = await Promise.all([
    params,
    searchParams
  ])
  const [userId, data] = await Promise.all([
    getAuthedUserId(),
    getRaceData(resolvedParams.id)
  ])

  if (!data?.race.circuit) {
    return notFound()
  }

  const raceRow = data.race
  const hasTicketListings = await raceHasTicketListingsAction(raceRow.id)
  const heroImage = raceCardImage(raceRow)
  const heroPreload = raceHeroLcpHref(heroImage.src)
  const racePath = raceRow.slug
    ? `/races/${raceRow.slug}`
    : `/races/${resolvedParams.id}`
  const sportsEvent = buildSportsEventJsonLd({
    name: raceRow.name,
    startDate: raceRow.date,
    endDate: raceRow.weekend_end,
    status: raceRow.status,
    url: racePath,
    sport: raceRow.series?.name ?? null,
    locationName: raceRow.circuit?.name ?? null,
    addressLocality: raceRow.circuit?.location ?? null,
    addressCountry: raceRow.circuit?.country ?? raceRow.country
  })

  return (
    <div className="space-y-8 sm:container sm:py-8">
      {heroPreload ? (
        <link
          rel="preload"
          as="image"
          href={heroPreload}
          media={RACE_HERO_LCP_PRELOAD_MEDIA}
          fetchPriority="high"
        />
      ) : null}
      <RaceTrail items={raceDetailTrail(raceRow.name, racePath)} />
      {sportsEvent ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(sportsEvent)
          }}
        />
      ) : null}
      <RaceHeroIsland
        race={raceRow}
        ticketListings={hasTicketListings ? "listed" : "empty"}
      />
      <Suspense
        fallback={<div aria-hidden="true" style={{ minHeight: "50vh" }} />}
      >
        <RaceDetailsLoaded
          id={resolvedParams.id}
          userId={userId}
          initialTab={requestedRaceTab(resolvedSearch.tab)}
        />
      </Suspense>
    </div>
  )
}

async function RaceDetailsLoaded({
  id,
  userId,
  initialTab
}: {
  id: string
  userId: string | null
  initialTab: string | undefined
}) {
  const data = await getRaceData(id)
  if (!data?.race.circuit) {
    return notFound()
  }

  const raceRow = data.race
  const circuitResult = await getCircuitWithDetailsAction(raceRow.circuit_id)
  if (!circuitResult.isSuccess) {
    return notFound()
  }
  const circuitData = circuitResult.data

  const [
    historyResult,
    coverageResult,
    tripResult,
    hasTicketListings,
    grandstandsResult
  ] = await Promise.all([
    getRaceHistoryAction(raceRow.id),
    getPublicCoverageSummariesAction([raceRow.id]),
    userId
      ? getUserTripForRaceAction(userId, raceRow.id)
      : Promise.resolve(null),
    raceHasTicketListingsAction(raceRow.id),
    getGrandstandsByCircuitAction(circuitData.id)
  ])
  const coverage = coverageResult.isSuccess
    ? (coverageResult.data[0] ?? null)
    : null

  let existingTripId: string | undefined
  if (tripResult && tripResult.isSuccess && tripResult.data) {
    existingTripId = tripResult.data.id
  }

  // Convert to RaceWithDetails
  const raceWithDetails: RaceWithDetails = {
    ...raceRow,
    status: raceRow.status,
    circuit: circuitData
      ? {
          id: circuitData.id,
          name: circuitData.name,
          location: circuitData.location,
          country: circuitData.country,
          latitude: Number(circuitData.latitude),
          longitude: Number(circuitData.longitude),
          image_url: circuitData.imageUrl,
          track_map_url: circuitData.trackMapUrl,
          openf1_key: circuitData.openf1Key,
          openf1_short_name: circuitData.openf1ShortName,
          timezone_id: circuitData.timezoneId,
          timezone_name: circuitData.timezoneName,
          created_at: circuitData.createdAt.toISOString(),
          updated_at: circuitData.updatedAt.toISOString(),
          website_url: circuitData.websiteUrl,
          details: circuitData.details
            ? {
                id: circuitData.details.id,
                circuit_id: circuitData.details.circuitId,
                length: Number(circuitData.details.length),
                corners: circuitData.details.corners,
                drs_zones: circuitData.details.drsZones,
                lap_record_time: circuitData.details.lapRecordTime,
                lap_record_year: circuitData.details.lapRecordYear,
                lap_record_driver: circuitData.details.lapRecordDriver,
                created_at: circuitData.details.createdAt.toISOString(),
                updated_at: circuitData.details.updatedAt.toISOString()
              }
            : undefined,
          locations: circuitData.locations?.map(location => ({
            ...location,
            created_at: location.createdAt.toISOString(),
            updated_at: location.updatedAt.toISOString()
          })),
          local_attractions: circuitData.local_attractions?.map(attraction => ({
            id: attraction.id,
            circuit_id: attraction.circuitId,
            name: attraction.name,
            description: attraction.description,
            latitude: attraction.latitude ? Number(attraction.latitude) : null,
            longitude: attraction.longitude
              ? Number(attraction.longitude)
              : null,
            distance_from_circuit: attraction.distance_from_circuit
              ? Number(attraction.distance_from_circuit)
              : null,
            distance_from_city: attraction.distance_from_city
              ? Number(attraction.distance_from_city)
              : null,
            estimated_duration: attraction.estimated_duration || null,
            recommended_times: attraction.recommended_times || null,
            booking_required: attraction.booking_required || false,
            price_range: attraction.price_range || null,
            f1_relevance: attraction.f1_relevance || null,
            peak_times: attraction.peak_times || null,
            created_at: attraction.createdAt.toISOString(),
            updated_at: attraction.updatedAt.toISOString()
          })),
          transport_info: circuitData.transport_info?.map(info => ({
            id: info.id,
            circuit_id: info.circuitId,
            type: info.type,
            name: info.name,
            description: info.description,
            options: info.options,
            created_at: info.createdAt.toISOString(),
            updated_at: info.updatedAt.toISOString()
          }))
        }
      : null
  }

  return (
    <RaceDetailsPage
      race={raceWithDetails}
      showHero={false}
      initialTab={initialTab}
      userId={userId}
      existingTripId={existingTripId}
      history={historyResult.isSuccess ? historyResult.data : undefined}
      coverage={coverage}
      ticketListings={hasTicketListings ? "listed" : "empty"}
      grandstandHref={
        grandstandsResult.isSuccess
          ? grandstandHrefForRace({
              circuitName: circuitData.name,
              grandstandCount: grandstandsResult.data.length,
              raceSeriesSlug: raceRow.series?.slug
            })
          : null
      }
    />
  )
}
