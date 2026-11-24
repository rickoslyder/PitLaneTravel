import { canonicalUrl } from "@/lib/site-metadata"

export type RaceTrailCrumb = {
  name: string
  path: string
}

const home: RaceTrailCrumb = { name: "Home", path: "/" }
const races: RaceTrailCrumb = { name: "Races", path: "/races" }

/** Home > Races. The calendar index is the current page. */
export const racesIndexTrail: readonly RaceTrailCrumb[] = [home, races]

/** Home > Races > race. */
export function raceDetailTrail(
  name: string,
  path: string
): readonly RaceTrailCrumb[] {
  return [home, races, { name, path }]
}

/** Home > Races > race > History. */
export function raceHistoryTrail(
  name: string,
  racePath: string
): readonly RaceTrailCrumb[] {
  return [
    ...raceDetailTrail(name, racePath),
    { name: "History", path: `${racePath}/history` }
  ]
}

export const raceMapTrail: readonly RaceTrailCrumb[] = [
  home,
  races,
  { name: "Map", path: "/races/map" }
]

export const raceCompareTrail: readonly RaceTrailCrumb[] = [
  home,
  races,
  { name: "Compare", path: "/races/compare" }
]

/**
 * Public destinations that used to live only in the race-page sidebar.
 * Group trips, past trips, local area, and track weather have no pages.
 */
export const racePlanningLinks = [
  { label: "Race map", href: "/races/map" },
  { label: "Compare races", href: "/races/compare" },
  { label: "Hotels", href: "/hotels" },
  { label: "Transport", href: "/transport" }
] as const

export function buildRaceTrailJsonLd(items: readonly RaceTrailCrumb[]) {
  return {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path)
    }))
  }
}
