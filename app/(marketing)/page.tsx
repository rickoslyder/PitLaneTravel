/*
<ai_context>
This server page is the marketing homepage.
</ai_context>
*/

import { Suspense } from "react"
import { HeroFrame } from "@/components/landing/hero-frame"
import {
  HeroCountdown,
  HeroCountdownFallback,
  HeroSection,
  HeroStats
} from "@/components/landing/hero"
import { getRacesAction } from "@/actions/db/races-actions"
import { isActiveRaceStatus, selectNextCountdownRace } from "@/lib/race-status"
import { getPublicCoverageSummariesAction } from "@/actions/db/public-coverage-actions"
import { coverageByRaceId } from "@/lib/public-coverage"
import dynamic from "next/dynamic"
import CircuitExplorerSkeleton from "@/components/skeletons/circuit-explorer-skeleton"
import { Metadata } from "next"
import { brand, brandCopy } from "@/config/brand"
import { getPackagesAvailability } from "@/lib/packages-availability"
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  pageSeo,
  serializeJsonLd
} from "@/lib/site-metadata"
import { timeLeftUntil, type HeroCountdownSeed } from "@/lib/countdown"
import {
  HOME_HERO_MOBILE_AVIF_HREF,
  HOME_HERO_MOBILE_AVIF_PRELOAD
} from "@/lib/home-hero-image"

const UpcomingRaces = dynamic(() =>
  import("@/components/landing/upcoming-races").then(mod => mod.UpcomingRaces)
)
const WhyChooseFeaturesSection = dynamic(
  () => import("@/components/WhyChooseFeaturesSection")
)
const FeaturesSection = dynamic(() =>
  import("@/components/landing/features").then(mod => mod.FeaturesSection)
)
const FaqSection = dynamic(() => import("@/components/FaqSection"))
const CtaSection = dynamic(() => import("@/components/CtaSection"))
const DynamicCircuitExplorer = dynamic(
  () => import("@/components/CircuitExplorer"),
  {
    loading: () => <CircuitExplorerSkeleton />
  }
)

export async function generateMetadata(): Promise<Metadata> {
  const availability = await getPackagesAvailability()
  const copy = brandCopy(availability.siteWide)
  const homeTitle = `${copy.homeTitleTerms} | ${brand.name}`
  const seo = pageSeo("/")

  return {
    title: homeTitle,
    description: copy.description,
    keywords: copy.seriesKeywords.join(", "),
    alternates: seo.alternates,
    openGraph: {
      title: homeTitle,
      description: copy.shortDescription,
      type: "website",
      locale: "en_US",
      siteName: brand.name,
      url: seo.openGraph.url,
      images: seo.openGraph.images
    },
    twitter: {
      card: "summary_large_image",
      title: homeTitle,
      description: copy.shortDescription
    }
  }
}

function countdownSeed(
  race:
    | {
        name: string
        date: Date | string
        circuit?: { name?: string | null } | null
      }
    | undefined,
  now: Date
): HeroCountdownSeed | null {
  if (!race) return null
  return {
    name: race.name,
    date: new Date(race.date).toISOString(),
    circuitName: race.circuit?.name ?? null,
    initialTime: timeLeftUntil(race.date, now)
  }
}

function HomeHeroPreload() {
  // ReactDOM.preload() does not emit a tag from this server page.
  // Next hoists this link into <head>.
  return (
    <link
      rel="preload"
      href={HOME_HERO_MOBILE_AVIF_HREF}
      as={HOME_HERO_MOBILE_AVIF_PRELOAD.as}
      type={HOME_HERO_MOBILE_AVIF_PRELOAD.type}
      media={HOME_HERO_MOBILE_AVIF_PRELOAD.media}
      fetchPriority={HOME_HERO_MOBILE_AVIF_PRELOAD.fetchPriority}
    />
  )
}

export default async function HomePage() {
  // Kick off the calendar read now, but do not block the hero on it.
  // The mobile LCP image is the hero photo; races and coverage stream in after.
  const racesPromise = getRacesAction({
    excludeCancelled: true
  })
  const { siteWide } = await getPackagesAvailability()
  const copy = brandCopy(siteWide)

  return (
    <>
      <HomeHeroPreload />
      <div className="pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildOrganizationJsonLd(copy.description))
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildWebSiteJsonLd(copy.description))
          }}
        />
        <HeroFrame>
          <HeroSection packagesLive={siteWide}>
            <Suspense fallback={<HeroCountdownFallback />}>
              <HomeCountdown racesPromise={racesPromise} />
            </Suspense>
          </HeroSection>
        </HeroFrame>
        <HeroStats />
        <Suspense fallback={null}>
          <HomeBelow racesPromise={racesPromise} siteWide={siteWide} />
        </Suspense>
      </div>
    </>
  )
}

async function HomeCountdown({
  racesPromise
}: {
  racesPromise: ReturnType<typeof getRacesAction>
}) {
  const { data: races } = await racesPromise
  const upcomingRaces = (races ?? []).filter(race =>
    isActiveRaceStatus(race.status)
  )
  const now = new Date()
  const countdown = countdownSeed(
    selectNextCountdownRace(upcomingRaces, now),
    now
  )
  if (!countdown) return null
  return <HeroCountdown countdown={countdown} />
}

async function HomeBelow({
  racesPromise,
  siteWide
}: {
  racesPromise: ReturnType<typeof getRacesAction>
  siteWide: boolean
}) {
  const { data: races } = await racesPromise
  const upcomingRaces = (races ?? []).filter(race =>
    isActiveRaceStatus(race.status)
  )
  const coverageResult = await getPublicCoverageSummariesAction(
    upcomingRaces.map(race => race.id)
  )
  const coverageMap = coverageResult.isSuccess
    ? coverageByRaceId(coverageResult.data)
    : {}

  return (
    <>
      <UpcomingRaces
        races={upcomingRaces || []}
        coverageByRaceId={coverageMap}
      />
      <WhyChooseFeaturesSection packagesLive={siteWide} />
      <DynamicCircuitExplorer />
      <FeaturesSection packagesLive={siteWide} />
      <FaqSection packagesLive={siteWide} />
      <CtaSection />
    </>
  )
}
