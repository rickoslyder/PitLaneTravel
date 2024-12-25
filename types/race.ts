export interface Circuit {
  id: string
  name: string
  location: string
  country: string
  latitude: number
  longitude: number
  image_url: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Race {
  id: string
  name: string
  description: string
  date: string
  location: string
  country: string
  circuit_info: {
    name: string
    length: string
    corners: number
    drsZones: number
    lapRecord: {
      time: string
      year: number
      driver: string
    }
  }
  weather_info: {
    humidity: string
    rainfall: string
    averageTemp: string
  }
  transport_info: {
    train: string
    bicycle: string
  }
  schedule: {
    practice1: string
    practice2: string
    practice3: string
    qualifying: string
    race: string
  }
  ticket_info: {
    availability: string
    price: number
  }
  nearest_airports: Array<{
    code: string
    name: string
    distance: string
    transferTime: string
  }>
  local_attractions: Array<{
    id: string
    name: string
    type?: string
    price?: {
      amount: number
      currency: string
    }
    rating?: number
    category?: string
    distance?: string
    duration?: string
    location?: {
      lat: number
      lng: number
    }
    timeSlot?: string
    description?: string
    visitDuration?: string
  }>
  availability: "available" | "sold_out" | "low_stock" | "pending"
  is_sprint_weekend: boolean
  weekend_start?: string
  weekend_end?: string
  circuit?: {
    name: string
    location: string
    country: string
    createdAt: Date
    updatedAt: Date
  }
  created_at: string
  updated_at: string
  status: "live" | "upcoming" | "completed" | "cancelled"
  slug: string | null
}

export interface CircuitInfo {
  length: string
  corners: number
  drs_zones: number
  lap_record_time?: string
  lap_record_driver?: string
  lap_record_year?: number
}

export interface WeatherInfo {
  temperature: number
  conditions: string
  precipitation: number
  humidity: number
  wind_speed: number
  visibility?: string
  airTemperature?: number
  trackTemperature?: number
}

export interface TransportInfo {
  public?: {
    options: string[]
    description: string
  }
  parking?: {
    options: string[]
    description: string
  }
}

export interface Schedule {
  practice_1?: SessionInfo
  practice_2?: SessionInfo
  practice_3?: SessionInfo
  qualifying?: SessionInfo
  sprint?: SessionInfo
  race?: SessionInfo
}

export interface SessionInfo {
  date: string
  time: string
}

export interface TicketInfo {
  title: string
  description: string
  price: string
  ticketType: string
  availability: "available" | "sold_out" | "pending"
  features: string[]
  restrictions: string[]
  daysIncluded: {
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
  isChildTicket: boolean
  resellerUrl: string
}

export interface Airport {
  code: string
  name: string
  transferTime: string
}

export interface Attraction {
  id: string
  name: string
  description: string
  distance?: string
}

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
