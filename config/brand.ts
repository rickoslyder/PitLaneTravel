/*
<ai_context>
Central brand + SEO copy. Keeps user-facing strings series-neutral now that the platform
covers multiple championships (F1, Formula E, MotoGP, IndyCar, WEC). Per-series pages
generate their own metadata from the `series` table; this is the umbrella copy.
</ai_context>
*/

// Styling choice remains unresolved. This is the temporary display value.
const temporaryDisplayName = "PitLane Travel"

const seriesKeywordsNone = [
  "F1 travel",
  "Formula 1 calendar",
  "MotoGP travel",
  "Formula E travel",
  "IndyCar travel",
  "WEC travel",
  "grandstand guides",
  "race calendar",
  "race weekend planning",
  "F1 tickets",
  "MotoGP tickets",
  "race travel guides"
] as const

const seriesKeywordsLive = [
  ...seriesKeywordsNone,
  "F1 packages",
  "MotoGP packages",
  "F1 hospitality",
  "MotoGP hospitality"
] as const

export const brand = {
  name: temporaryDisplayName,
  tagline: "Go like you've been before.",
  homeTitleTerms: "F1 & MotoGP Tickets and Race Guides",
  positioningShort:
    "Go like you've been before. Tickets and race guides for Formula 1, MotoGP, IndyCar, WEC and Formula E.",
  affiliateDisclosureShort: `Some external supplier links may be affiliate links and may pay ${temporaryDisplayName} a commission. Provider terms apply.`,
  // Series called out for SEO reach. F1 stays first as the flagship.
  seriesKeywords: seriesKeywordsNone,
  description:
    "Tickets and race travel guides for F1, MotoGP, IndyCar, WEC and Formula E. Where to sit, where to stay and the quickest way home after the flag.",
  shortDescription:
    "Go like you've been before: tickets and race guides for Formula 1, MotoGP, IndyCar, WEC and Formula E."
} as const

export const brandPackagesLive = {
  homeTitleTerms: "F1 & MotoGP Packages, Tickets & Hospitality",
  positioningShort:
    "Go like you've been before. Tickets and race guides for Formula 1, MotoGP, IndyCar, WEC and Formula E, plus F1 and MotoGP packages and VIP hospitality.",
  seriesKeywords: seriesKeywordsLive,
  description:
    "F1 and MotoGP race packages and VIP hospitality, plus tickets and travel guides for IndyCar, WEC and Formula E. Where to sit, stay and get home.",
  shortDescription:
    "Go like you've been before: F1 and MotoGP packages and VIP hospitality, plus tickets and race guides for IndyCar, WEC and Formula E."
} as const

export type BrandCopy = {
  tagline: string
  homeTitleTerms: string
  positioningShort: string
  description: string
  shortDescription: string
  seriesKeywords: readonly string[]
}

export function brandCopy(live: boolean): BrandCopy {
  if (!live) {
    return {
      tagline: brand.tagline,
      homeTitleTerms: brand.homeTitleTerms,
      positioningShort: brand.positioningShort,
      description: brand.description,
      shortDescription: brand.shortDescription,
      seriesKeywords: brand.seriesKeywords
    }
  }

  return {
    tagline: brand.tagline,
    homeTitleTerms: brandPackagesLive.homeTitleTerms,
    positioningShort: brandPackagesLive.positioningShort,
    description: brandPackagesLive.description,
    shortDescription: brandPackagesLive.shortDescription,
    seriesKeywords: brandPackagesLive.seriesKeywords
  }
}
