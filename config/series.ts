/*
<ai_context>
Canonical definitions of the racing series the platform covers. Used to seed the
`series` table (scripts/seed-series.ts) and as a fallback for UI that needs series
metadata before the DB round-trips. Keep in sync with the DB; the DB is the source of
truth at runtime.
</ai_context>
*/

export interface SeriesDefinition {
  name: string
  shortName: string
  slug: string
  governingBody: string
  eventNoun: string
  seasonLabel: string
  accentColor: string
  dataProvider: "openf1" | "manual"
  sortOrder: number
  description: string
}

export const SERIES: SeriesDefinition[] = [
  {
    name: "Formula 1",
    shortName: "F1",
    slug: "f1",
    governingBody: "FIA",
    eventNoun: "Grand Prix",
    seasonLabel: "FIA Formula One World Championship",
    accentColor: "#e10600",
    dataProvider: "openf1",
    sortOrder: 0,
    description:
      "The pinnacle of single-seater motorsport, visiting iconic circuits across the globe."
  },
  {
    name: "Formula E",
    shortName: "FE",
    slug: "formula-e",
    governingBody: "FIA",
    eventNoun: "E-Prix",
    seasonLabel: "FIA Formula E World Championship",
    accentColor: "#00b1eb",
    dataProvider: "manual",
    sortOrder: 1,
    description:
      "All-electric single-seaters racing on street circuits in the heart of major cities."
  },
  {
    name: "MotoGP",
    shortName: "MotoGP",
    slug: "motogp",
    governingBody: "FIM",
    eventNoun: "Grand Prix",
    seasonLabel: "FIM MotoGP World Championship",
    accentColor: "#cc0000",
    dataProvider: "manual",
    sortOrder: 2,
    description:
      "The premier class of motorcycle road racing, with grand prix events worldwide."
  },
  {
    name: "IndyCar",
    shortName: "IndyCar",
    slug: "indycar",
    governingBody: "IndyCar",
    eventNoun: "Grand Prix",
    seasonLabel: "NTT IndyCar Series",
    accentColor: "#0033a0",
    dataProvider: "manual",
    sortOrder: 3,
    description:
      "North America's premier open-wheel series, mixing ovals, road courses and street circuits."
  },
  {
    name: "World Endurance Championship",
    shortName: "WEC",
    slug: "wec",
    governingBody: "FIA / ACO",
    eventNoun: "Round",
    seasonLabel: "FIA World Endurance Championship",
    accentColor: "#00843d",
    dataProvider: "manual",
    sortOrder: 4,
    description:
      "Endurance sportscar racing, home of the 24 Hours of Le Mans and the Hypercar class."
  }
]

export const SERIES_BY_SLUG: Record<string, SeriesDefinition> = Object.fromEntries(
  SERIES.map(s => [s.slug, s])
)
