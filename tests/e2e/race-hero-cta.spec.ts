import { type Page } from "@playwright/test"
import {
  test,
  expect,
  E2E_FAN_TIPS_ABU_DHABI_NAME,
  E2E_FAN_TIPS_ABU_DHABI_SLUG,
  E2E_MEXICO_CITY_EPRIX_2027_NAME,
  E2E_MEXICO_CITY_EPRIX_2027_SLUG
} from "./fixtures"

const FORBIDDEN_COPY = [
  "Book now",
  "Book Now",
  "Buy tickets",
  "Get ticket alerts"
] as const

async function expectNoForbiddenCopy(page: Page) {
  const text = await page.locator("body").innerText()
  for (const phrase of FORBIDDEN_COPY) {
    expect(text, phrase).not.toContain(phrase)
  }
}

async function expectOneCanonical(page: Page) {
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
}

async function redHeroLabels(page: Page): Promise<string[]> {
  return page
    .locator("[data-race-hero-ctas] button, [data-race-hero-ctas] a")
    .evaluateAll(nodes =>
      nodes
        .filter(node => {
          const color = getComputedStyle(node).backgroundColor.replace(
            /\s+/g,
            ""
          )
          return color === "rgb(225,6,0)"
        })
        .map(node => (node.textContent || "").replace(/\s+/g, " ").trim())
    )
}

async function expectCtasClearOfConsent(page: Page) {
  const ctas = page.locator("[data-race-hero-ctas]")
  const banner = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Usage analytics", exact: true })
  })
  await expect(ctas).toBeVisible()
  await expect(banner).toBeVisible()
  const ctaBox = await ctas.boundingBox()
  const bannerBox = await banner.boundingBox()
  expect(ctaBox).toBeTruthy()
  expect(bannerBox).toBeTruthy()
  expect(ctaBox!.y + ctaBox!.height).toBeLessThanOrEqual(bannerBox!.y + 1)
}

test.describe("race hero CTAs", () => {
  test("Abu Dhabi 2026 has one red Find tickets button that opens the tickets panel", async ({
    page
  }) => {
    for (const viewport of [
      { width: 375, height: 812 },
      { width: 1440, height: 900 }
    ]) {
      await page.setViewportSize(viewport)
      const response = await page.goto(`/races/${E2E_FAN_TIPS_ABU_DHABI_SLUG}`)
      expect(response?.ok()).toBeTruthy()
      await expect(
        page.getByRole("heading", {
          name: E2E_FAN_TIPS_ABU_DHABI_NAME,
          exact: true
        })
      ).toBeVisible()
      await expectCtasClearOfConsent(page)
      expect(await redHeroLabels(page)).toEqual(["Find tickets"])
    }

    await expectOneCanonical(page)
    await expectNoForbiddenCopy(page)
    await expect(
      page.getByRole("button", {
        name: `Find tickets for ${E2E_FAN_TIPS_ABU_DHABI_NAME}`,
        exact: true
      })
    ).toBeVisible()
    await expect(
      page.getByRole("button", {
        name: `Plan your trip to ${E2E_FAN_TIPS_ABU_DHABI_NAME}`,
        exact: true
      })
    ).toBeVisible()

    const canonicalBefore = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href")

    await page
      .getByRole("button", {
        name: `Find tickets for ${E2E_FAN_TIPS_ABU_DHABI_NAME}`,
        exact: true
      })
      .click()

    await expect(page).toHaveURL(/[?&]tab=tickets(?:&|$)/)
    await expect(page.getByText("Yas Marina grandstand")).toBeVisible()
    await expectOneCanonical(page)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      canonicalBefore!
    )
    expect(page.url()).not.toContain("/go/")
    expect(page.url()).not.toContain("/api/redirect")
  })

  test("Mexico City E-Prix 2027 has one red Plan your trip button and the empty note", async ({
    page
  }) => {
    for (const viewport of [
      { width: 375, height: 812 },
      { width: 1440, height: 900 }
    ]) {
      await page.setViewportSize(viewport)
      const response = await page.goto(
        `/races/${E2E_MEXICO_CITY_EPRIX_2027_SLUG}`
      )
      expect(response?.ok()).toBeTruthy()
      await expect(
        page.getByRole("heading", {
          name: E2E_MEXICO_CITY_EPRIX_2027_NAME,
          exact: true
        })
      ).toBeVisible()
      await expectCtasClearOfConsent(page)
      expect(await redHeroLabels(page)).toEqual(["Plan your trip"])
      await expect(
        page.locator("[data-race-hero-ctas]").getByText("Find tickets")
      ).toHaveCount(0)
    }

    await expectOneCanonical(page)
    await expectNoForbiddenCopy(page)
    await expect(
      page.getByText(
        "Tickets aren't listed yet. Check back closer to race weekend."
      )
    ).toBeVisible()

    await page
      .getByRole("button", {
        name: `Plan your trip to ${E2E_MEXICO_CITY_EPRIX_2027_NAME}`,
        exact: true
      })
      .click()

    await expect(page).toHaveURL(/[?&]tab=travel(?:&|$)/)
    await expect(
      page.getByText("Search Flights", { exact: true }).first()
    ).toBeVisible()
    await expectOneCanonical(page)
    await page.getByRole("tab", { name: "Tickets" }).click()
    await expect(page.locator("#tab-content")).toContainText(
      "Tickets aren't listed yet. Check back closer to race weekend."
    )
    await expectOneCanonical(page)
  })

  test("the race calendar does not use Book now, Buy tickets, or Get ticket alerts", async ({
    page
  }) => {
    const response = await page.goto("/races")
    expect(response?.ok()).toBeTruthy()
    await expect(
      page.getByRole("heading", { name: "Race Calendar", exact: true })
    ).toBeVisible()
    await expectNoForbiddenCopy(page)
  })
})