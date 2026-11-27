import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { siteCopy } from "@/config/site-copy"
import { pageSeo } from "@/lib/site-metadata"

describe("packages page metadata", () => {
  const source = readFileSync(
    path.join(process.cwd(), "app/packages/page.tsx"),
    "utf8"
  )
  const copy = siteCopy(false)
  const seo = pageSeo("/packages")

  it("publishes a unique title, description, canonical, and Open Graph tags", () => {
    expect(copy.packagesTitle).toBe("Race Packages | PitLane Travel")
    expect(copy.packagesDescription).toBe(
      "Race packages for F1 and MotoGP are on the way. Find your race and get tickets in the meantime."
    )
    expect(seo.alternates.canonical).toBe(
      "https://www.pitlanetravel.com/packages"
    )

    expect(source).toContain("title,")
    expect(source).toContain("description,")
    expect(source).toContain("alternates: seo.alternates")
    expect(source).toContain('pageSeo("/packages")')
    expect(source).toContain("openGraph:")
    expect(source).toContain("url: seo.openGraph.url")
    expect(source).toContain("images: seo.openGraph.images")
    expect(source).toContain('type: "website"')
    expect(source).toContain("twitter:")
  })

  it("does not set a robots directive", () => {
    expect(source).not.toMatch(/\brobots\b/)
    expect(source).not.toMatch(/noindex/)
    expect(source).not.toMatch(/index:\s*false/)
  })
})
