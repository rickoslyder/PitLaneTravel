import { spawnSync } from "node:child_process"
import path from "node:path"
import { describe, expect, it } from "vitest"
import {
  formatRaceCalendarDate,
  formatSessionClock,
  raceTimeZoneLabel
} from "./race-datetime"

const VEGAS = "2026-11-22T04:00:00.000Z"
const ABU_DHABI = "2026-12-06T13:00:00.000Z"
const DATE_ONLY = "2026-12-06T00:00:00.000Z"
const HOST_ZONES = ["America/Los_Angeles", "America/New_York", "UTC"] as const

function calendarInHostZone(hostZone: string) {
  const source = `
    import { formatRaceCalendarDate } from ${JSON.stringify(path.join(process.cwd(), "lib/race-datetime.ts"))}
    const vegas = formatRaceCalendarDate(${JSON.stringify(VEGAS)}, undefined, "America/Los_Angeles")
    const abuDhabi = formatRaceCalendarDate(${JSON.stringify(ABU_DHABI)}, undefined, "Asia/Dubai")
    const dateOnly = formatRaceCalendarDate(${JSON.stringify(DATE_ONLY)}, undefined, "America/Los_Angeles")
    const localDateOnly = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(${JSON.stringify(DATE_ONLY)}))
    process.stdout.write(JSON.stringify({
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      vegas,
      abuDhabi,
      dateOnly,
      localDateOnly
    }))
  `
  const result = spawnSync(
    process.execPath,
    ["--experimental-strip-types", "--input-type=module", "--eval", source],
    {
      cwd: process.cwd(),
      env: { ...process.env, TZ: hostZone },
      encoding: "utf8"
    }
  )
  expect(result.status, result.stderr).toBe(0)
  return JSON.parse(result.stdout) as {
    tz: string
    vegas: string
    abuDhabi: string
    dateOnly: string
    localDateOnly: string
  }
}

describe("formatRaceCalendarDate", () => {
  it("agrees for Vegas, Abu Dhabi, and a date-only row in LA, New York, and UTC", () => {
    const payloads = HOST_ZONES.map(calendarInHostZone)
    for (const payload of payloads) {
      expect(payload.vegas).toBe("Nov 21, 2026")
      expect(payload.abuDhabi).toBe("Dec 6, 2026")
      expect(payload.dateOnly).toBe("Dec 6, 2026")
    }
    expect(payloads.map(payload => payload.tz)).toEqual([...HOST_ZONES])
    expect(payloads[0]?.localDateOnly).toBe("Dec 5, 2026")
    expect(new Set(payloads.map(payload => payload.vegas)).size).toBe(1)
    expect(new Set(payloads.map(payload => payload.abuDhabi)).size).toBe(1)
    expect(new Set(payloads.map(payload => payload.dateOnly)).size).toBe(1)
  })

  it("keeps the same labels in the current process", () => {
    expect(
      formatRaceCalendarDate(VEGAS, undefined, "America/Los_Angeles")
    ).toBe("Nov 21, 2026")
    expect(formatRaceCalendarDate(ABU_DHABI, undefined, "Asia/Dubai")).toBe(
      "Dec 6, 2026"
    )
    expect(
      formatRaceCalendarDate(DATE_ONLY, undefined, "America/Los_Angeles")
    ).toBe("Dec 6, 2026")
    expect(formatRaceCalendarDate(VEGAS)).toBe("Nov 22, 2026")
  })
})

describe("session time zone labels", () => {
  it("uses the session date, so winter labels are not the June abbreviations", () => {
    expect(
      raceTimeZoneLabel("America/Los_Angeles", "2026-11-22T04:00:00.000Z")
    ).toBe("PST")
    expect(raceTimeZoneLabel("Europe/London", "2026-01-18T14:00:00.000Z")).toBe(
      "GMT"
    )
    expect(raceTimeZoneLabel("Europe/Paris", "2026-01-18T14:00:00.000Z")).toBe(
      "CET"
    )
    expect(formatSessionClock("20:00", "America/Los_Angeles", VEGAS)).toBe(
      "20:00 PST"
    )
    expect(
      raceTimeZoneLabel("America/Los_Angeles", "2026-06-15T12:00:00.000Z")
    ).toBe("PDT")
  })
})
