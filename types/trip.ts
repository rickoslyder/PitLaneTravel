export type TripStatus = "planning" | "booked" | "completed"
export type TripVisibility = "private" | "public" | "shared"

export interface FlightDetails {
  departure: string | null
  arrival: string | null
  layovers: string[]
  bookingReference: string | null
  ticketNumbers?: string[]
  baggageAllowance?: string | null
}

export interface Flights {
  outbound: FlightDetails | null
  return: FlightDetails | null
}

export interface Accommodation {
  name: string | null
  location: string | null
  roomType: string | null
  checkIn: string | null
  checkOut: string | null
  bookingReference: string | null
  confirmationCode: string | null
}

export interface SavedMerch {
  id: string
  name: string
  description: string
  category:
    | "clothing"
    | "accessories"
    | "memorabilia"
    | "collectibles"
    | "other"
  price: string
  currency: string
  imageUrl?: string
  purchaseUrl?: string
  inStock: string
}

export interface Trip {
  id: string
  userId: string
  raceId: string
  title: string
  description: string
  visibility: TripVisibility
  status: TripStatus
  sharedWith: string[] | null
  flights: Flights | null
  accommodation: Accommodation | null
  transportationNotes: string | null
  packingList: string[]
  customNotes: Record<string, any>
  activities?: string[]
  savedMerch?: SavedMerch[]
  createdAt: Date
  updatedAt: Date
}
