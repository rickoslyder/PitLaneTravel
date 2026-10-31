import { readFileSync, statSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()

describe("home hero image", () => {
  it("serves a local optimized photo and a designed fallback", () => {
    const source = readFileSync(
      path.join(root, "components/landing/hero.tsx"),
      "utf8"
    )
    const assetPath = path.join(root, "public/images/home-hero.jpg")
    const bytes = statSync(assetPath).size
    const header = readFileSync(assetPath).subarray(0, 3)

    expect(source).toContain('"/images/home-hero.jpg"')
    expect(source).toContain(
      "Spectators in red shirts cheering from a grandstand as an open-wheel race car runs down the front straight under a bright sky"
    )
    expect(source).not.toContain("Hero Image")
    expect(source).not.toContain("supabaseLoader")
    expect(source).not.toContain("storage/v1/render/image")
    expect(source).toContain("data-hero-fallback")
    expect([...header]).toEqual([0xff, 0xd8, 0xff])
    expect(bytes).toBeGreaterThan(50_000)
    expect(bytes).toBeLessThan(1_500_000)
  })
})
