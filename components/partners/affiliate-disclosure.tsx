import { brand } from "@/config/brand"

/**
 * Shown only when an affiliate link is actually on the page (issue #39).
 * Copy stays the conditional brand sentence: some links may pay a commission.
 */
export function AffiliateDisclosure({
  partners = []
}: {
  partners?: string[]
}) {
  return (
    <aside
      aria-label="Affiliate disclosure"
      className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <p>{brand.affiliateDisclosureShort}</p>
      {partners.length > 0 && (
        <p className="mt-1">
          Tagged links on this page go to {partners.join(", ")}.
        </p>
      )}
    </aside>
  )
}
