/*
<ai_context>
Pure budget-estimation logic for a race-weekend trip. Kept framework-free and
side-effect-free so it is unit-testable and reusable by the /budget page, the trip
budget tab, and the AI planner. Currency conversion is applied by the caller using the
existing currency-rates table; all internal maths is in a single base currency.
</ai_context>
*/

export type TicketTier = "general" | "grandstand" | "premium"
export type HotelTier = "hostel" | "standard" | "luxury"

export interface BudgetInput {
  nights: number
  partySize: number
  ticketTier: TicketTier
  hotelTier: HotelTier
  /** Per-person return flight estimate in base currency; 0 if driving/local. */
  flightPerPerson: number
  /** Optional override for the ticket face value (per person). */
  ticketPriceOverride?: number
  /** Daily food + local transport + spending, per person. */
  dailySpendPerPerson?: number
}

export interface BudgetBreakdown {
  tickets: number
  flights: number
  accommodation: number
  spending: number
  total: number
  perPerson: number
}

// Coarse per-person defaults (base currency units, ~GBP). Deliberately conservative;
// override with real ticket pricing where available.
const TICKET_TIER_PRICE: Record<TicketTier, number> = {
  general: 150,
  grandstand: 400,
  premium: 1200
}

// Per-room per-night; assumes 2 guests per room.
const HOTEL_TIER_NIGHTLY: Record<HotelTier, number> = {
  hostel: 45,
  standard: 140,
  luxury: 350
}

const DEFAULT_DAILY_SPEND = 60
const GUESTS_PER_ROOM = 2

export function estimateBudget(input: BudgetInput): BudgetBreakdown {
  const party = Math.max(1, Math.floor(input.partySize))
  const nights = Math.max(0, Math.floor(input.nights))

  const ticketEach =
    input.ticketPriceOverride ?? TICKET_TIER_PRICE[input.ticketTier]
  const tickets = ticketEach * party

  const flights = Math.max(0, input.flightPerPerson) * party

  const rooms = Math.ceil(party / GUESTS_PER_ROOM)
  const accommodation = HOTEL_TIER_NIGHTLY[input.hotelTier] * rooms * nights

  const dailyEach = input.dailySpendPerPerson ?? DEFAULT_DAILY_SPEND
  // Spending covers race weekend days = nights + 1 (arrival through departure).
  const spending = dailyEach * party * (nights + 1)

  const total = tickets + flights + accommodation + spending
  return {
    tickets,
    flights,
    accommodation,
    spending,
    total,
    perPerson: Math.round(total / party)
  }
}
