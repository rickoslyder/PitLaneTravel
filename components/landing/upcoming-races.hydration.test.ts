import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const SOURCE_PATH = path.join(
  process.cwd(),
  "components/landing/upcoming-races.tsx"
)

function readSource(): string {
  return readFileSync(SOURCE_PATH, "utf8")
}

function runRenderTimeVisibleCount(
  source: string,
  windowLike: { innerWidth: number } | undefined
): number | null {
  const match = source.match(
    /const getVisibleCount = \(\) => \{([\s\S]*?)\n  \}/
  )
  if (!match) return null
  const fn = new Function(
    "window",
    `"use strict"; const getVisibleCount = () => {${match[1]}\n}; return getVisibleCount();`
  )
  return fn(windowLike) as number
}

describe("UpcomingRaces hydration-safe visible count", () => {
  it("does not slice cards from a render-time window.innerWidth read (React #418)", () => {
    const source = readSource()
    const ssr = runRenderTimeVisibleCount(source, undefined)
    const at1440 = runRenderTimeVisibleCount(source, { innerWidth: 1440 })
    const at390 = runRenderTimeVisibleCount(source, { innerWidth: 390 })

    // If render still calls getVisibleCount(), SSR HTML and the first client
    // paint must emit the same child count. Today SSR returns 4 while the
    // Playwright 1440px viewport returns 3 (and mobile returns 1) — React #418.
    if (ssr !== null) {
      expect(
        { ssr, at1440, at390 },
        "SSR HTML and the first client render must emit the same card count; window.innerWidth at 1440px currently yields 3 vs SSR 4"
      ).toEqual({
        ssr: 4,
        at1440: 4,
        at390: 4
      })
    }

    // Hydration-safe boundary: viewport width may be read only from a client
    // snapshot after subscribe (useSyncExternalStore / state+effect), never as
    // a render-time branch that changes the sliced card list. True hydrateRoot
    // is impractical in this node Vitest environment.
    expect(source).toMatch(/useSyncExternalStore/)
    expect(source).toMatch(/getUpcomingRacesViewportSnapshot/)
    expect(source).toMatch(/getUpcomingRacesServerSnapshot/)
    expect(source).toMatch(/addEventListener\(\s*["']resize["']/)
    expect(source).toMatch(/upcomingRacesVisibleCount\(\s*window\.innerWidth\s*\)/)
    expect(source).toMatch(/upcomingRacesNextIndex/)
    expect(source).toMatch(/upcomingRacesPrevIndex/)
    expect(source).toMatch(/upcomingRacesNextDisabled/)
    expect(source).toMatch(/upcomingRacesPrevDisabled/)
    expect(source).not.toMatch(/typeof window === ["']undefined["']/)
    expect(source).not.toMatch(/const visibleCount = getVisibleCount\(\)/)
    expect(source).not.toMatch(/suppressHydrationWarning/)
    expect(source).not.toMatch(/ssr:\s*false/)
    expect(source).toMatch(/CoverageBadge/)
    expect(source).toMatch(/coverageByRaceId/)
  })

  it("getUpcomingRacesServerSnapshot returns UPCOMING_RACES_SSR_VISIBLE_COUNT, not a viewport read", () => {
    const source = readSource()
    const match = source.match(
      /function getUpcomingRacesServerSnapshot\(\) \{([\s\S]*?)\n\}/
    )
    expect(
      match,
      "getUpcomingRacesServerSnapshot must exist as a named function"
    ).not.toBeNull()

    const body = match![1]
    expect(body).toMatch(/return UPCOMING_RACES_SSR_VISIBLE_COUNT/)
    expect(body).not.toMatch(/window/)
    expect(body).not.toMatch(/innerWidth/)
    expect(body).not.toMatch(/upcomingRacesVisibleCount/)

    const runServerSnapshot = new Function(
      "UPCOMING_RACES_SSR_VISIBLE_COUNT",
      "window",
      `"use strict"; ${match![0]}; return getUpcomingRacesServerSnapshot();`
    ) as (
      count: number,
      windowLike: { innerWidth: number } | undefined
    ) => number

    // First hydration render must use this snapshot. A window.innerWidth
    // read here would recreate React #418 (4 vs 3 at 1440 / 1 at 390).
    expect(runServerSnapshot(4, undefined)).toBe(4)
    expect(runServerSnapshot(4, { innerWidth: 1440 })).toBe(4)
    expect(runServerSnapshot(4, { innerWidth: 390 })).toBe(4)
  })

  it("keeps the SSR/hydration snapshot at 4 and maps viewport widths after subscribe", async () => {
    const {
      UPCOMING_RACES_SSR_VISIBLE_COUNT,
      upcomingRacesVisibleCount
    } = await import("./upcoming-races-visible-count")

    expect(UPCOMING_RACES_SSR_VISIBLE_COUNT).toBe(4)
    expect(upcomingRacesVisibleCount(390)).toBe(1)
    expect(upcomingRacesVisibleCount(767)).toBe(1)
    expect(upcomingRacesVisibleCount(768)).toBe(4)
    expect(upcomingRacesVisibleCount(1023)).toBe(4)
    expect(upcomingRacesVisibleCount(1024)).toBe(3)
    expect(upcomingRacesVisibleCount(1440)).toBe(3)
    expect(upcomingRacesVisibleCount(1535)).toBe(3)
    expect(upcomingRacesVisibleCount(1536)).toBe(4)
  })

  it("advances and disables arrows from the visible count", async () => {
    const {
      upcomingRacesNextDisabled,
      upcomingRacesNextIndex,
      upcomingRacesPrevDisabled,
      upcomingRacesPrevIndex
    } = await import("./upcoming-races-visible-count")

    expect(upcomingRacesPrevDisabled(0)).toBe(true)
    expect(upcomingRacesPrevDisabled(3)).toBe(false)
    expect(upcomingRacesNextDisabled(0, 4, 4)).toBe(true)
    expect(upcomingRacesNextDisabled(0, 3, 4)).toBe(false)
    expect(upcomingRacesNextDisabled(6, 3, 8)).toBe(true)

    expect(upcomingRacesNextIndex(0, 3, 8)).toBe(3)
    expect(upcomingRacesNextIndex(6, 3, 8)).toBe(0)
    expect(upcomingRacesPrevIndex(0, 3, 8)).toBe(5)
    expect(upcomingRacesPrevIndex(3, 3, 8)).toBe(0)
  })
})
