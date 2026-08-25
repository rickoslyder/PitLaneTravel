import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

describe("flights page race status filter", () => {
  const source = readFileSync(path.join(process.cwd(), "app/flights/page.tsx"), "utf8")

  it("filters derived active statuses instead of comparing race.date to now", () => {
    expect(source).not.toMatch(/new Date\(\s*race\.date\s*\)\s*>\s*new Date\(\)/)
    expect(source).toMatch(
      /import\s*\{[^}]*isActiveRaceStatus[^}]*\}\s*from\s*["']@\/lib\/race-status["']/
    )
    expect(source).toMatch(/isActiveRaceStatus\(\s*race\.status\s*\)/)
  })
})
