import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

describe("seed-multi-series-calendars race status contract", () => {
  const source = readFileSync(
    path.join(process.cwd(), "scripts/seed-multi-series-calendars.ts"),
    "utf8"
  )

  it("imports and calls the shared helper, keeps cancelled rows excluded, and does not preserve cron in_progress", () => {
    expect(source).toMatch(
      /import\s*\{\s*deriveRaceStatus\s*\}\s*from\s*["']@\/lib\/race-status["']/
    )
    expect(source).toMatch(/deriveRaceStatus\s*\(/)
    expect(source).not.toMatch(/function\s+deriveStatus\s*\(/)
    expect(source).not.toMatch(/preserveLiveStatus/)
    expect(source).toMatch(/ne\(\s*racesTable\.status\s*,\s*["']cancelled["']\s*\)/)
    expect(source).toMatch(/weekendStart:\s*racesTable\.weekendStart/)
    expect(source).toMatch(/weekendEnd:\s*racesTable\.weekendEnd/)
  })
})
