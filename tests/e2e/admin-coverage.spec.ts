import type { Page } from "@playwright/test"
import {
  test,
  expect,
  applyEphemeralClerkSession,
  ephemeralClerkCookieHeader,
  ADMIN_COVERAGE_MATRIX_MARKERS,
  CATALOGUE_STATUS_RACES,
  E2E_RACE_NAME,
  E2E_RACE_COMPLETED_NAME,
  E2E_RACE_CANCELLED_NAME
} from "./fixtures"

function assertNoMatrixContent(body: string): void {
  for (const marker of ADMIN_COVERAGE_MATRIX_MARKERS) {
    expect(body, "admin coverage matrix must stay hidden").not.toContain(marker)
  }
}

async function assertDocumentDoesNotHorizontallyOverflow(
  page: Page,
  label: string
): Promise<void> {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth
  }))
  expect(
    metrics.documentScrollWidth,
    `${label} documentElement.scrollWidth ${metrics.documentScrollWidth} > innerWidth ${metrics.innerWidth}`
  ).toBeLessThanOrEqual(metrics.innerWidth)
  expect(
    metrics.bodyScrollWidth,
    `${label} body.scrollWidth ${metrics.bodyScrollWidth} > innerWidth ${metrics.innerWidth}`
  ).toBeLessThanOrEqual(metrics.innerWidth)
}

