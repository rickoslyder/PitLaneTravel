export interface LapRecord {
  time: string | null
  year: number | null
  driver: string | null
}

export interface CircuitInfo {
  length: string
  corners: number
  drsZones: number
  lapRecord?: LapRecord
}

export interface Airport {
  code: string
  name: string
  distance: string
  transferTime: string
}

export interface LocalAttraction {
  name: string
  description: string
}

export interface PodiumResult {
  team: string
  driver: string
  position: number
}

export interface SupportingSeries {
  round: number
  series: string
}

export interface Race {
  id: number
  name: string
  circuit: string
  country: string
  date: string
  image_url: string | null
  description: string | null
  transport_info?: Record<string, string>
  nearest_airports?: Airport[]
  city: string
  latitude: string
  longitude: string
  circuit_info?: CircuitInfo
  last_year_podium?: PodiumResult[]
  track_map_url: string | null
  status: 'live' | 'upcoming' | 'completed' | 'cancelled'
  slug: string | null
  local_attractions?: LocalAttraction[]
  supporting_series?: SupportingSeries[]
  is_sprint_weekend: boolean
  weekend_start: string | null
  weekend_end: string | null
}

export interface DatabaseDump {
  races: Race[]
}

export interface ValidationError {
  type: 'error' | 'warning'
  message: string
  details?: any
} 