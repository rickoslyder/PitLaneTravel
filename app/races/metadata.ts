import { Metadata } from "next"
import { pageSeo } from "@/lib/site-metadata"

export const racesPageTitle = "Motorsport Race Calendar | PitLane Travel"
export const racesPageDescription =
  "The full race calendar across Formula 1, MotoGP, Formula E, IndyCar and WEC. Compare venues, explore circuits, and plan your race weekend with confidence."

const seo = pageSeo("/races")

export const metadata: Metadata = {
  title: racesPageTitle,
  description: racesPageDescription,
  alternates: seo.alternates,
  openGraph: {
    title: racesPageTitle,
    description: racesPageDescription,
    type: "website",
    url: seo.openGraph.url,
    images: seo.openGraph.images
  }
}
