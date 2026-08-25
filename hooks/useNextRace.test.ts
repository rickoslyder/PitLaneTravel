import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

describe("useNextRace countdown vs classification", () => {
  const source = readFileSync(path.join(process.cwd(), "hooks/useNextRace.ts"), "utf8")

  it("classifies from the shared contract and uses race.date only as a countdown target", () => {
    expect(source).toMatch(
      /import\s*\{[^}]*selectNextCountdownRace[^}]*\}\s*from\s*['"]@\/lib\/race-status['"]/
    )
    expect(source).toMatch(/selectNextCountdownRace\s*\(/)
    expect(source).not.toMatch(/status\s*!==\s*['"]cancelled['"]/)
    expect(source).not.toMatch(/status\s*!==\s*['"]completed['"]/)
    expect((source.match(/getRacesAction\s*\(/g) ?? []).length).toBe(1)
    expect(source).toMatch(/countdown target/)
  })
})
