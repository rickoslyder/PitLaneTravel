/*
<ai_context>
This server page is the marketing homepage.
</ai_context>
*/

import { FeaturesSection } from "@/components/landing/features"
import { HeroSection } from "@/components/landing/hero"
import { UpcomingRaces } from "@/components/landing/upcoming-races"
import { getRacesAction } from "@/actions/db/races-actions"
import { isActiveRaceStatus } from "@/lib/race-status"
import { getPublicCoverageSummariesAction } from "@/actions/db/public-coverage-actions"
import { coverageByRaceId } from "@/lib/public-coverage"
import WhyChooseFeaturesSection from "@/components/WhyChooseFeaturesSection"
import FaqSection from "@/components/FaqSection"
import CtaSection from "@/components/CtaSection"
import dynamic from "next/dynamic"
import CircuitExplorerSkeleton from "@/components/skeletons/circuit-explorer-skeleton"
import { Metadata } from "next"
import { brand, brandCopy } from "@/config/brand"
import { getPackagesAvailability } from "@/lib/packages-availability"

export async function generateMetadata(): Promise<Metadata> {
  const availability = await getPackagesAvailability()
  const copy = brandCopy(availability.siteWide)
  const homeTitle = `${copy.homeTitleTerms} | ${brand.name}`

  return {
    title: homeTitle,
    description: copy.description,
    keywords: copy.seriesKeywords.join(", "),
    openGraph: {
      title: homeTitle,
      description: copy.shortDescription,
      type: "website",
      locale: "en_US",
      siteName: brand.name
    },
    twitter: {
      card: "summary_large_image",
      title: homeTitle,
      description: copy.shortDescription
    }
  }
}

export default async function HomePage() {
  const { data: races } = await getRacesAction({
    excludeCancelled: true
  })
  const upcomingRaces = (races ?? []).filter(race => isActiveRaceStatus(race.status))
  const coverageResult = await getPublicCoverageSummariesAction(
    upcomingRaces.map(race => race.id)
  )
  const coverageMap = coverageResult.isSuccess
    ? coverageByRaceId(coverageResult.data)
    : {}
  const { siteWide } = await getPackagesAvailability()

  // Dynamically import components that are not needed for initial render
  const DynamicCircuitExplorer = dynamic(
    () => import("@/components/CircuitExplorer"),
    {
      loading: () => <CircuitExplorerSkeleton />
    }
  )

  return (
    <div className="pb-20">
      <HeroSection packagesLive={siteWide} />
      <UpcomingRaces
        races={upcomingRaces || []}
        coverageByRaceId={coverageMap}
      />
      <WhyChooseFeaturesSection packagesLive={siteWide} />
      <DynamicCircuitExplorer />
      <FeaturesSection packagesLive={siteWide} />
      <FaqSection packagesLive={siteWide} />
      <CtaSection />
    </div>
  )
}
