/**
 * Full-bleed race hero on the default Lighthouse phone (412 CSS px, 1.75 DPR).
 * 412 × 1.75 = 721 device pixels, so next/image selects the 750 candidate.
 * A preload with an href is what the preload scanner fetches. The imagesrcset
 * link next/image emits has no href, and the scanner skips it.
 * The media query is the same box as the series-card preload so a wider phone
 * does not download 750 and the srcset candidate together.
 */
export const RACE_HERO_LCP_WIDTH = 750
export const RACE_HERO_LCP_QUALITY = 65

export const RACE_HERO_LCP_PRELOAD_MEDIA =
  "(min-width: 400px) and (max-width: 430px) and (min-resolution: 1.5dppx) and (max-resolution: 1.75dppx)"

export function raceHeroLcpHref(src: string | null | undefined): string | null {
  const value = src?.trim()
  if (!value) return null
  return `/_next/image?url=${encodeURIComponent(value)}&w=${RACE_HERO_LCP_WIDTH}&q=${RACE_HERO_LCP_QUALITY}`
}
