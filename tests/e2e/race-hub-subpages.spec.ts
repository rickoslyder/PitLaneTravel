import { expect, test } from "./fixtures"

const HUB = "/guides/abu-dhabi-grand-prix-travel-guide"
const PAGES = [
  {
    path: "/guides/abu-dhabi-grand-prix-travel-guide/first-timers",
    title: "Abu Dhabi GP for first-timers: tickets, app, what to expect",
    heading:
      "Abu Dhabi Grand Prix for first-timers: tickets, timings and what to expect at Yas Marina",
    crumb: "First-timers",
    sentence:
      "Formula 2 and the AZM GT Trophy support races (official F1 timetable)",
    affiliate: "https://airalo.pxf.io/PzEM6e"
  },
  {
    path: "/guides/abu-dhabi-grand-prix-travel-guide/with-kids",
    title: "Abu Dhabi GP with kids: tickets, ages and ear protection",
    heading:
      "Abu Dhabi Grand Prix with kids: child tickets, age limits, ear protection and food rules",
    crumb: "With kids",
    sentence: "Kids Go Free Friday",
    affiliate: "https://airalo.pxf.io/PzEM6e"
  },
  {
    path: "/guides/abu-dhabi-grand-prix-travel-guide/what-to-bring",
    title: "What can you bring to the Abu Dhabi GP? Yas Marina rules",
    heading:
      "What you can bring to the Abu Dhabi Grand Prix: Yas Marina banned items, bags and cameras",
    crumb: "What to bring",
    sentence:
      "That ban doesn't name phones, and the organiser's conditions of entry (January 2025 edition) allow mobile phones and permit recordings for private, non-commercial use only.",
    affiliate: "https://f1.pxf.io/5kEv72"
  }
] as const

test.describe("Abu Dhabi fan-type sub-pages", () => {
  test("published copy renders, and the hub lists the three pages", async ({
    page,
    request
  }) => {
    for (const item of PAGES) {
      const response = await page.goto(item.path)
      expect(response?.status(), item.path).toBe(200)
      await expect(page.locator("main")).toHaveCount(1)
      await expect(page.locator("h1")).toHaveCount(1)
      await expect(
        page.getByRole("heading", { level: 1, name: item.heading })
      ).toBeVisible()
      await expect(page.getByText(item.sentence).first()).toBeVisible()

      const crumb = page.getByRole("navigation", { name: "breadcrumb" })
      await expect(crumb.getByRole("link", { name: "Guides" })).toHaveAttribute(
        "href",
        "/guides"
      )
      await expect(
        crumb.getByRole("link", { name: "Abu Dhabi GP" })
      ).toHaveAttribute("href", HUB)
      await expect(crumb.getByText(item.crumb, { exact: true })).toBeVisible()

      const disclosureFollows = await page.evaluate(() => {
        const overview = document.querySelector("[data-answer-first]")
        return overview?.nextElementSibling?.textContent?.startsWith(
          "Some links on this page are affiliate links."
        )
      })
      expect(disclosureFollows, item.path).toBe(true)

      await expect(page.locator(`a[href="${item.affiliate}"]`)).toHaveAttribute(
        "rel",
        "sponsored nofollow"
      )
      await expect(page.locator("video, iframe")).toHaveCount(0)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://www.pitlanetravel.com${item.path}`
      )
      const robots = await page
        .locator('meta[name="robots"]')
        .getAttribute("content")
      expect(robots).toContain("index")
      expect(robots).not.toContain("noindex")

      const html = await page.content()
      expect(html).not.toContain("VideoObject")
      expect(html).not.toContain("SportsEvent")
      expect(html).not.toContain("f1-2027-general-admission-vs-grandstand")
      expect(html).toContain(
        "on the official F1 calendar as of 16 November 2026"
      )

      const blocks = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents()
      const parsed = blocks.map(
        block =>
          JSON.parse(block) as {
            "@type"?: string
            headline?: string
            mainEntity?: Array<{
              name: string
              acceptedAnswer: { text: string }
            }>
            itemListElement?: Array<{ name: string }>
          }
      )
      expect(parsed.map(block => block["@type"]).sort()).toEqual([
        "Article",
        "BreadcrumbList",
        "FAQPage"
      ])
      const articleLd = parsed.find(block => block["@type"] === "Article")
      expect(articleLd?.headline).toBe(item.heading)
      const faq = parsed.find(block => block["@type"] === "FAQPage")
      expect(faq?.mainEntity).toHaveLength(5)
      for (const entity of faq?.mainEntity ?? []) {
        await expect(page.getByText(entity.name, { exact: true })).toBeVisible()
        await expect(page.getByText(entity.acceptedAnswer.text)).toBeVisible()
      }
      const breadcrumb = parsed.find(
        block => block["@type"] === "BreadcrumbList"
      )
      expect(breadcrumb?.itemListElement?.map(entry => entry.name)).toEqual([
        "Guides",
        "Abu Dhabi GP",
        item.crumb
      ])

      const levels = await page.evaluate(() =>
        [
          ...document.querySelectorAll(
            "#main-content h1, #main-content h2, #main-content h3, #main-content h4"
          )
        ].map(node => Number(node.tagName.slice(1)))
      )
      expect(levels[0]).toBe(1)
      expect(levels.filter(level => level === 1)).toHaveLength(1)
      for (let index = 1; index < levels.length; index += 1) {
        expect(levels[index]).toBeLessThanOrEqual(levels[index - 1] + 1)
      }
    }

    const hub = await page.goto(HUB)
    expect(hub?.ok()).toBeTruthy()
    await expect(
      page.getByRole("navigation", { name: "Plan by fan type" })
    ).toBeVisible()
    for (const item of PAGES) {
      await expect(page.locator(`a[href="${item.path}"]`).first()).toBeVisible()
    }

    const sitemap = await request.get("/sitemap.xml")
    expect(sitemap.ok()).toBeTruthy()
    const xml = await sitemap.text()
    for (const item of PAGES) {
      expect(xml).toContain(`https://www.pitlanetravel.com${item.path}`)
    }
  })
})
