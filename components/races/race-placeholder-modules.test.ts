import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { lapRecordHasData } from "./track-info/LapRecord"
import { trackOverviewHasData } from "./track-info/TrackOverview"

const root = process.cwd()

function read(relativePath: string): string {
  return readFileSync(path.join(root, relativePath), "utf8")
}

describe("race page placeholder modules", () => {
  it("hides invented track stats and the shared placeholder video", () => {
    const overview = read("components/races/track-info/TrackOverview.tsx")
    const lap = read("components/races/track-info/LapRecord.tsx")
    const info = read("components/races/tabs/RaceInfoTab.tsx")

    expect(overview).not.toMatch(/70%/)
    expect(overview).not.toMatch(/Gear Changes/)
    expect(overview).not.toMatch(/Top Speed/)
    expect(lap).not.toMatch(/Sector Times/)
    expect(lap).not.toMatch(/Speed Zones/)
    expect(info).not.toMatch(/YouTubeEmbed|gYzVprg_NNs/)
    expect(info).toMatch(/description\?\.trim\(\)/)
    expect(info).toMatch(/track_map_url/)

    expect(trackOverviewHasData(undefined)).toBe(false)
    expect(
      trackOverviewHasData({
        id: "1",
        circuit_id: "c",
        length: 5.281,
        corners: 16,
        drs_zones: 2,
        lap_record_time: null,
        lap_record_year: null,
        lap_record_driver: null,
        created_at: "",
        updated_at: ""
      })
    ).toBe(true)
    expect(
      lapRecordHasData({
        id: "1",
        circuit_id: "c",
        length: 5.281,
        corners: 16,
        drs_zones: 2,
        lap_record_time: null,
        lap_record_year: null,
        lap_record_driver: null,
        created_at: "",
        updated_at: ""
      })
    ).toBe(false)
  })

  it("feeds the schedule tab from the travel session list and hides an empty weather card", () => {
    const schedule = read(
      "components/races/weather-schedule/WeatherAndSchedule.tsx"
    )
    const travel = read("components/races/travel/FlightSearch.tsx")

    expect(schedule).toMatch(/raceWeekendSessions/)
    expect(travel).toMatch(/raceWeekendSessions/)
    expect(schedule).not.toMatch(/13:30|Practice 1|No weather data available/)
    expect(schedule).toMatch(/showWeather/)
  })
})
