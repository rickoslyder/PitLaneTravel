/**
 * Disclosed official ticket stores, keyed by series slug.
 * Starts empty. Add a URL only after that series' seller page has been sourced.
 */
export const officialTicketSellers: Readonly<Record<string, string>> = {}

export function officialTicketSellerUrl(
  seriesSlug: string | null | undefined,
  sellers: Readonly<Record<string, string>> = officialTicketSellers
): string | null {
  if (!seriesSlug) return null
  const value = sellers[seriesSlug.trim().toLowerCase()]?.trim()
  return value ? value : null
}
