import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import {
  isSitemapIndexableRace,
  SITEMAP_STATIC_PATHS,
  staticSitemapUrl
} from "./sitemap-routes"

describe("sitemap static paths", () => {
  it("omits unlisted /packages and includes /cancellation", () => {
    expect(SITEMAP_STATIC_PATHS).not.toContain("/packages")
    expect(SITEMAP_STATIC_PATHS).toContain("/cancellation")
    expect(staticSitemapUrl("/cancellation")).toBe(
      "https://www.pitlanetravel.com/cancellation"
    )
    expect(staticSitemapUrl("/")).toBe("https://www.pitlanetravel.com")

    const source = readFileSync(
      path.join(process.cwd(), "lib/sitemap-routes.ts"),
      "utf8"
    )
    expect(source).toMatch(/noindex,follow/)
    expect(source).toContain("app/packages/page.tsx")
  })
})

describe("isSitemapIndexableRace", () => {
  const now = new Date("2026-11-13T18:00:00.000Z")

  it("keeps upcoming 2026 and 2027 races and drops one whose weekend has ended", () => {
    expect(
      isSitemapIndexableRace(
        {
          slug: "las-vegas-grand-prix-2026-f1-2026",
          status: "upcoming",
          date: "2026-11-22T04:00:00.000Z"
        },
        now
      )
    ).toBe(true)
    expect(
      isSitemapIndexableRace(
        {
          slug: "mexico-city-e-prix-2027-formula-e-2027",
          status: "upcoming",
          date: "2027-01-16T00:00:00.000Z"
        },
        now
      )
    ).toBe(true)
    expect(
      isSitemapIndexableRace(
        {
          slug: "abu-dhabi-grand-prix-2027-f1-2027",
          status: "upcoming",
          date: "2027-12-12T00:00:00.000Z"
        },
        now
      )
    ).toBe(true)
    expect(
      isSitemapIndexableRace(
        {
          slug: "brazilian-grand-prix-2026-f1-2026",
          status: "upcoming",
          date: "2026-11-08T17:00:00.000Z"
        },
        now
      )
    ).toBe(false)
    expect(
      isSitemapIndexableRace(
        {
          slug: "qatar-grand-prix-motogp-2026",
          status: "upcoming",
          date: "2026-11-08T00:00:00.000Z",
          weekendEnd: "2026-11-08T16:00:00.000Z"
        },
        now
      )
    ).toBe(false)
  })

  it("drops cancelled races and races without a slug", () => {
    expect(
      isSitemapIndexableRace(
        {
          slug: "bahrain-grand-prix-2026-f1-2026",
          status: "cancelled",
          date: "2026-04-12T15:00:00.000Z"
        },
        now
      )
    ).toBe(false)
    expect(
      isSitemapIndexableRace(
        {
          slug: null,
          status: "upcoming",
          date: "2026-12-06T13:00:00.000Z"
        },
        now
      )
    ).toBe(false)
  })
})

describe("sitemap route", () => {
  it("reads the live table with no season, series, or row limit", () => {
    const source = readFileSync(
      path.join(process.cwd(), "app/sitemap.ts"),
      "utf8"
    )

    expect(source).toContain('export const dynamic = "force-dynamic"')
    expect(source).not.toMatch(/export const revalidate/)
    expect(source).toContain("isSitemapIndexableRace")
    expect(source).not.toMatch(/racesTable\.season/)
    expect(source).not.toMatch(/eq\(\s*seriesTable\.slug/)
    expect(source).not.toMatch(/\.limit\(/)
  })
})

describe("robots.txt", () => {
  it("points at the sitemap without a trailing space", () => {
    const robots = readFileSync(
      path.join(process.cwd(), "public/robots.txt"),
      "utf8"
    )
    const sitemapLine = robots
      .split("\n")
      .find(line => line.startsWith("Sitemap:"))

    expect(sitemapLine).toBe(
      "Sitemap: https://www.pitlanetravel.com/sitemap.xml"
    )
    expect(sitemapLine?.endsWith(" ")).toBe(false)
  })
})
