import { describe, expect, it } from "vitest"
import { forecastBounds } from "./forecast-window"

describe("forecastBounds", () => {
  it("uses the race date when weekend bounds are missing", () => {
    const window = forecastBounds({
      date: new Date("2026-11-08T00:00:00.000Z"),
      weekendStart: null,
      weekendEnd: null
    })

    expect(window.startDate.toISOString()).toBe("2026-11-07T00:00:00.000Z")
    expect(window.endDate.toISOString()).toBe("2026-11-09T00:00:00.000Z")
  })

  it("expands a stored weekend by one UTC day on each side", () => {
    const window = forecastBounds({
      date: new Date("2026-11-08T00:00:00.000Z"),
      weekendStart: new Date("2026-11-06T00:00:00.000Z"),
      weekendEnd: new Date("2026-11-08T00:00:00.000Z")
    })

    expect(window.startDate.toISOString()).toBe("2026-11-05T00:00:00.000Z")
    expect(window.endDate.toISOString()).toBe("2026-11-09T00:00:00.000Z")
  })

  it("fills only the missing bound from the race date", () => {
    const window = forecastBounds({
      date: "2026-11-08T00:00:00.000Z",
      weekendStart: "2026-11-06T00:00:00.000Z",
      weekendEnd: null
    })

    expect(window.startDate.toISOString()).toBe("2026-11-05T00:00:00.000Z")
    expect(window.endDate.toISOString()).toBe("2026-11-09T00:00:00.000Z")
  })
})
