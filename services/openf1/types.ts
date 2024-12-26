export interface OpenF1Circuit {
  circuit_key: number
  circuit_name: string
  circuit_short_name: string
  country_name: string
  location: {
    lat: number
    lng: number
  }
  track_length: number
}

export interface OpenF1Session {
  date: string
  session_key: number
  meeting_key: number
  session_name: string
  session_type: string
  status: string
  circuit_key: number
  circuit_short_name: string
}

export class OpenF1Error extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message)
    this.name = "OpenF1Error"
  }
} 