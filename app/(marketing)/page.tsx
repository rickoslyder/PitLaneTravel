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
import { isActiveRaceStatus } from "@/lib/race-status"
import { getPublicCoverageSummariesAction } from "@/actions/db/public-coverage-actions"
import { coverageByRaceId } from "@/lib/public-coverage"
import nextDynamic from "next/dynamic"
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
import { buildHeroCountdownSeed } from "@/lib/countdown"
import {
  HOME_HERO_MOBILE_AVIF_HREF,
  HOME_HERO_MOBILE_AVIF_PRELOAD
} from "@/lib/home-hero-image"

export const dynamic = "force-dynamic"

const UpcomingRaces = nextDynamic(() =>
  import("@/components/landing/upcoming-races").then(mod => mod.UpcomingRaces)
)
const WhyChooseFeaturesSection = nextDynamic(
  () => import("@/components/WhyChooseFeaturesSection")
)
const FeaturesSection = nextDynamic(() =>
  import("@/components/landing/features").then(mod => mod.FeaturesSection)
)
const FaqSection = nextDynamic(() => import("@/components/FaqSection"))
const CtaSection = nextDynamic(() => import("@/components/CtaSection"))
const DynamicCircuitExplorer = nextDynamic(
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

export default function HomePage() {
  // The photo is in HeroFrame, outside this suspense boundary, so the LCP
  // image is in the first HTML chunk. Package copy streams into the overlay.
  const racesPromise = getRacesAction({
    excludeCancelled: true
  })

  return (
    <>
      <HomeHeroPreload />
      <div className="pb-20">
        <HeroFrame>
          <Suspense
            fallback={
              <HeroSection packagesLive={false}>
                <HeroCountdownFallback />
              </HeroSection>
            }
          >
            <HomeHero racesPromise={racesPromise} />
          </Suspense>
        </HeroFrame>
        <HeroStats />
        <Suspense fallback={null}>
          <HomeBelow racesPromise={racesPromise} />
        </Suspense>
      </div>
    </>
  )
}

async function HomeHero({
  racesPromise
}: {
  racesPromise: ReturnType<typeof getRacesAction>
}) {
  const { siteWide } = await getPackagesAvailability()
  const copy = brandCopy(siteWide)

  return (
    <>
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
      <HeroSection packagesLive={siteWide}>
        <Suspense fallback={<HeroCountdownFallback />}>
          <HomeCountdown racesPromise={racesPromise} />
        </Suspense>
      </HeroSection>
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
  const countdown = buildHeroCountdownSeed(upcomingRaces, new Date())
  if (!countdown) return null
  return <HeroCountdown countdown={countdown} />
}

async function HomeBelow({
  racesPromise
}: {
  racesPromise: ReturnType<typeof getRacesAction>
}) {
  const { siteWide } = await getPackagesAvailability()
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
