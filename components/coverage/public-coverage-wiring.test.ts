import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { PublicCoverageSummary } from "@/lib/public-coverage"

const ROOT = process.cwd()

function read(rel: string): string {
  const filePath = path.join(ROOT, rel)
  expect(existsSync(filePath), `missing ${rel}`).toBe(true)
  return readFileSync(filePath, "utf8")
}

const PUBLIC_PAGES = [
  "app/races/page.tsx",
  "app/races/[id]/page.tsx",
  "app/series/[slug]/page.tsx",
  "app/(marketing)/page.tsx"
] as const

const CLIENT_SURFACES = [
  "components/races/RaceDetailsPage.tsx",
  "components/races/RaceCard.tsx",
  "components/races/RaceGrid.tsx",
  "components/races/RacesPage.tsx",
  "components/landing/upcoming-races.tsx"
] as const

describe("public coverage wiring source contract", () => {
  it("creates the public coverage components", () => {
    expect(existsSync(path.join(ROOT, "components/coverage/coverage-badge.tsx"))).toBe(
      true
    )
    expect(
      existsSync(path.join(ROOT, "components/coverage/freshness-note.tsx"))
    ).toBe(true)
  })

  it("fetches one public coverage batch per public page and never calls the admin matrix", () => {
    for (const rel of PUBLIC_PAGES) {
      const source = read(rel)
      expect(source, rel).toMatch(/getPublicCoverageSummariesAction/)
      expect(source, rel).not.toMatch(/getCoverageMatrixAction/)
      expect(source, rel).not.toMatch(/from\s+["']@\/db\/db["']/)
      expect(source, rel).not.toMatch(/\bdb\s*\.\s*select\b/)
      expect(source, rel).not.toMatch(/sourceUrl|source_url|DATABASE_URL|CLERK_/)
    }

    const races = read("app/races/page.tsx")
    expect(races).toMatch(/coverageByRaceId/)
    expect(races).toMatch(/RacesPage/)

    const series = read("app/series/[slug]/page.tsx")
    expect(series).toMatch(/coverageByRaceId/)
    expect(series).toMatch(/RaceGrid/)

    const home = read("app/(marketing)/page.tsx")
    expect(home).toMatch(/coverageByRaceId/)
    expect(home).toMatch(/UpcomingRaces/)

    const detail = read("app/races/[id]/page.tsx")
    expect(detail).toMatch(/RaceDetailsPage/)
    expect(detail).toMatch(/coverage=/)
    expect(detail).not.toMatch(/getPublicCoverageSummariesAction\s*\(\s*races/)
  })

  it("keeps client surfaces as renderers of the serializable summary only", () => {
    for (const rel of CLIENT_SURFACES) {
      const source = read(rel)
      expect(source, rel).toMatch(/coverage/i)
      expect(source, rel).not.toMatch(/getCoverageMatrixAction/)
      expect(source, rel).not.toMatch(/from\s+["']@\/db\/db["']/)
      expect(source, rel).not.toMatch(/coverageEvidenceTable/)
      expect(source, rel).not.toMatch(/sourceUrl|source_url/)
      expect(source, rel).not.toMatch(/getPublicCoverageSummariesAction/)
    }

    const details = read("components/races/RaceDetailsPage.tsx")
    expect(details).toMatch(/CoverageBadge/)
    expect(details).toMatch(/FreshnessNote/)
    const badgeAt = details.indexOf("<CoverageBadge")
    const noteAt = details.indexOf("<FreshnessNote")
    const tabsAt = details.search(/id=["']tab-content["']/)
    expect(badgeAt).toBeGreaterThan(-1)
    expect(noteAt).toBeGreaterThan(-1)
    expect(tabsAt).toBeGreaterThan(noteAt)
    expect(badgeAt).toBeLessThan(tabsAt)

    const card = read("components/races/RaceCard.tsx")
    expect(card).toMatch(/CoverageBadge/)
    expect(card).toMatch(/compact/)
    expect(card).not.toMatch(/FreshnessNote/)

    const grid = read("components/races/RaceGrid.tsx")
    expect(grid).toMatch(/coverageByRaceId/)
    expect(grid).toMatch(/coverage=\{/)

    const racesPage = read("components/races/RacesPage.tsx")
    expect(racesPage).toMatch(/coverageByRaceId/)

    const upcoming = read("components/landing/upcoming-races.tsx")
    expect(upcoming).toMatch(/CoverageBadge/)
    expect(upcoming).toMatch(/coverageByRaceId/)
  })

  it("does not add Playwright product branches, retries, or auth bypasses", () => {
    const playwright = read("playwright.config.ts")
    const middleware = read("middleware.ts")
    expect(playwright).toMatch(
      /testMatch:\s*\[\s*["']smoke\.spec\.ts["']\s*,\s*["']catalogue-matrix\.spec\.ts["']\s*,\s*["']admin-coverage\.spec\.ts["']\s*,\s*["']public-coverage\.spec\.ts["']\s*\]/
    )
    expect(playwright).toMatch(/retries:\s*0/)
    expect(middleware).toMatch(/export default clerkMiddleware\s*\(/)
    expect(middleware).not.toMatch(/PLAYWRIGHT/)
    expect(middleware).not.toMatch(/process\.env\.(NODE_ENV|VERCEL_ENV|CI)\b/)
  })

  it("keeps coverage components free of wall-clock reads", () => {
    const badge = read("components/coverage/coverage-badge.tsx")
    const note = read("components/coverage/freshness-note.tsx")
    const lib = read("lib/public-coverage.ts")

    expect(badge).not.toMatch(/Date\.now\s*\(|new Date\s*\(/)
    expect(note).not.toMatch(/Date\.now\s*\(|new Date\s*\(/)
    expect(note).toMatch(/derivedAt/)
    expect(lib).not.toMatch(/Date\.now\s*\(/)
    expect(lib).toMatch(/derivedAt/)
  })
})

describe("card and detail markup wiring", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("composes expired-offer truth from the shared summary without claiming current availability", async () => {
    const { CoverageBadge } = await import("./coverage-badge")
    const { FreshnessNote } = await import("./freshness-note")

    const coverage: PublicCoverageSummary = {
      raceId: "race-expired",
      tier: 2,
      liveOfferState: "expired",
      freshUntil: "2026-09-01T00:00:00.000Z",
      derivedAt: "2026-08-25T12:00:00.000Z"
    }

    const cardHtml = renderToStaticMarkup(
      createElement(CoverageBadge, { summary: coverage, compact: true })
    )
    const detailHtml =
      renderToStaticMarkup(createElement(CoverageBadge, { summary: coverage })) +
      renderToStaticMarkup(createElement(FreshnessNote, { summary: coverage }))

    expect(cardHtml).toContain("Decision guide")
    expect(cardHtml).toContain("No current offers")
    expect(cardHtml).not.toContain("Current offers")
    expect(cardHtml).not.toMatch(/full guide/i)

    expect(detailHtml).toContain("Decision guide")
    expect(detailHtml).toContain("No current offers")
    expect(detailHtml).not.toContain("Current offers")
    expect(detailHtml).toContain("Coverage current until 2026-09-01 00:00 UTC")
  })
})
