import { readFileSync, statSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()

describe("upcoming race card image", () => {
  it("ships a placeholder and falls back when the circuit photo fails", () => {
    const source = readFileSync(
      path.join(root, "components/landing/upcoming-races.tsx"),
      "utf8"
    )
    const asset = path.join(root, "public/assets/placeholder.jpg")
    const header = readFileSync(asset).subarray(0, 3)

    expect(source).toContain('"/assets/placeholder.jpg"')
    expect(source).toContain("onError")
    expect(source).toContain("data-race-image-fallback")
    expect(source).toContain("formatRaceCalendarDate")
    expect(source).not.toContain("toLocaleDateString")
    expect([...header]).toEqual([0xff, 0xd8, 0xff])
    expect(statSync(asset).size).toBeGreaterThan(1000)
  })
})
