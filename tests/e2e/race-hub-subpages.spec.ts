import { expect, test } from "./fixtures"

const HUB = "/guides/abu-dhabi-grand-prix-travel-guide"
const PATHS = [
  "/guides/abu-dhabi-grand-prix-travel-guide/first-timers",
  "/guides/abu-dhabi-grand-prix-travel-guide/with-kids",
  "/guides/abu-dhabi-grand-prix-travel-guide/what-to-bring"
] as const

test.describe("race hub fan sub-pages", () => {
  test("preview renders the unpublished template and keeps it off the hub and sitemap", async ({
    page,
    request
  }) => {
    await page.setViewportSize({ width: 375, height: 900 })
    const response = await page.goto(PATHS[0])
    expect(response?.status()).toBe(200)

    await expect(page.locator("main")).toHaveCount(1)
    await expect(page.locator("main#main-content")).toHaveCount(1)
    await expect(page.locator("h1")).toHaveCount(1)
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Abu Dhabi Grand Prix first-timers: template sample"
      })
    ).toBeVisible()

    const crumb = page.getByRole("navigation", { name: "breadcrumb" })
    await expect(crumb.getByRole("link", { name: "Guides" })).toHaveAttribute(
      "href",
      "/guides"
    )
    await expect(
      crumb.getByRole("link", { name: "Abu Dhabi GP guide" })
    ).toHaveAttribute("href", HUB)
    await expect(crumb.getByText("First-timers", { exact: true })).toBeVisible()
    await expect(crumb.getByRole("link", { name: "Home" })).toHaveCount(0)

    const answer = page.locator("[data-answer-first]")
    const disclosure = page.getByRole("complementary", {
      name: "Affiliate disclosure"
    })
    await expect(answer).toBeVisible()
    await expect(disclosure).toBeVisible()
    const order = await page.evaluate(() => {
      const overview = document.querySelector("[data-answer-first]")
      const aside = document.querySelector(
        'aside[aria-label="Affiliate disclosure"]'
      )
      return aside === overview?.nextElementSibling
    })
    expect(order).toBe(true)
    const disclosureBox = await disclosure.boundingBox()
    expect(disclosureBox!.y + disclosureBox!.height).toBeLessThan(900)

    await expect(
      page.locator('a[href="https://example.com/fixture-affiliate"]')
    ).toHaveAttribute("rel", "sponsored nofollow")

    const table = page.getByRole("table")
    await expect(
      table.getByRole("columnheader", { name: "Topic" })
    ).toBeVisible()
    await expect(
      table.getByRole("columnheader", { name: "Verdict" })
    ).toBeVisible()
    await expect(table.getByRole("rowheader", { name: "Ticket" })).toBeVisible()
    await expect(page.locator("[data-video-slot=placeholder]")).toBeVisible()
    await expect(page.locator("video, iframe")).toHaveCount(0)
    await expect(
      page.getByRole("navigation", { name: "Plan by fan type" })
    ).toBeVisible()
    await expect(page.getByRole("link", { name: "With kids" })).toHaveCount(0)

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://www.pitlanetravel.com${PATHS[0]}`
    )
    const robots = await page
      .locator('meta[name="robots"]')
      .getAttribute("content")
    expect(robots).toContain("noindex")

    const html = await page.content()
    expect(html).not.toContain("VideoObject")
    expect(html).not.toContain("SportsEvent")
    expect(html).not.toContain("f1-2027-general-admission-vs-grandstand")
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents()
    const parsed = blocks.map(
      block =>
        JSON.parse(block) as {
          "@type"?: string
          mainEntity?: Array<{ name: string; acceptedAnswer: { text: string } }>
          itemListElement?: Array<{ name: string }>
        }
    )
    expect(parsed.map(block => block["@type"]).sort()).toEqual([
      "Article",
      "BreadcrumbList",
      "FAQPage"
    ])
    const faq = parsed.find(block => block["@type"] === "FAQPage")
    expect(faq?.mainEntity?.length).toBeGreaterThanOrEqual(4)
    expect(faq?.mainEntity?.length).toBeLessThanOrEqual(6)
    for (const entity of faq?.mainEntity ?? []) {
      await expect(
        page.getByRole("heading", { name: entity.name, exact: true })
      ).toBeVisible()
      await expect(
        page.getByText(entity.acceptedAnswer.text, { exact: true })
      ).toBeVisible()
    }
    const breadcrumb = parsed.find(block => block["@type"] === "BreadcrumbList")
    expect(breadcrumb?.itemListElement?.map(item => item.name)).toEqual([
      "Guides",
      "Abu Dhabi GP guide",
      "First-timers"
    ])

    const levels = await page.evaluate(() =>
      [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(node =>
        Number(node.tagName.slice(1))
      )
    )
    expect(levels[0]).toBe(1)
    expect(levels.filter(level => level === 1)).toHaveLength(1)
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index]).toBeLessThanOrEqual(levels[index - 1] + 1)
    }

    for (const path of PATHS.slice(1)) {
      const other = await page.goto(path)
      expect(other?.status(), path).toBe(200)
      await expect(page.locator("h1")).toHaveCount(1)
      await expect(page.locator("main")).toHaveCount(1)
      await expect(page.locator("video, iframe")).toHaveCount(0)
    }

    const hub = await page.goto(HUB)
    expect(hub?.ok()).toBeTruthy()
    const hubHtml = await page.content()
    expect(hubHtml).not.toContain("Plan by fan type")
    for (const path of PATHS) {
      expect(hubHtml).not.toContain(path)
    }

    const sitemap = await request.get("/sitemap.xml")
    expect(sitemap.ok()).toBeTruthy()
    const xml = await sitemap.text()
    for (const path of PATHS) {
      expect(xml).not.toContain(path)
    }
    expect(xml).toContain(`https://www.pitlanetravel.com${HUB}`)
  })
})
