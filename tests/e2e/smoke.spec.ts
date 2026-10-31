import {
  test,
  expect,
  E2E_CIRCUIT_NAME,
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
})
