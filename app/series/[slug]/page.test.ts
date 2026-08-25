import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

describe("series page race status filter", () => {
  const source = readFileSync(
    path.join(process.cwd(), "app/series/[slug]/page.tsx"),
    "utf8"
  )

  it("filters upcoming/in_progress via the shared predicate, not status !== completed", () => {
    expect(source).not.toMatch(/status\s*!==\s*["']completed["']/)
    expect(source).toMatch(
      /import\s*\{[^}]*isActiveRaceStatus[^}]*\}\s*from\s*["']@\/lib\/race-status["']/
    )
    expect(source).toMatch(/isActiveRaceStatus\(\s*r\.status\s*\)/)
  })
})
