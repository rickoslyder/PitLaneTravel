/*
<ai_context>
This server page is the marketing homepage.
</ai_context>
*/

import { FeaturesSection } from "@/components/landing/features"
import { HeroSection } from "@/components/landing/hero"
import { UpcomingRaces } from "@/components/landing/upcoming-races"
import { getRacesAction } from "@/actions/db/races-actions"
import WhyChooseFeaturesSection from "@/components/WhyChooseFeaturesSection"
import TestimonialSection from "@/components/TestimonialSection"
import FaqSection from "@/components/FaqSection"
import CtaSection from "@/components/CtaSection"
import dynamic from "next/dynamic"
import CircuitExplorerSkeleton from "@/components/skeletons/circuit-explorer-skeleton"
import TestimonialSectionSkeleton from "@/components/skeletons/testimonial-section-skeleton"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "PitLane Travel | Your Ultimate F1 Race Weekend Planning Platform",
  description:
    "Plan your perfect Formula 1 race weekend with expert travel packages, exclusive experiences, and seamless booking. Get comprehensive circuit guides, smart flight search tools, and tailored travel recommendations.",
  keywords:
    "F1 travel, Formula 1 tickets, race weekend planning, F1 experiences, grand prix packages, circuit guides",
  openGraph: {
    title: "PitLane Travel | Your Ultimate F1 Race Weekend Planning Platform",
    description:
      "Plan your perfect Formula 1 race weekend with expert travel packages, exclusive experiences, and seamless booking.",
    type: "website",
    locale: "en_US",
    siteName: "PitLane Travel"
  },
  twitter: {
    card: "summary_large_image",
    title: "PitLane Travel | Your Ultimate F1 Race Weekend Planning Platform",
    description:
      "Plan your perfect Formula 1 race weekend with expert travel packages, exclusive experiences, and seamless booking."
  }
}

export default async function HomePage() {
  const { data: upcomingRaces } = await getRacesAction({
    startDate: new Date().toISOString()
  })

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
      <UpcomingRaces races={upcomingRaces || []} />
      <WhyChooseFeaturesSection />
      <DynamicCircuitExplorer />
      <FeaturesSection />
      <DynamicTestimonialSection />
      <FaqSection />
      <CtaSection />
    </div>
  )
}
