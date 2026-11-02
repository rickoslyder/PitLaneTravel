import { ticketOutboundRel } from "@/lib/ticket-affiliate"

const IMPACT_SUFFIXES = [".pxf.io", ".sjv.io"]

/** Impact (and the same class of) affiliate hosts used in guide copy. */
export function isImpactAffiliateHref(href: string): boolean {
  try {
    const host = new URL(href).hostname.toLowerCase().replace(/^www\./, "")
    return IMPACT_SUFFIXES.some(
      suffix => host === suffix.slice(1) || host.endsWith(suffix)
    )
  } catch {
    return false
  }
}

/** Same rel string PR #102 uses for affiliate ticket links. */
export function guideAffiliateRel(href: string): string | null {
  if (!isImpactAffiliateHref(href)) return null
  return ticketOutboundRel("Impact")
}
