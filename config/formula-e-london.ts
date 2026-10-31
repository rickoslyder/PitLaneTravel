/**
 * Evergreen Formula E London venue note.
 * The 2026 London E-Prix stays at ExCeL. This copy is for series pages, circuit
 * guides, and other venue text that is not a single 2026 race row.
 */
export const FORMULA_E_LONDON_VENUE_NOTE =
  "Formula E London moves to Brands Hatch for Season 13 (29-30 May 2027, provisional)."

export function isEvergreenFormulaELondonVenue(
  value: string | null | undefined
): boolean {
  if (!value) return false
  return /excel|brands hatch/i.test(value)
}

/** Append the venue note unless this series copy already states the move. */
export function withFormulaELondonVenueNote(
  slug: string | null | undefined,
  description: string | null | undefined
): string {
  const base = description?.trim() ?? ""
  if (slug !== "formula-e" || /brands hatch/i.test(base)) return base
  return base
    ? `${base} ${FORMULA_E_LONDON_VENUE_NOTE}`
    : FORMULA_E_LONDON_VENUE_NOTE
}
