/**
 * Disclosed official ticket stores, checked 31 Oct 2026.
 * Plain links. Not affiliate links.
 *
 * F1 uses the current store from 2027 on, and the previous store for 2026.
 * A season with no entry stays hidden.
 */

export type OfficialTicketOffer = {
  href: string
  label: string
  note: string
}

const SERIES_STORE_NOTE =
  "Official series ticket store. Not an affiliate link; Pit Lane Travel earns nothing from this purchase."

const FORMULA_E_NOTE =
  "Formula E sells each race through a local official ticketing partner (for example Ticketmaster or webook); you'll be passed on from fiaformulae.com. Not an affiliate link."

type SeriesTicketStore = {
  href: string
  /** Inclusive. Omit to apply to every season. */
  fromSeason?: number
  /** Inclusive. Omit to apply to every later season. */
  untilSeason?: number
  label: string
  note: string
}

const F1_2026: SeriesTicketStore = {
  href: "https://tickets.formula1.com/",
  fromSeason: 2026,
  untilSeason: 2026,
  label: "Buy from the official F1® Ticket Store",
  note: SERIES_STORE_NOTE
}

const F1_FROM_2027: SeriesTicketStore = {
  href: "https://ticketing.formula1.com/",
  fromSeason: 2027,
  label: "Buy from the official F1® Ticket Store",
  note: SERIES_STORE_NOTE
}

const MOTOGP: SeriesTicketStore = {
  href: "https://tickets.motogp.com/en/",
  label: "Buy from the official MotoGP™ Ticket Store",
  note: SERIES_STORE_NOTE
}

const FORMULA_E: SeriesTicketStore = {
  href: "https://www.fiaformulae.com/en/tickets",
  label: "Find tickets on Formula E's official tickets page",
  note: FORMULA_E_NOTE
}

const storesBySlug: Readonly<Record<string, readonly SeriesTicketStore[]>> = {
  f1: [F1_2026, F1_FROM_2027],
  motogp: [MOTOGP],
  "formula-e": [FORMULA_E]
}

function seasonMatches(
  store: SeriesTicketStore,
  season: number | null
): boolean {
  if (store.fromSeason == null && store.untilSeason == null) return true
  if (season == null) return false
  if (store.fromSeason != null && season < store.fromSeason) return false
  if (store.untilSeason != null && season > store.untilSeason) return false
  return true
}

export function officialTicketOffer(input: {
  seriesSlug?: string | null
  season?: number | null
}): OfficialTicketOffer | null {
  const slug = input.seriesSlug?.trim().toLowerCase()
  if (!slug) return null
  const season = input.season ?? null
  const store = (storesBySlug[slug] ?? []).find(candidate =>
    seasonMatches(candidate, season)
  )
  if (!store) return null
  return { href: store.href, label: store.label, note: store.note }
}