test.describe("admin coverage access", () => {
  test("anonymous /admin/coverage is redirected by Clerk middleware and hides the matrix", async ({
    request
  }) => {
    const response = await request.get("/admin/coverage", { maxRedirects: 0 })
    expect(response.status(), "/admin/coverage should stay on the 307").toBe(307)

    const location = response.headers()["location"]
    expect(location, "/admin/coverage Location header").toBeTruthy()
    const arrived = new URL(location!, "http://localhost:3100")
    expect(arrived.pathname).toMatch(/\/login\/?$/)
    expect(arrived.searchParams.get("redirect_url")).toBe("/admin/coverage")

    assertNoMatrixContent(await response.text())
  })

  test("signed non-admin is redirected by the admin layout and hides the matrix", async ({
    page
  }) => {
    await applyEphemeralClerkSession(page, "nonadmin")

    const response = await page.request.get("/admin/coverage", {
      maxRedirects: 0,
      headers: { cookie: ephemeralClerkCookieHeader("nonadmin") }
    })
    expect(
      response.status(),
      "/admin/coverage should stay on the signed non-admin 307"
    ).toBe(307)

    const location = response.headers()["location"]
    expect(location, "signed non-admin Location header").toBeTruthy()
    const arrived = new URL(location!, "http://localhost:3100")
    expect(arrived.pathname).toMatch(/^\/$/)
    assertNoMatrixContent(await response.text())

    await page.goto("/admin/coverage")
    await expect(page).toHaveURL(/\/$/)
    for (const marker of ADMIN_COVERAGE_MATRIX_MARKERS) {
      await expect(page.getByText(marker, { exact: true })).toHaveCount(0)
    }
  })

  test("signed admin receives the derived coverage matrix for seeded races", async ({
    page
  }) => {
    await applyEphemeralClerkSession(page, "admin")

    const response = await page.goto("/admin/coverage")
    expect(response, "/admin/coverage should return a response").toBeTruthy()
    expect(response!.ok(), "/admin/coverage should be HTTP success").toBeTruthy()
    await expect(page).toHaveURL(/\/admin\/coverage\/?$/)

    await expect(
      page.getByRole("heading", { name: "Coverage", exact: true })
    ).toBeVisible()

    const summary = page.getByRole("list", { name: "Coverage summary" })
    await expect(summary.getByText(/^Total \d+$/)).toBeVisible()
    await expect(summary.getByText(/^No verified coverage \d+$/)).toBeVisible()
    await expect(summary.getByText(/^Tier 0 \d+$/)).toBeVisible()
    await expect(summary.getByText(/^Tier 1 \d+$/)).toBeVisible()
    await expect(summary.getByText(/^Tier 2 \d+$/)).toBeVisible()
    await expect(summary.getByText(/^Tier 3 \d+$/)).toBeVisible()
    await expect(summary.getByText(/^Tier 4 \d+$/)).toBeVisible()

    const table = page.getByRole("table", {
      name: "Coverage matrix for every supplied event"
    })
    await expect(table).toBeVisible()

    for (const race of CATALOGUE_STATUS_RACES) {
      await expect(
        table.getByRole("row", { name: new RegExp(race.name) })
      ).toBeVisible()
    }

    const missingRow = table.getByRole("row", {
      name: new RegExp(E2E_RACE_CANCELLED_NAME)
    })
    await expect(
      missingRow.getByText("No verified coverage", { exact: true }).first()
    ).toBeVisible()
    await expect(
      missingRow.getByText("Add missing calendar evidence", { exact: true })
    ).toBeVisible()
    await expect(
      missingRow.getByText("No current offers", { exact: true })
    ).toBeVisible()
    await expect(missingRow.getByText("missing", { exact: true }).first()).toBeVisible()

    const expiredRow = table.getByRole("row", {
      name: new RegExp(E2E_RACE_COMPLETED_NAME)
    })
    await expect(expiredRow.getByText("Tier 2", { exact: true })).toBeVisible()
    await expect(
      expiredRow.getByText("Limited by expired live offer", { exact: true })
    ).toBeVisible()
    await expect(
      expiredRow.getByText("Offers expired", { exact: true })
    ).toBeVisible()
    await expect(
      expiredRow.getByText("Refresh expired live-offer evidence", { exact: true })
    ).toBeVisible()
    await expect(expiredRow.getByText("expired", { exact: true })).toBeVisible()
    await expect(
      expiredRow.getByText("1999-06-12 12:00 UTC", { exact: true })
    ).toBeVisible()
    await expect(page.getByText("1999-06-12T12:00:00.000Z")).toHaveCount(0)

    const currentRow = table.getByRole("row", {
      name: new RegExp(E2E_RACE_NAME)
    })
    await expect(currentRow.getByText("Tier 3", { exact: true })).toBeVisible()
    await expect(
      currentRow.getByText("Limited by missing personalized plan", {
        exact: true
      })
    ).toBeVisible()
    await expect(
      currentRow.getByText("Current inventory", { exact: true })
    ).toBeVisible()
    await expect(
      currentRow.getByText("Add missing personalized-plan evidence", {
        exact: true
      })
    ).toBeVisible()
    await expect(currentRow.getByText("current", { exact: true }).first()).toBeVisible()
    await expect(
      currentRow.getByText("2099-09-15 12:00 UTC", { exact: true })
    ).toBeVisible()
    await expect(
      missingRow.getByText("2098-04-01 12:00 UTC", { exact: true })
    ).toBeVisible()

    const matrixRegion = page.getByRole("region", { name: "Coverage matrix" })
    await expect(matrixRegion).toBeVisible()

    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(
      page.getByRole("heading", { name: "Coverage", exact: true })
    ).toBeVisible()
    await expect(page.getByRole("link", { name: "Coverage" })).toBeVisible()
    const mobileMenu = page.locator('summary[aria-label="Admin menu"]')
    await expect(mobileMenu).toBeHidden()
    await assertDocumentDoesNotHorizontallyOverflow(page, "desktop 1440")

    await page.setViewportSize({ width: 390, height: 844 })
    const mobileHeading = page.getByRole("heading", {
      name: "Coverage",
      exact: true
    })
    await expect(mobileMenu).toBeVisible()
    await expect(mobileHeading).toBeVisible()
    await expect(mobileHeading).toBeInViewport()
    await expect(
      page.getByRole("list", { name: "Coverage summary" })
    ).toBeInViewport()
    await expect(matrixRegion).toBeInViewport()
    await assertDocumentDoesNotHorizontallyOverflow(page, "mobile 390")

    const overflow = await page.evaluate(() => {
      const region = document.querySelector(
        '[aria-label="Coverage matrix"]'
      ) as HTMLElement | null
      const tableEl = document.querySelector("table")
      if (!region || !tableEl) return null
      return {
        innerWidth: window.innerWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        regionClientWidth: region.clientWidth,
        regionScrollWidth: region.scrollWidth,
        tableScrollWidth: tableEl.scrollWidth,
        overflowX: getComputedStyle(region).overflowX
      }
    })
    expect(overflow, "coverage matrix overflow region").toBeTruthy()
    expect(["auto", "scroll"]).toContain(overflow!.overflowX)
    expect(overflow!.regionScrollWidth).toBeGreaterThan(overflow!.regionClientWidth)
    expect(overflow!.tableScrollWidth).toBeGreaterThan(overflow!.regionClientWidth)
    expect(overflow!.documentScrollWidth).toBeLessThanOrEqual(overflow!.innerWidth)
    expect(overflow!.bodyScrollWidth).toBeLessThanOrEqual(overflow!.innerWidth)

    await mobileMenu.click()
    await expect(page.getByRole("link", { name: "Coverage" })).toBeVisible()
  })
})
