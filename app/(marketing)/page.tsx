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
import TestimonialSection from "@/components/TestimonialSection"
import FaqSection from "@/components/FaqSection"
import CtaSection from "@/components/CtaSection"
import dynamic from "next/dynamic"
import CircuitExplorerSkeleton from "@/components/skeletons/circuit-explorer-skeleton"
import TestimonialSectionSkeleton from "@/components/skeletons/testimonial-section-skeleton"
import { Metadata } from "next"
import { brand } from "@/config/brand"

const homeTitle = `${brand.name} | ${brand.tagline}`

export const metadata: Metadata = {
  title: homeTitle,
  description: brand.description,
  keywords: brand.seriesKeywords.join(", "),
  openGraph: {
    title: homeTitle,
    description: brand.shortDescription,
    type: "website",
    locale: "en_US",
    siteName: brand.name
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: brand.shortDescription
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

  // Dynamically import components that are not needed for initial render
  const DynamicCircuitExplorer = dynamic(
    () => import("@/components/CircuitExplorer"),
    {
      loading: () => <CircuitExplorerSkeleton />
    }
  )

  const DynamicTestimonialSection = dynamic(
    () => import("@/components/TestimonialSection"),
    {
      loading: () => <TestimonialSectionSkeleton />
    }
  )

  return (
    <div className="pb-20">
      <HeroSection />
      <UpcomingRaces
        races={upcomingRaces || []}
        coverageByRaceId={coverageMap}
      />
      <WhyChooseFeaturesSection />
      <DynamicCircuitExplorer />
      <FeaturesSection />
      <DynamicTestimonialSection />
      <FaqSection />
      <CtaSection />
    </div>
  )
}
