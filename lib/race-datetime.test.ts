import { spawnSync } from "node:child_process"
import path from "node:path"
import { describe, expect, it } from "vitest"
import {
  formatRaceCalendarDate,
  formatRaceSessionDateTime,
  formatSessionClock
} from "./race-datetime"

const NEAR_MIDNIGHT_UTC = "2026-12-06T00:30:00.000Z"
const ABU_DHABI_DATE = "2026-12-06T00:00:00.000Z"

describe("formatRaceCalendarDate", () => {
  it("keeps a date near UTC midnight on that calendar day under TZ=America/Los_Angeles", () => {
    const source = `
      import { formatRaceCalendarDate } from ${JSON.stringify(path.join(process.cwd(), "lib/race-datetime.ts"))}
      const nearMidnight = ${JSON.stringify(NEAR_MIDNIGHT_UTC)}
      const abuDhabi = ${JSON.stringify(ABU_DHABI_DATE)}
      const local = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
      const payload = {
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        nearMidnight: formatRaceCalendarDate(nearMidnight),
        abuDhabi: formatRaceCalendarDate(abuDhabi),
        localNearMidnight: local.format(new Date(nearMidnight)),
        localAbuDhabi: local.format(new Date(abuDhabi))
      }
      process.stdout.write(JSON.stringify(payload))
    `
    const result = spawnSync(
      process.execPath,
      ["--experimental-strip-types", "--input-type=module", "--eval", source],
      {
        cwd: process.cwd(),
        env: { ...process.env, TZ: "America/Los_Angeles" },
        encoding: "utf8"
      }
    )

    expect(result.status, result.stderr).toBe(0)
    const payload = JSON.parse(result.stdout) as {
      tz: string
      nearMidnight: string
      abuDhabi: string
      localNearMidnight: string
      localAbuDhabi: string
    }
    expect(payload.tz).toBe("America/Los_Angeles")
    expect(payload.localNearMidnight).toBe("Dec 5, 2026")
    expect(payload.localAbuDhabi).toBe("Dec 5, 2026")
    expect(payload.nearMidnight).toBe("Dec 6, 2026")
    expect(payload.abuDhabi).toBe("Dec 6, 2026")
  })

  it("matches the Los Angeles child from the current process as well", () => {
    expect(formatRaceCalendarDate(NEAR_MIDNIGHT_UTC)).toBe("Dec 6, 2026")
    expect(formatRaceCalendarDate(ABU_DHABI_DATE)).toBe("Dec 6, 2026")
    expect(
      formatRaceCalendarDate(ABU_DHABI_DATE, {
        weekday: "long",
        month: "long",
        day: "numeric"
      })
    ).toBe("Sunday, December 6")
  })
})

describe("session times", () => {
  it("labels clocks with an explicit zone instead of the host zone", () => {
    expect(formatSessionClock("15:00", null)).toBe("15:00 UTC")
    expect(formatSessionClock("13:30", "Asia/Dubai")).toBe("13:30 GMT+4")
    const labeled = formatRaceSessionDateTime(
      "2026-12-06T13:00:00.000Z",
      "Asia/Dubai"
    )
    expect(labeled).toContain("GMT+4")
    expect(labeled).toContain("Dec 6, 2026")
    expect(labeled).not.toMatch(/AM|PM/)
  })
})
