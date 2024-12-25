export interface DuffelPlace {
  iata_code: string
  name: string
  city_name?: string
  time_zone: string
  terminal?: string
  city?: {
    name: string
  }
}

export interface DuffelAirline {
  name: string
  iata_code: string
}

export interface DuffelBaggageItem {
  quantity: number
  weight: number
  unit: string
}

export interface DuffelBaggage {
  checked: DuffelBaggageItem[]
  carry_on: DuffelBaggageItem[]
}

export interface DuffelPassenger {
  id: string
  baggages?: DuffelBaggage[]
}

export interface DuffelSegment {
  flight_number: string
  aircraft?: string
  origin: string
  destination: string
  departure: {
    airport: string
    city?: string
    time: string
    terminal?: string
  }
  arrival: {
    airport: string
    city?: string
    time: string
    terminal?: string
  }
  airline: {
    name: string
    logo_url?: string
  }
  duration: string
  baggage?: DuffelBaggage
}

export interface DuffelSlice {
  id: string
  origin: DuffelPlace
  destination: DuffelPlace
  duration: string
  segments: DuffelSegment[]
}

export interface DuffelConditions {
  changeable: boolean
  refundable: boolean
  change_fee?: string
  refund_fee?: string
}

export interface DuffelOffer {
  id: string
  total_amount: string
  total_currency: string
  slices: DuffelSlice[]
  owner: DuffelAirline
  conditions?: DuffelConditions
  passengers: DuffelPassenger[]
}

export type DuffelPassengerType = "adult" | "child" | "infant_without_seat"
export type DuffelPassengerTitle = "mr" | "mrs" | "ms" | "miss" | "dr"
export type DuffelCabinClass =
  | "economy"
  | "premium_economy"
  | "business"
  | "first"
export type DuffelFareType = "standard" | "premium" | "business" | "first"

export interface DuffelOfferRequestPassenger {
  type: DuffelPassengerType
  given_name?: string
  family_name?: string
  loyalty_programme_accounts?: Array<{
    account_number: string
    airline_iata_code: string
  }>
  fare_type?: DuffelFareType
}

export interface DuffelOfferRequest {
  slices: Array<{
    origin: string
    destination: string
    departure_date: string
  }>
  passengers: DuffelOfferRequestPassenger[]
  cabin_class?: DuffelCabinClass
  return_offers?: boolean
}

export interface DuffelOfferRequestResponse {
  data: {
    id: string
    offers: DuffelOffer[]
  }
}

export interface DuffelError {
  type: string
  title: string
  status: number
  errors?: Array<{
    code: string
    message: string
    source?: {
      pointer: string
    }
  }>
}

export interface TransformedFlightOffer {
  id: string
  total_amount: string
  total_currency: string
  airline: {
    name: string
    logo_url?: string
    iata_code: string
  }
  departure: {
    airport: string
    city?: string
    time: string
    terminal?: string
  }
  arrival: {
    airport: string
    city?: string
    time: string
    terminal?: string
  }
  duration: string
  segments: Array<{
    flight_number: string
    aircraft?: string
    departure: {
      airport: string
      city?: string
      time: string
      terminal?: string
    }
    arrival: {
      airport: string
      city?: string
      time: string
      terminal?: string
    }
    baggage?: {
      checked?: {
        amount: number
        weight: number
      }
      cabin?: {
        amount: number
        weight: number
      }
    }
  }>
  conditions: {
    changeable: boolean
    refundable: boolean
    change_fee?: string
    refund_fee?: string
  }
  baggage: DuffelBaggage
}
