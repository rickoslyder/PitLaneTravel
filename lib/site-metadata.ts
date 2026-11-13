import type { Metadata } from "next"
import { brand } from "@/config/brand"

export const SITE_ORIGIN = "https://www.pitlanetravel.com"

/** Existing home hero. Reused as the default Open Graph image. */
export const DEFAULT_OG_IMAGE_PATH = "/images/home-hero.jpg"
export const DEFAULT_OG_IMAGE_URL = `${SITE_ORIGIN}${DEFAULT_OG_IMAGE_PATH}`

const DEFAULT_OG_IMAGE = {
  url: DEFAULT_OG_IMAGE_URL,
  alt: brand.name
} as const

/**
 * Absolute production canonical. Query strings and hashes are stripped so a
 * race page that lands on `?tab=info` still canonicalizes to the path.
 */
export function canonicalUrl(pathname: string): string {
  const pathOnly = pathname.split("#", 1)[0]?.split("?", 1)[0] ?? "/"
  const withLeading = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`
  const trimmed =
    withLeading.length > 1 && withLeading.endsWith("/")
      ? withLeading.slice(0, -1)
      : withLeading
  return `${SITE_ORIGIN}${trimmed}`
}

export function pageSeo(pathname: string): {
  alternates: NonNullable<Metadata["alternates"]>
  openGraph: {
    url: string
    images: Array<{ url: string; alt: string }>
  }
} {
  const canonical = canonicalUrl(pathname)
  return {
    alternates: { canonical },
    openGraph: {
      url: canonical,
      images: [{ ...DEFAULT_OG_IMAGE }]
    }
  }
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

export function buildOrganizationJsonLd(description: string) {
  return {
    "@context": "https://schema.org" as const,
    "@type": "Organization" as const,
    name: brand.name,
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/android-chrome-512x512.png`,
    description
  }
}

export function buildWebSiteJsonLd(description: string) {
  return {
    "@context": "https://schema.org" as const,
    "@type": "WebSite" as const,
    name: brand.name,
    url: SITE_ORIGIN,
    description
  }
}

export function buildWebPageJsonLd(input: {
  name: string
  description: string
  pathname: string
}) {
  return {
    "@context": "https://schema.org" as const,
    "@type": "WebPage" as const,
    name: input.name,
    description: input.description,
    url: canonicalUrl(input.pathname),
    isPartOf: {
      "@type": "WebSite" as const,
      name: brand.name,
      url: SITE_ORIGIN
    }
  }
}

export type SportsEventJsonLdInput = {
  name: string
  startDate: string
  endDate?: string | null
  status?: string | null
  url: string
  sport?: string | null
  locationName?: string | null
  addressLocality?: string | null
  addressCountry?: string | null
  image?: string | null
}

/**
 * SportsEvent for a race detail page. Returns null when the name or start
 * instant is missing so we do not publish an empty event.
 */
export function buildSportsEventJsonLd(input: SportsEventJsonLdInput) {
  const name = input.name.trim()
  const startDate = input.startDate.trim()
  if (!name || !startDate) return null

  const locationName = input.locationName?.trim()
  const locality = input.addressLocality?.trim()
  const country = input.addressCountry?.trim()
  const sport = input.sport?.trim()
  const endDate = input.endDate?.trim()

  return {
    "@context": "https://schema.org" as const,
    "@type": "SportsEvent" as const,
    name,
    startDate,
    ...(endDate ? { endDate } : {}),
    ...(sport ? { sport } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus:
      input.status === "cancelled"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    url: canonicalUrl(input.url),
    image: input.image?.trim() || DEFAULT_OG_IMAGE_URL,
    ...(locationName || locality || country
      ? {
          location: {
            "@type": "Place" as const,
            ...(locationName ? { name: locationName } : {}),
            ...(locality || country
              ? {
                  address: {
                    "@type": "PostalAddress" as const,
                    ...(locality ? { addressLocality: locality } : {}),
                    ...(country ? { addressCountry: country } : {})
                  }
                }
              : {})
          }
        }
      : {})
  }
}
