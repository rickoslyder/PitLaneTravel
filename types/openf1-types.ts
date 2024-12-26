// OpenF1 API Response Types

export interface OpenF1Base {
  date: string
  meeting_key: number
  session_key: number
}

export interface OpenF1Session extends OpenF1Base {
  session_name: string
  session_type:
    | "practice_1"
    | "practice_2"
    | "practice_3"
    | "qualifying"
    | "sprint"
    | "race"
  status: "upcoming" | "in_progress" | "finished" | "delayed" | "cancelled"
  circuit_key: number
  circuit_short_name: string
}

export interface OpenF1Circuit {
  circuit_key: number
  circuit_name: string
  circuit_short_name: string
  country_name: string
  location: {
    lat: number
    lng: number
  }
  track_length: number // in meters
  track_turns: number
  track_type: string
  pit_lane_side: "left" | "right"
  pit_lane_length: number // in meters
}

export interface OpenF1Weather extends OpenF1Base {
  air_temperature: number
  humidity: number
  pressure: number
  rainfall: boolean
  track_temperature: number
  wind_direction: number
  wind_speed: number
}

export interface OpenF1CarData extends OpenF1Base {
  driver_number: string
  speed: number
  rpm: number
  gear: number
  throttle: number
  brake: number
  drs: number
}

export interface OpenF1Position extends OpenF1Base {
  driver_number: string
  position: number
  type: "track" | "race" | "grid"
  status: "in_pit" | "on_track" | "out"
}

export interface OpenF1TeamRadio extends OpenF1Base {
  driver_number: string
  message: string
  category: "team" | "driver"
}

export interface OpenF1Interval extends OpenF1Base {
  driver_number: string
  gap_to_leader: number
  interval: number
  position: number
}

export interface OpenF1RaceControl extends OpenF1Base {
  message: string
  category: "flag" | "incident" | "other"
  flag?: "red" | "yellow" | "blue" | "white" | "black" | "chequered"
  scope?: "track" | "sector_1" | "sector_2" | "sector_3"
}

// Internal Types (mapped from OpenF1 to our schema)

export interface SessionSchedule {
  id: string
  raceId: string
  sessionType: "fp1" | "fp2" | "fp3" | "qualifying" | "sprint" | "race"
  startTime: Date
  endTime: Date
  status: "scheduled" | "live" | "completed" | "delayed" | "cancelled"
  actualStartTime?: Date
  actualEndTime?: Date
}

export interface CircuitDetails {
  id: string
  circuitId: string
  trackLengthKm: number
  numberOfLaps: number
  drsZones: {
    zone: number
    detectionPoint: number
    activationPoint: number
  }[]
  circuitMapUrl: string
  pitLaneSide: "left" | "right"
  pitLaneLengthKm: number
  trackWidthM: number
  elevationChangeM: number
}

export interface WeatherData {
  id: string
  sessionId: string
  timestamp: Date
  airTemp: number
  trackTemp: number
  humidity: number
  windSpeed: number
  windDirection: number
  precipitation: boolean
}

export interface SessionStatus {
  id: string
  sessionId: string
  status: "scheduled" | "live" | "completed" | "delayed" | "cancelled"
  message?: string
  flags?: {
    type: "red" | "yellow" | "blue" | "white" | "black" | "chequered"
    sector?: 1 | 2 | 3
  }[]
  timestamp: Date
}

// Type Guards

export function isOpenF1Session(data: any): data is OpenF1Session {
  return (
    typeof data === "object" &&
    data !== null &&
    "session_type" in data &&
    "status" in data &&
    "circuit_key" in data
  )
}

export function isOpenF1Circuit(data: any): data is OpenF1Circuit {
  return (
    typeof data === "object" &&
    data !== null &&
    "circuit_key" in data &&
    "circuit_name" in data &&
    "track_length" in data
  )
}

// Type Transformers

export function transformSession(
  openF1Session: OpenF1Session
): SessionSchedule {
  return {
    id: "", // Generated by database
    raceId: "", // Mapped using CircuitMapper
    sessionType: transformSessionType(openF1Session.session_type),
    startTime: new Date(openF1Session.date),
    endTime: calculateEndTime(openF1Session),
    status: transformStatus(openF1Session.status)
  }
}

export function transformCircuit(
  openF1Circuit: OpenF1Circuit
): Partial<CircuitDetails> {
  return {
    trackLengthKm: openF1Circuit.track_length / 1000,
    pitLaneSide: openF1Circuit.pit_lane_side,
    pitLaneLengthKm: openF1Circuit.pit_lane_length / 1000
  }
}

// Helper Functions

function transformSessionType(
  type: OpenF1Session["session_type"]
): SessionSchedule["sessionType"] {
  const typeMap: Record<
    OpenF1Session["session_type"],
    SessionSchedule["sessionType"]
  > = {
    practice_1: "fp1",
    practice_2: "fp2",
    practice_3: "fp3",
    qualifying: "qualifying",
    sprint: "sprint",
    race: "race"
  }
  return typeMap[type]
}

function transformStatus(
  status: OpenF1Session["status"]
): SessionSchedule["status"] {
  const statusMap: Record<OpenF1Session["status"], SessionSchedule["status"]> =
    {
      upcoming: "scheduled",
      in_progress: "live",
      finished: "completed",
      delayed: "delayed",
      cancelled: "cancelled"
    }
  return statusMap[status]
}

function calculateEndTime(session: OpenF1Session): Date {
  const durations: Record<OpenF1Session["session_type"], number> = {
    practice_1: 60,
    practice_2: 60,
    practice_3: 60,
    qualifying: 60,
    sprint: 30,
    race: 120
  }

  const startTime = new Date(session.date)
  const durationMinutes = durations[session.session_type]
  return new Date(startTime.getTime() + durationMinutes * 60000)
}
