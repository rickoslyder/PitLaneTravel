/*
<ai_context>
This server page is the marketing homepage.
</ai_context>
*/

"use server"

import { FeaturesSection } from "@/components/landing/features"
import { HeroSection } from "@/components/landing/hero"
import { UpcomingRaces } from "@/components/landing/upcoming-races"
import { getRacesAction } from "@/actions/db/races-actions"

export default async function HomePage() {
  const { data: upcomingRaces } = await getRacesAction({
    startDate: new Date().toISOString()
  })

  return (
    <div className="pb-20">
      <HeroSection />
      <UpcomingRaces races={upcomingRaces || []} />
      {/* social proof */}
      <FeaturesSection />
      {/* pricing */}
      {/* faq */}
      {/* blog */}
      {/* footer */}
    </div>
  )
}
