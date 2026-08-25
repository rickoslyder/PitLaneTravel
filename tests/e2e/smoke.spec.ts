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
})
