import { readFileSync, statSync } from "node:fs"
import path from "node:path"
import {
  test,
  expect,
  CATALOGUE_STATUS_RACES,
  SHARED_CIRCUIT_RACE_SLUGS,
  E2E_CIRCUIT_LOCATION,
  E2E_CIRCUIT_COUNTRY
} from "./fixtures"

const SCENARIOS_MAX_BYTES = 65_536
const MAX_SERIES_ROUTES = 8
const MAX_ERROR_SHELL_MARKERS = 32
const MAX_COVERAGE_ROWS = 8
const SERIES_PATHNAME = /^\/series\/[a-z0-9-]+$/
const SAFE_COVERAGE_PATTERN = /^[\^$/a-z0-9+[\]_-]+$/i


type ScenarioRoute = {
  id: string
  class: string
  pathname: string
  required_markers?: string[]
}

type CoverageScenario = {
  id: string
  class: string
  path_pattern: string
  min_count: number
  max_count: number
  required_markers?: string[]
}

type PublicRouteScenarios = {
  schema_version: number
  error_shell_markers: string[]
  intended_active_series: Array<{ slug: string; name: string }>
  routes: ScenarioRoute[]
  coverage: CoverageScenario[]
}

function loadPublicRouteScenarios(): PublicRouteScenarios {
  const filePath = path.join(
    process.cwd(),
    "data/qa/public-route-scenarios.json"
  )
  const stat = statSync(filePath)
  if (!stat.isFile()) {
    throw new Error("public-route-scenarios.json is not a file")
  }
  if (stat.size > SCENARIOS_MAX_BYTES) {
    throw new Error("public-route-scenarios.json exceeds byte cap")
  }

  const text = readFileSync(filePath, "utf8")
  if (Buffer.byteLength(text, "utf8") > SCENARIOS_MAX_BYTES) {
    throw new Error("public-route-scenarios.json exceeds byte cap")
  }

  const parsed = JSON.parse(text) as PublicRouteScenarios
  if (parsed.schema_version !== 1) {
    throw new Error("unsupported public-route-scenarios schema_version")
  }

  if (
    !Array.isArray(parsed.error_shell_markers) ||
    parsed.error_shell_markers.length < 1 ||
    parsed.error_shell_markers.length > MAX_ERROR_SHELL_MARKERS
  ) {
    throw new Error("error_shell_markers are missing or unbounded")
  }
  for (const marker of parsed.error_shell_markers) {
    if (
      typeof marker !== "string" ||
      marker.length < 1 ||
      marker.length > 200
    ) {
      throw new Error("error_shell_marker is empty or too long")
    }
  }

  if (
    !Array.isArray(parsed.intended_active_series) ||
    parsed.intended_active_series.length < 1 ||
    parsed.intended_active_series.length > MAX_SERIES_ROUTES
  ) {
    throw new Error("intended_active_series is missing or unbounded")
  }

  const seriesSlugs = new Set<string>()
  for (const series of parsed.intended_active_series) {
    if (
      typeof series?.slug !== "string" ||
      !/^[a-z0-9-]+$/.test(series.slug) ||
      typeof series.name !== "string" ||
      series.name.trim().length < 1 ||
      series.name.length > 80 ||
      seriesSlugs.has(series.slug)
    ) {
      throw new Error("intended_active_series row is unsafe or duplicated")
    }
    seriesSlugs.add(series.slug)
  }

  if (
    !Array.isArray(parsed.routes) ||
    parsed.routes.length < 1 ||
    parsed.routes.length > 250
  ) {
    throw new Error("routes are missing or unbounded")
  }

  if (
    !Array.isArray(parsed.coverage) ||
    parsed.coverage.length < 1 ||
    parsed.coverage.length > MAX_COVERAGE_ROWS
  ) {
    throw new Error("coverage is missing or unbounded")
  }

  return parsed
}

const scenarios = loadPublicRouteScenarios()

const seriesRoutes = scenarios.routes.filter(route => route.class === "series")
if (seriesRoutes.length < 1 || seriesRoutes.length > MAX_SERIES_ROUTES) {
  throw new Error("series routes are missing or unbounded")
}

const seriesPathnames = new Set<string>()
for (const route of seriesRoutes) {
  if (!SERIES_PATHNAME.test(route.pathname)) {
    throw new Error("series pathname is unsafe")
  }
  if (seriesPathnames.has(route.pathname)) {
    throw new Error("series pathname is duplicated")
  }
  seriesPathnames.add(route.pathname)
  if (!Array.isArray(route.required_markers) || route.required_markers.length < 1) {
    throw new Error("series route is missing required_markers")
  }
}

for (const series of scenarios.intended_active_series) {
  if (!seriesPathnames.has(`/series/${series.slug}`)) {
    throw new Error("intended series is missing a series route")
  }
}

const guidedCoverage = scenarios.coverage.filter(
  row => row.class === "guided_circuit"
)
if (guidedCoverage.length !== 1) {
  throw new Error("expected exactly one guided_circuit coverage row")
}

