import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

describe("marketing home race status filter", () => {
  const source = readFileSync(path.join(process.cwd(), "app/(marketing)/page.tsx"), "utf8")

  it("does not use startDate as a status cutoff and filters derived active statuses", () => {
    expect(source).not.toMatch(/startDate:\s*new Date\(\)\.toISOString\(\)/)
    expect(source).toMatch(
      /import\s*\{[^}]*isActiveRaceStatus[^}]*\}\s*from\s*["']@\/lib\/race-status["']/
    )
    expect(source).toMatch(/isActiveRaceStatus\(\s*race\.status\s*\)/)
    expect(source).toMatch(/getRacesAction\(\s*\{\s*excludeCancelled:\s*true\s*\}\s*\)/)
  })
})
