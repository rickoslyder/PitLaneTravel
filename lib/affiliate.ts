/*
<ai_context>
Affiliate link builders. Hotel/accommodation search is monetised the same way as
tickets: outbound links to a partner, tagged with our affiliate id. Set the id via env
(HOTEL_AFFILIATE_ID); without it the links still work, just untagged.
</ai_context>
*/

/**
 * Build a Booking.com search URL for accommodation near a circuit. Uses the circuit's
 * city/country as the search string and tags the partner affiliate id when configured.
 */
export function buildHotelSearchUrl(params: {
  location: string
  country: string
  checkIn?: string // yyyy-mm-dd
  checkOut?: string
}): string {
  const aid = process.env.HOTEL_AFFILIATE_ID
  const url = new URL("https://www.booking.com/searchresults.html")
  url.searchParams.set("ss", `${params.location}, ${params.country}`)
  if (params.checkIn) url.searchParams.set("checkin", params.checkIn)
  if (params.checkOut) url.searchParams.set("checkout", params.checkOut)
  if (aid) url.searchParams.set("aid", aid)
  return url.toString()
}
