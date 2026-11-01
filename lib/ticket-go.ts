/** Same-origin hop that records a ticket redirect only when the buyer navigates. */
export function ticketGoHref(ticketId: number): string {
  return `/go/${ticketId}`
}

/** Seller destinations must be absolute http(s) URLs. */
export function sellerRedirectUrl(
  value: string | null | undefined
): string | null {
  if (!value) return null
  try {
    const url = new URL(value.trim())
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return url.toString()
  } catch {
    return null
  }
}
