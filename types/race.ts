export interface Circuit {
  id: string
  name: string
  location: string
  country: string
  latitude: number
  longitude: number
  image_url: string | null
  created_at: string
  updated_at: string
  locations?: CircuitLocation[]
}

export interface CircuitLocation {
  id: string
  circuitId: string
  type:
    | "circuit"
    | "city_center"
    | "parking"
    | "fan_zone"
    | "transport_hub"
    | "airport"
  name: string
  description?: string | null
  address?: string | null
  placeId?: string | null
  latitude: string
  longitude: string
  distanceFromCircuit?: string | null
  timezone?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CircuitDetails {
  id: string
  circuit_id: string
  length: number
  corners: number
  drs_zones: number
  lap_record_time: string | null
  lap_record_year: number | null
  lap_record_driver: string | null
  created_at: string
  updated_at: string
}

export interface Race {
  id: string
  circuit_id: string
  name: string
  date: string
  season: number
  round: number
  country: string
  description: string | null
  weekend_start: string | null
  weekend_end: string | null
  status: "live" | "upcoming" | "completed" | "cancelled"
  slug: string | null
  is_sprint_weekend: boolean
  created_at: string
  updated_at: string
  circuit?: Circuit
}

export interface TransportInfo {
  id: string
  circuit_id: string
  type: string
  name: string
  description: string | null
  options: string[] | null
  created_at: string
  updated_at: string
}

export interface Airport {
  id: string
  circuit_id: string
  code: string
  name: string
  distance: number
  transfer_time: string
  latitude: number
  longitude: number
  created_at: string
  updated_at: string
}

export interface LocalAttraction {
  id: string
  circuit_id: string
  name: string
  description: string
  latitude: number | null
  longitude: number | null
  distance_from_circuit: number | null
  distance_from_city: number | null
  estimated_duration: string | null
  recommended_times: string[] | null
  booking_required: boolean
  price_range: string | null
  f1_relevance: string | null
  peak_times: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  itinerary_id: number
  name: string
  type: string
  price_amount: number | null
  price_currency: string | null
  rating: number | null
  category: string | null
  distance: string | null
  duration: string | null
  location_lat: number | null
  location_lng: number | null
  time_slot: string | null
  description: string | null
  visit_duration: string | null
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: number
  race_id: string
  title: string
  description: string
  ticket_type: string
  availability: string
  days_included: {
    thursday?: boolean
    friday?: boolean
    saturday?: boolean
    sunday?: boolean
  }
  is_child_ticket: boolean
  reseller_url: string
  created_at: string
  updated_at: string
  updated_by: string | null
}

export interface TicketPricing {
  id: number
  ticket_id: number
  price: number
  currency: string
  valid_from: string
  valid_to: string | null
  created_at: string
  updated_at: string
  updated_by: string | null
}

export interface TicketFeature {
  id: number
  name: string
  description: string | null
}

export interface TicketPackage {
  id: number
  name: string
  description: string | null
  created_at: string | null
}

export interface PackageTicket {
  package_id: number
  ticket_id: number
  quantity: number
  discount_percentage: number | null
}

export interface PodiumResult {
  id: string
  circuit_id: string
  position: number
  driver: string
  team: string
  year: number
  created_at: string
  updated_at: string
}

export interface SupportingSeries {
  id: string
  race_id: string
  series: string
  round: number
  created_at: string
  updated_at: string
}

// Props interfaces
export interface RaceCountdownProps {
  raceDate: string
  className?: string
}

export interface RaceCardProps {
  race: Race
  onClick?: () => void
}

export interface WeatherTabProps {
  raceId: string
  isActive: boolean
}

export interface ScheduleTabProps {
  raceId: string
  isActive: boolean
}

export interface WeatherData {
  temperature: number
  conditions: string
  precipitation: number
  humidity: number
  wind_speed: number
}

export interface ScheduleItem {
  type: string
  name?: string
  date: string
  time: string
}

export interface RaceWithDetails extends Race {
  circuit?: Circuit & {
    details?: CircuitDetails
    airports?: Airport[]
    local_attractions?: LocalAttraction[]
    transport_info?: TransportInfo[]
    locations?: CircuitLocation[]
  }
  tickets?: Array<
    Ticket & {
      pricing?: TicketPricing[]
      features?: TicketFeature[]
    }
  >
  supporting_series?: SupportingSeries[]
  podium_results?: PodiumResult[]
  availability?: "available" | "sold_out" | "low_stock" | "pending"
}

// Update RaceDetailsPageProps to use RaceWithDetails
export interface RaceDetailsPageProps {
  race: RaceWithDetails
}
