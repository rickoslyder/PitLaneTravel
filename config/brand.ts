/*
<ai_context>
Central brand + SEO copy. Keeps user-facing strings series-neutral now that the platform
covers multiple championships (F1, Formula E, MotoGP, IndyCar, WEC). Per-series pages
generate their own metadata from the `series` table; this is the umbrella copy.
</ai_context>
*/

// Styling choice remains unresolved. This is the temporary display value.
const temporaryDisplayName = "PitLane Travel"

export const brand = {
  name: temporaryDisplayName,
  tagline: "Decision layer for self-directed motorsport trips",
  positioningShort:
    "A decision layer for self-directed travellers. Compare races across Formula 1, Formula E, MotoGP, IndyCar and WEC, then hand off to external suppliers.",
  affiliateDisclosureShort: `Some external supplier links may be affiliate links and may pay ${temporaryDisplayName} a commission. Provider terms apply.`,
  // Series called out for SEO reach. F1 stays first as the flagship.
  seriesKeywords: [
    "F1 travel",
    "Formula 1 calendar",
    "MotoGP travel",
    "Formula E travel",
    "IndyCar travel",
    "WEC travel",
    "grandstand guides",
    "race calendar",
    "race weekend planning"
  ],
  description:
    "Compare and plan race weekends across Formula 1, Formula E, MotoGP, IndyCar and WEC. Browse the calendar, open race and circuit pages where coverage exists, and use planning tools with labelled external search handoffs.",
  shortDescription:
    "Compare and plan motorsport trips across Formula 1, Formula E, MotoGP, IndyCar and WEC."
} as const