const guidedCircuitCoverage = guidedCoverage[0]
if (
  typeof guidedCircuitCoverage.path_pattern !== "string" ||
  !SAFE_COVERAGE_PATTERN.test(guidedCircuitCoverage.path_pattern) ||
  !Number.isInteger(guidedCircuitCoverage.min_count) ||
  !Number.isInteger(guidedCircuitCoverage.max_count) ||
  guidedCircuitCoverage.min_count < 1 ||
  guidedCircuitCoverage.max_count < guidedCircuitCoverage.min_count ||
  guidedCircuitCoverage.max_count > 64
) {
  throw new Error("guided_circuit coverage bounds are unsafe")
}

const guidedPathPattern = new RegExp(guidedCircuitCoverage.path_pattern)
const guidedMarkers = guidedCircuitCoverage.required_markers ?? []
if (guidedMarkers.length < 1 || guidedMarkers.some(marker => marker.length > 200)) {
  throw new Error("guided_circuit required_markers are missing or unbounded")
}

const OTHER_VISIBLE_STATUSES = [
  "Upcoming",
  "Live",
  "Completed",
  "Cancelled"
] as const

async function assertSuccessWithoutErrorShell(
  page: import("@playwright/test").Page,
  response: import("@playwright/test").Response | null,
  label: string
): Promise<void> {
  expect(response, `${label} should return a response`).toBeTruthy()
  expect(response!.ok(), `${label} should be HTTP success`).toBeTruthy()

  const body = await page.locator("body").innerText()
  for (const marker of scenarios.error_shell_markers) {
    expect(body, `${label} must not show a generic error shell`).not.toContain(
      marker
    )
  }
}

test.describe("catalogue matrix", () => {
  test("every intended series route renders its series content", async ({
    page
  }) => {
    for (const route of seriesRoutes) {
      await test.step(route.pathname, async () => {
        const response = await page.goto(route.pathname)
        await assertSuccessWithoutErrorShell(page, response, route.pathname)

        const headingName = `${route.required_markers![0]} Travel`
        await expect(
          page.getByRole("heading", { name: headingName, exact: true })
        ).toBeVisible()

        for (const marker of route.required_markers!) {
          await expect(page.getByText(marker).first()).toBeVisible()
        }
      })
    }
  })

  test("seeded race details expose every status class and the shared circuit", async ({
    page
  }) => {
    expect(CATALOGUE_STATUS_RACES).toHaveLength(4)
    expect(
      new Set(CATALOGUE_STATUS_RACES.map(race => race.derivedStatus)).size
    ).toBe(4)
    expect(SHARED_CIRCUIT_RACE_SLUGS.length).toBeGreaterThanOrEqual(2)

    for (const race of CATALOGUE_STATUS_RACES) {
      await test.step(race.slug, async () => {
        const response = await page.goto(`/races/${race.slug}`)
        await assertSuccessWithoutErrorShell(page, response, race.slug)

        await expect(
          page.getByRole("heading", { name: race.name, exact: true })
        ).toBeVisible()
        await expect(
          page.getByText(race.visibleStatus, { exact: true })
        ).toBeVisible()

        for (const other of OTHER_VISIBLE_STATUSES) {
          if (other === race.visibleStatus) continue
          await expect(
            page.getByText(other, { exact: true })
          ).toHaveCount(0)
        }
      })
    }

    for (const slug of SHARED_CIRCUIT_RACE_SLUGS) {
      await test.step(`shared-circuit:${slug}`, async () => {
        const response = await page.goto(`/races/${slug}`)
        await assertSuccessWithoutErrorShell(page, response, slug)
        await expect(page.getByText(E2E_CIRCUIT_LOCATION)).toBeVisible()
        await expect(page.getByText(E2E_CIRCUIT_COUNTRY)).toBeVisible()
      })
    }
  })

  test("every published guided-circuit route renders page-specific guide content", async ({
    page
  }) => {
    const indexResponse = await page.goto("/circuits/grandstands")
    await assertSuccessWithoutErrorShell(
      page,
      indexResponse,
      "/circuits/grandstands"
    )

    const guideLinks = page.locator(
      'a[href^="/circuits/"][href$="/grandstands"]'
    )
    const guides = await guideLinks.evaluateAll(links =>
      links.map(link => link.getAttribute("href"))
    )

    for (const pathname of guides) {
      if (typeof pathname !== "string" || !guidedPathPattern.test(pathname)) {
        throw new Error("published guided-circuit pathname is unsafe")
      }
    }

    expect(
      guides.length,
      "grandstand index must publish at least one guided-circuit route"
    ).toBeGreaterThanOrEqual(guidedCircuitCoverage.min_count)
    expect(guides.length).toBeLessThanOrEqual(guidedCircuitCoverage.max_count)
    expect(new Set(guides).size, "guided-circuit links must be unique").toBe(
      guides.length
    )

    for (const pathname of guides) {
      if (pathname === null) throw new Error("guided-circuit link is missing href")
      await test.step(pathname, async () => {
        const response = await page.goto(pathname)
        await assertSuccessWithoutErrorShell(page, response, pathname)

        const heading = page.getByRole("heading", { level: 1 })
        await expect(heading).toBeVisible()
        const headingText = (await heading.innerText()).trim()
        for (const marker of guidedMarkers) {
          expect(headingText).toContain(marker)
        }
        expect(headingText.length).toBeGreaterThan(guidedMarkers[0].length)
        await expect(
          page.getByRole("heading", { name: "Grandstand Guides", exact: true })
        ).toHaveCount(0)
      })
    }
  })
})
