import { brand } from "@/config/brand"

/**
 * Shown only when an affiliate link is actually on the page (issue #39).
 * Copy stays the conditional brand sentence: some links may pay a commission.
 */
export function affiliateDisclosureCopy(partners: readonly string[] = []): {
  lead: string
  detail: string | null
} {
  if (partners.length === 0) {
    return { lead: brand.affiliateDisclosureShort, detail: null }
  }
  const names =
    partners.length === 1
      ? partners[0]
      : `${partners.slice(0, -1).join(", ")} and ${partners[partners.length - 1]}`
  return {
    lead: `Links to ${names} are affiliate links.`,
    detail: `They may pay ${brand.name} a commission. Provider terms apply.`
  }
}

export function AffiliateDisclosure({
  partners = []
}: {
  partners?: string[]
}) {
  const copy = affiliateDisclosureCopy(partners)
  return (
    <aside
      aria-label="Affiliate disclosure"
      className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <p>{copy.lead}</p>
      {copy.detail && <p className="mt-1">{copy.detail}</p>}
    </aside>
  )
}
