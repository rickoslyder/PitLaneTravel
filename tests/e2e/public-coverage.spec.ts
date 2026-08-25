import type { Page } from "@playwright/test"
import {
  test,
  expect,
  PUBLIC_COVERAGE_TIER_CASES,
  PUBLIC_COVERAGE_SEARCH_QUERY,
  E2E_RACE_COMPLETED_NAME,
  E2E_RACE_COMPLETED_SLUG,
  E2E_RACE_NAME,
  E2E_RACE_SLUG
} from "./fixtures"

const SIX_DEPTH_LABELS = [
  "No verified coverage",
  "Calendar only",
  "Logistics",
  "Decision guide",
  "Live offers",
  "Personalized plan"
] as const

const SECRET_MARKERS = [
  "https://coverage.invalid/",
  "Synthetic calendar evidence",
  "Synthetic logistics evidence",
  "Synthetic decision_guide evidence",
  "Synthetic live_offer evidence",
  "Synthetic personalized_plan evidence",
  "source_url",
  "sourceUrl",
  "token=",
  "officialSource",
  "inventoryAvailable",
  "taggedLink",
  "attributionConfigured",
  "completeInputs",
  "sourceBackedRecommendations",
  "handoffsTracked"
] as const

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

function coverageBadgeFor(page: Page, name: string) {
  return page
    .getByRole("heading", { name, exact: true })
    .locator("xpath=following-sibling::*[@data-coverage-badge]")
}

async function filterPublicCoverageCards(page: Page): Promise<void> {
  const response = await page.goto("/races")
  expect(response, "/races should return a response").toBeTruthy()
  expect(response!.ok(), "/races should be HTTP success").toBeTruthy()

  await expect(
    page.getByRole("heading", { name: "Race Calendar", exact: true })
  ).toBeVisible()

  await page.getByRole("searchbox").fill(PUBLIC_COVERAGE_SEARCH_QUERY)

  for (const race of PUBLIC_COVERAGE_TIER_CASES) {
    await expect(
      page.getByRole("heading", { name: race.name, exact: true })
    ).toBeVisible()
  }
}

function assertNoSecretLeakage(html: string): void {
  for (const marker of SECRET_MARKERS) {
    expect(html, `public HTML must not expose ${marker}`).not.toContain(marker)
  }
}

test.describe("public coverage honesty", () => {
  test("races calendar shows exact six-tier cards with truthful labels and screenshots", async ({
    page
  }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await filterPublicCoverageCards(page)

    expect(PUBLIC_COVERAGE_TIER_CASES.map(race => race.depthLabel)).toEqual([
      ...SIX_DEPTH_LABELS
    ])

    for (const race of PUBLIC_COVERAGE_TIER_CASES) {
      const badge = coverageBadgeFor(page, race.name)
      await expect(badge).toBeVisible()
      await expect(badge.getByText(race.depthLabel, { exact: true })).toBeVisible()
      await expect(badge.getByText(race.offerLabel, { exact: true })).toBeVisible()
      await expect(badge).toHaveAttribute("data-coverage-tone", race.tone)
      await expect(badge.getByText("full guide", { exact: false })).toHaveCount(0)

      if (race.offerLabel === "No current offers") {
        await expect(
          badge.getByText("Current offers", { exact: true })
        ).toHaveCount(0)
      }
    }

    const mutedCases = PUBLIC_COVERAGE_TIER_CASES.filter(
      race => race.tone === "muted"
    )
    expect(mutedCases.map(race => race.tier)).toEqual([null, 0])

    assertNoSecretLeakage(await page.content())
    await assertDocumentDoesNotHorizontallyOverflow(page, "desktop 1440x1000")

    const desktopPath = testInfo.outputPath("public-coverage-desktop.png")
    await page.screenshot({
      path: desktopPath,
      fullPage: true,
      animations: "disabled"
    })
    await testInfo.attach("public-coverage-desktop.png", {
      path: desktopPath,
      contentType: "image/png"
    })

    await page.setViewportSize({ width: 390, height: 844 })
    for (const race of PUBLIC_COVERAGE_TIER_CASES) {
      const badge = coverageBadgeFor(page, race.name)
      await expect(badge).toBeVisible()
      await expect(badge.getByText(race.depthLabel, { exact: true })).toBeVisible()
    }
    await assertDocumentDoesNotHorizontallyOverflow(page, "mobile 390x844")

    const mobilePath = testInfo.outputPath("public-coverage-mobile.png")
    await page.screenshot({
      path: mobilePath,
      fullPage: true,
      animations: "disabled"
    })
    await testInfo.attach("public-coverage-mobile.png", {
      path: mobilePath,
      contentType: "image/png"
    })
  })

  test("detail pages put badge and freshness before tabs and never treat expired offers as current", async ({
    page
  }) => {
    const expired = await page.goto(`/races/${E2E_RACE_COMPLETED_SLUG}`)
    expect(expired, "expired-offer detail should return a response").toBeTruthy()
    expect(expired!.ok(), "expired-offer detail should be HTTP success").toBeTruthy()

    const expiredBadge = page.locator("[data-coverage-badge]").first()
    const freshness = page.locator("[data-freshness-note]").first()
    const tabContent = page.locator("#tab-content")

    await expect(expiredBadge).toBeVisible()
    await expect(
      expiredBadge.getByText("Decision guide", { exact: true })
    ).toBeVisible()
    await expect(
      expiredBadge.getByText("No current offers", { exact: true })
    ).toBeVisible()
    await expect(
      expiredBadge.getByText("Current offers", { exact: true })
    ).toHaveCount(0)
    await expect(freshness).toBeVisible()
    await expect(tabContent).toBeVisible()

    const expiredBadgeBox = await expiredBadge.boundingBox()
    const freshnessBox = await freshness.boundingBox()
    const tabBox = await tabContent.boundingBox()
    expect(expiredBadgeBox, "expired coverage badge bounds").toBeTruthy()
    expect(freshnessBox, "freshness note bounds").toBeTruthy()
    expect(tabBox, "tab-content bounds").toBeTruthy()
    expect(expiredBadgeBox!.y).toBeLessThan(tabBox!.y)
    expect(freshnessBox!.y).toBeLessThan(tabBox!.y)

    assertNoSecretLeakage(await page.content())

    const current = await page.goto(`/races/${E2E_RACE_SLUG}`)
    expect(current, "current-offer detail should return a response").toBeTruthy()
    expect(current!.ok(), "current-offer detail should be HTTP success").toBeTruthy()

    const currentBadge = page.locator("[data-coverage-badge]").first()
    await expect(
      page.getByRole("heading", { name: E2E_RACE_NAME, exact: true })
    ).toBeVisible()
    await expect(
      currentBadge.getByText("Live offers", { exact: true })
    ).toBeVisible()
    await expect(
      currentBadge.getByText("Current offers", { exact: true })
    ).toBeVisible()
    await expect(
      page.getByText(E2E_RACE_COMPLETED_NAME, { exact: true })
    ).toHaveCount(0)
    assertNoSecretLeakage(await page.content())
  })
})
