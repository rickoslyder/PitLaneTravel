/*
<ai_context>
Central brand + SEO copy. Keeps user-facing strings series-neutral now that the platform
covers multiple championships (F1, Formula E, MotoGP, IndyCar, WEC). Per-series pages
generate their own metadata from the `series` table; this is the umbrella copy.
</ai_context>
*/

export const brand = {
  name: "PitLane Travel",
  tagline: "Your ultimate motorsport travel planning platform",
  // Series called out for SEO reach. F1 stays first as the flagship.
  seriesKeywords: [
    "F1 travel",
    "Formula 1 tickets",
    "MotoGP tickets",
    "Formula E travel",
    "IndyCar tickets",
    "WEC Le Mans travel",
    "grand prix packages",
    "grandstand guides",
    "race weekend planning"
  ],
  description:
    "Plan your perfect race weekend across Formula 1, MotoGP, Formula E, IndyCar and WEC. Compare tickets and grandstands, find flights and accommodation, and get expert circuit guides — all in one place.",
  shortDescription:
    "Race tickets, grandstand guides, flights and accommodation for motorsport fans worldwide."
} as const
