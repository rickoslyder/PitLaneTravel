import type { Page } from "@playwright/test"
import {
  test,
  expect,
  E2E_CIRCUIT_NAME,
  E2E_IMAGELESS_CIRCUIT_NAME,
  E2E_IMAGELESS_RACE_NAME,
  E2E_RACE_CANCELLED_SLUG,
  E2E_RACE_COMPLETED_SLUG,
  E2E_RACE_IN_PROGRESS_NAME,
  E2E_RACE_NAME,
  E2E_RACE_SLUG
} from "./fixtures"

test.describe("production smoke", () => {
  test("homepage is served and shows seeded upcoming race from the async server page", async ({
    page
  }) => {
    const response = await page.goto("/")
    expect(response, "homepage should return a response").toBeTruthy()
    expect(response!.ok(), "homepage should be HTTP success").toBeTruthy()

    await expect(page.getByText("PitLane Travel").first()).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Upcoming Races", exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: E2E_RACE_NAME, exact: true })
    ).toBeVisible()
  })

  test("races calendar is served and lists the seeded race", async ({
    page
  }) => {
    const response = await page.goto("/races")
    expect(response, "/races should return a response").toBeTruthy()
    expect(response!.ok(), "/races should be HTTP success").toBeTruthy()

    await expect(
      page.getByRole("heading", { name: "Race Calendar", exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: E2E_RACE_NAME, exact: true })
    ).toBeVisible()
  })

  test("async race detail server component renders the seeded race by slug", async ({
    page
  }) => {
    const response = await page.goto(`/races/${E2E_RACE_SLUG}`)
    expect(response, "race detail should return a response").toBeTruthy()
    expect(response!.ok(), "race detail should be HTTP success").toBeTruthy()

    await expect(
      page.getByRole("heading", { name: E2E_RACE_NAME, exact: true })
    ).toBeVisible()
    await expect(page.getByText("E2E Fixture City")).toBeVisible()
  })

  test("race page does not scroll sideways at 375 or 768", async ({ page }) => {
    for (const width of [375, 768]) {
      await page.setViewportSize({ width, height: 900 })
      const response = await page.goto(`/races/${E2E_RACE_SLUG}`)
      expect(response, "race detail should return a response").toBeTruthy()
      expect(response!.ok(), "race detail should be HTTP success").toBeTruthy()
      await expect(
        page.getByRole("heading", { name: E2E_RACE_NAME, exact: true })
      ).toBeVisible()

      const metrics = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        documentScrollWidth: document.documentElement.scrollWidth
      }))
      expect(
        metrics.documentScrollWidth,
        `${width}px documentElement.scrollWidth ${metrics.documentScrollWidth} > innerWidth ${metrics.innerWidth}`
      ).toBeLessThanOrEqual(metrics.innerWidth)
    }
  })

  test("grandstand guides is served and shows the seeded circuit", async ({
    page
  }) => {
    const response = await page.goto("/circuits/grandstands")
    expect(response, "grandstands should return a response").toBeTruthy()
    expect(response!.ok(), "grandstands should be HTTP success").toBeTruthy()

    await expect(
      page.getByRole("heading", { name: "Grandstand Guides", exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: E2E_CIRCUIT_NAME, exact: true })
    ).toBeVisible()
  })

  test("race compare is served and can pick the seeded race", async ({
    page
  }) => {
    const response = await page.goto("/races/compare")
    expect(response, "compare should return a response").toBeTruthy()
    expect(response!.ok(), "compare should be HTTP success").toBeTruthy()

    await expect(
      page.getByRole("heading", { name: "Compare Race Weekends", exact: true })
    ).toBeVisible()

    await page.getByRole("button", { name: "Add a race", exact: true }).click()
    await expect(page.getByText(E2E_RACE_NAME, { exact: true })).toBeVisible()
  })

  test("anonymous /trips redirects to /login with redirect intent and hides trip content", async ({
    request
  }) => {
    const response = await request.get("/trips", { maxRedirects: 0 })
    expect(response.status(), "/trips should stay on the 307").toBe(307)

    const location = response.headers()["location"]
    expect(location, "/trips Location header").toBeTruthy()
    const arrived = new URL(location!, "http://localhost:3100")
    expect(arrived.pathname).toMatch(/\/login\/?$/)
    expect(arrived.searchParams.get("redirect_url")).toBe("/trips")

    const body = await response.text()
    expect(body).not.toMatch(/Your Trips/)
    expect(body).not.toMatch(/No Trips Yet/)
    expect(body).not.toMatch(/Error Loading Trips/)
    expect(body).not.toMatch(/Manage and plan your F1 race weekends/)
  })

  test("guides index lists both articles", async ({ page }) => {
    const response = await page.goto("/guides")
    expect(response, "/guides should return a response").toBeTruthy()
    expect(response!.ok(), "/guides should be HTTP success").toBeTruthy()

    await expect(
      page.getByRole("heading", { name: "Guides", exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole("link", {
        name: "Your First Race: F1, MotoGP, Le Mans, Formula E or Indy 500?",
        exact: true
      })
    ).toBeVisible()
    await expect(
      page.getByRole("link", {
        name: "Two Races, One Trip: Best Cross-Series Pairings for 2027",
        exact: true
      })
    ).toBeVisible()
    await expect(
      page.getByRole("link", {
        name: "WEC 2027 Launch Week (10–16 Nov): Which Round to Book",
        exact: true
      })
    ).toBeVisible()
    await expect(
      page.getByRole("link", {
        name: "Azerbaijan Grand Prix 2027 Tickets: 20% Early Bird, Best Grandstands",
        exact: true
      })
    ).toBeVisible()
  })

  test("which-race-first guide renders the article, a race link, and JSON-LD", async ({
    page
  }) => {
    const response = await page.goto("/guides/which-race-first-2027")
    expect(response, "guide article should return a response").toBeTruthy()
    expect(response!.ok(), "guide article should be HTTP success").toBeTruthy()

    await expect(
      page.getByRole("heading", {
        name: "Which motorsport race should you go to first? F1, MotoGP, Le Mans, Formula E or the Indy 500",
        exact: true
      })
    ).toBeVisible()
    await expect(
      page.getByRole("link", {
        name: "British Grand Prix race page",
        exact: true
      })
    ).toBeVisible()
    await expect(
      page.getByRole("link", {
        name: "Two Races, One Trip: Best Cross-Series Pairings for 2027",
        exact: true
      })
    ).toBeVisible()

    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents()
    const parsed = blocks.map(
      block => JSON.parse(block) as { "@type"?: string }
    )
    expect(parsed.some(block => block["@type"] === "Article")).toBe(true)
    expect(parsed.some(block => block["@type"] === "BreadcrumbList")).toBe(true)
  })

  test("WEC and Baku guides render indexable articles on mobile and desktop", async ({
    page
  }) => {
    const cases = [
      {
        path: "/guides/wec-2027-launch-week",
        heading: "WEC 2027 Launch Week: which round to book, and what it costs",
        disclosure:
          "This page has two affiliate links: Airalo (eSIMs) and Omio (trains and buses).",
        faq: "When is WEC Launch Week 2026?",
        omio: true
      },
      {
        path: "/guides/azerbaijan-grand-prix-2027-tickets-travel",
        heading:
          "Azerbaijan Grand Prix 2027 tickets: early bird, best grandstands and planning your trip",
        disclosure:
          "Our only affiliate link here is to Airalo, an eSIM provider.",
        faq: "When does the Baku F1 early bird end?",
        omio: false
      }
    ] as const

    for (const width of [375, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      for (const item of cases) {
        const response = await page.goto(item.path)
        expect(response, `${item.path} should return a response`).toBeTruthy()
        expect(
          response!.ok(),
          `${item.path} should be HTTP success`
        ).toBeTruthy()

        await expect(
          page.getByRole("heading", { name: item.heading, exact: true })
        ).toBeVisible()
        const disclosure = page.getByText(item.disclosure)
        await expect(disclosure).toBeVisible()
        await expect(page.getByText(item.faq, { exact: true })).toBeVisible()
        await expect(page.getByRole("main")).toHaveCount(1)

        const disclosureBox = await disclosure.boundingBox()
        const firstSection = await page
          .getByRole("heading", { level: 2 })
          .first()
          .boundingBox()
        expect(disclosureBox?.y).toBeLessThan(900)
        expect(disclosureBox!.y).toBeLessThan(firstSection!.y)

        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
          "href",
          `https://www.pitlanetravel.com${item.path}`
        )
        const robots = await page
          .locator('meta[name="robots"]')
          .getAttribute("content")
        expect(robots).toContain("index")
        expect(robots).not.toContain("noindex")
        await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
          "content",
          `https://www.pitlanetravel.com${item.path}`
        )
        await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
          "content",
          "article"
        )

        const airalo = page.locator('a[href="https://airalo.pxf.io/PzEM6e"]')
        await expect(airalo).toHaveCount(1)
        await expect(airalo).toHaveAttribute(
          "rel",
          "sponsored nofollow noopener noreferrer"
        )
        const omio = page.locator('a[href="https://omio.sjv.io/jR09OP"]')
        await expect(omio).toHaveCount(item.omio ? 1 : 0)
        if (item.omio) {
          await expect(omio).toHaveAttribute(
            "rel",
            "sponsored nofollow noopener noreferrer"
          )
        }

        const html = await page.content()
        expect(html).not.toContain("VideoObject")
        expect(html).not.toContain("SEO desk")
        expect(html).not.toContain("Engineering Lead")
        expect(html).not.toContain("VIDEO SLOT")
        expect(html).not.toContain("/workspace/")
        const blocks = await page
          .locator('script[type="application/ld+json"]')
          .allTextContents()
        const parsed = blocks.map(
          block =>
            JSON.parse(block) as { "@type"?: string; mainEntity?: unknown[] }
        )
        expect(parsed.some(block => block["@type"] === "Article")).toBe(true)
        expect(parsed.some(block => block["@type"] === "BreadcrumbList")).toBe(
          true
        )
        const faq = parsed.find(block => block["@type"] === "FAQPage")
        expect(faq?.mainEntity).toHaveLength(5)
        expect(parsed.some(block => block["@type"] === "VideoObject")).toBe(
          false
        )

        const metrics = await page.evaluate(() => ({
          innerWidth: window.innerWidth,
          documentScrollWidth: document.documentElement.scrollWidth
        }))
        expect(
          metrics.documentScrollWidth,
          `${item.path} at ${width}px overflows`
        ).toBeLessThanOrEqual(metrics.innerWidth)
      }
    }
  })

  test("sitemap omits noindex /packages, lists /cancellation, and drops finished races", async ({
    request
  }) => {
    // The production build runs before this fixture inserts races. A sitemap
    // frozen at build time would miss the seeded upcoming slug.
    const response = await request.get("/sitemap.xml")
    expect(response.ok(), "sitemap should be HTTP success").toBeTruthy()
    const xml = await response.text()

    expect(xml).toContain("https://www.pitlanetravel.com/cancellation")
    expect(xml).not.toContain("https://www.pitlanetravel.com/packages")
    expect(xml).toContain(
      `https://www.pitlanetravel.com/races/${E2E_RACE_SLUG}`
    )
    expect(xml).not.toContain(
      `https://www.pitlanetravel.com/races/${E2E_RACE_COMPLETED_SLUG}`
    )
    expect(xml).not.toContain(
      `https://www.pitlanetravel.com/races/${E2E_RACE_CANCELLED_SLUG}`
    )
  })

  test("home, races, a race, and a guide publish canonical, og:image, and JSON-LD", async ({
    page
  }) => {
    const ogImage = "https://www.pitlanetravel.com/images/home-hero.jpg"

    async function expectShareMetadata(canonical: string) {
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        canonical
      )
      await expect(
        page.locator('meta[property="og:image"]').first()
      ).toHaveAttribute("content", ogImage)
    }

    async function jsonLdTypes(): Promise<string[]> {
      const blocks = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents()
      return blocks.map(block => {
        const parsed = JSON.parse(block) as { "@type"?: string }
        return parsed["@type"] ?? ""
      })
    }

    let response = await page.goto("/")
    expect(response?.ok()).toBeTruthy()
    await expectShareMetadata("https://www.pitlanetravel.com")
    expect(await jsonLdTypes()).toEqual(
      expect.arrayContaining(["Organization", "WebSite"])
    )

    response = await page.goto("/races")
    expect(response?.ok()).toBeTruthy()
    await expectShareMetadata("https://www.pitlanetravel.com/races")
    expect(await jsonLdTypes()).toContain("WebPage")

    response = await page.goto(`/races/${E2E_RACE_SLUG}?tab=info`)
    expect(response?.ok()).toBeTruthy()
    await expect(page).toHaveURL(/[?&]tab=info(?:&|$)/)
    await expectShareMetadata(
      `https://www.pitlanetravel.com/races/${E2E_RACE_SLUG}`
    )
    const raceBlocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents()
    const sportsEvent = raceBlocks
      .map(block => JSON.parse(block) as { "@type"?: string; url?: string })
      .find(block => block["@type"] === "SportsEvent")
    expect(sportsEvent?.url).toBe(
      `https://www.pitlanetravel.com/races/${E2E_RACE_SLUG}`
    )
    await expect(page.locator('a[href="/saved"]')).toHaveCount(0)
    await expect(page.locator('a[href="/recent"]')).toHaveCount(0)

    response = await page.goto("/guides/which-race-first-2027")
    expect(response?.ok()).toBeTruthy()
    await expectShareMetadata(
      "https://www.pitlanetravel.com/guides/which-race-first-2027"
    )
    expect(await jsonLdTypes()).toContain("Article")
  })

  test("imageless race cards render the designed fallback, not placeholder.jpg", async ({
    page
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    const home = await page.goto("/")
    expect(home?.ok()).toBeTruthy()
    await page
      .getByRole("button", { name: "Reject non-essential", exact: true })
      .click()

    await assertImagelessRaceCard(page)
    await assertPageOmitsPlaceholderPhoto(page, "home 1440")
    const photo = page.locator("[data-race-card]", {
      has: page.getByRole("heading", { name: E2E_RACE_NAME, exact: true })
    })
    const photoImg = photo.locator("img")
    await expect(photoImg).toBeVisible()
    const photoSrc = `${await photoImg.getAttribute("src")} ${await photoImg.getAttribute("srcset")}`
    expect(photoSrc).toContain("android-chrome-512x512")
    expect(photoSrc).not.toContain("placeholder.jpg")

    await page.setViewportSize({ width: 375, height: 812 })
    await expect(
      page.getByRole("heading", {
        name: E2E_RACE_IN_PROGRESS_NAME,
        exact: true
      })
    ).toBeVisible()
    const next = page.getByRole("button", {
      name: "Show next races",
      exact: true
    })
    await next.click()
    await expect(
      page.getByRole("heading", { name: E2E_RACE_NAME, exact: true })
    ).toBeVisible()
    await next.click()
    await assertImagelessRaceCard(page)
    await assertPageOmitsPlaceholderPhoto(page, "home 375")

    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: width === 375 ? 812 : 1000 })
      const races = await page.goto("/races")
      expect(races?.ok()).toBeTruthy()
      await assertImagelessRaceCard(page)
      await assertPageOmitsPlaceholderPhoto(page, `/races ${width}`)

      const series = await page.goto("/series/formula-e")
      expect(series?.ok()).toBeTruthy()
      await assertImagelessRaceCard(page)
      await assertPageOmitsPlaceholderPhoto(page, `/series/formula-e ${width}`)
    }
  })
})

async function assertImagelessRaceCard(page: Page): Promise<void> {
  const card = page.locator("[data-race-card]", {
    has: page.getByRole("heading", {
      name: E2E_IMAGELESS_RACE_NAME,
      exact: true
    })
  })
  await expect(card).toBeVisible()
  const fallback = card.locator("[data-race-image-fallback]")
  await expect(fallback).toBeVisible()
  await expect(fallback).toContainText(E2E_IMAGELESS_CIRCUIT_NAME)
  await expect(fallback).toContainText("FE")
  await expect(fallback.locator("[data-country-flag]")).toHaveText("🇵🇹")
  await expect(card.locator("img")).toHaveCount(0)
}

async function assertPageOmitsPlaceholderPhoto(
  page: Page,
  label: string
): Promise<void> {
  const html = await page.content()
  expect(html, label).not.toContain("placeholder.jpg")
}
