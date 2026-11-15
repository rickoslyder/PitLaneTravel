/** Mobile LCP candidate. The home server page preloads this into <head>. */
export const HOME_HERO_MOBILE_AVIF_HREF = "/images/home-hero-828.avif"

export const HOME_HERO_MOBILE_AVIF_PRELOAD = {
  as: "image",
  fetchPriority: "high",
  type: "image/avif",
  media: "(max-width: 828px)"
} as const
