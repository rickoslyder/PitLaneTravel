import {
  test,
  expect,
  E2E_FAN_TIPS_ABU_DHABI_NAME,
  E2E_FAN_TIPS_ABU_DHABI_SLUG,
  E2E_FAN_TIPS_QATAR_NAME,
  E2E_FAN_TIPS_QATAR_SLUG,
  E2E_RACE_NAME,
  E2E_RACE_SLUG
} from "./fixtures"

async function boxFollowsHeroAndPrecedesTickets(
  page: import("@playwright/test").Page
) {
  const order = await page.evaluate(() => {
    const hero = document.querySelector("h1")
    const tips = document.querySelector("[data-fan-tips]")
    const tickets = document.getElementById("tab-content")
    const following = Node.DOCUMENT_POSITION_FOLLOWING
    return {
      tipsAfterHero: Boolean(
        hero && tips && hero.compareDocumentPosition(tips) & following
      ),
      ticketsAfterTips: Boolean(
        tips && tickets && tips.compareDocumentPosition(tickets) & following
      )
    }
  })
  expect(order.tipsAfterHero).toBe(true)
  expect(order.ticketsAfterTips).toBe(true)
}

test.describe("what fans wish they'd known", () => {
  test("renders on Qatar and Abu Dhabi and stays off another race", async ({
    page
  }) => {
    const qatar = await page.goto(`/races/${E2E_FAN_TIPS_QATAR_SLUG}`)
    expect(qatar?.ok()).toBeTruthy()
    await expect(
      page.getByRole("heading", { name: E2E_FAN_TIPS_QATAR_NAME, exact: true })
    ).toBeVisible()
    const qatarBox = page.getByRole("region", {
      name: "What fans wish they'd known: Qatar Grand Prix"
    })
    await expect(qatarBox).toBeVisible()
    await expect(
      qatarBox.getByRole("heading", { level: 3, name: "Getting out" })
    ).toBeVisible()
    await expect(
      qatarBox.getByText(
        "Based on 16 fan reports from r/GrandPrixTravel, Nov 2024–Nov 2025. Last checked 31 Oct 2026."
      )
    ).toBeVisible()
    const qatarSource = qatarBox.getByRole("link", { name: "2024 race thread" })
    await expect(qatarSource).toHaveAttribute("href", "https://redd.it/1h4b6e8")
    await expect(qatarSource).toHaveAttribute("target", "_blank")
    await expect(qatarSource).toHaveAttribute("rel", "noopener noreferrer")
    await boxFollowsHeroAndPrecedesTickets(page)

    const abuDhabi = await page.goto(`/races/${E2E_FAN_TIPS_ABU_DHABI_SLUG}`)
    expect(abuDhabi?.ok()).toBeTruthy()
    await expect(
      page.getByRole("heading", {
        name: E2E_FAN_TIPS_ABU_DHABI_NAME,
        exact: true
      })
    ).toBeVisible()
    const abuDhabiBox = page.getByRole("region", {
      name: "What fans wish they'd known: Abu Dhabi Grand Prix"
    })
    await expect(abuDhabiBox).toBeVisible()
    await expect(
      abuDhabiBox.getByRole("heading", {
        level: 3,
        name: "What you can bring"
      })
    ).toBeVisible()
    await expect(
      abuDhabiBox.getByText(
        "Based on reports from 13 fans on r/GrandPrixTravel, Dec 2024–Feb 2026. Last checked 31 Oct 2026."
      )
    ).toBeVisible()
    const abuDhabiSource = abuDhabiBox.getByRole("link", {
      name: "2026 ticket prices"
    })
    await expect(abuDhabiSource).toHaveAttribute(
      "href",
      "https://redd.it/1qwpnjc"
    )
    await expect(abuDhabiSource).toHaveAttribute("target", "_blank")
    await expect(abuDhabiSource).toHaveAttribute("rel", "noopener noreferrer")
    await boxFollowsHeroAndPrecedesTickets(page)

    const other = await page.goto(`/races/${E2E_RACE_SLUG}`)
    expect(other?.ok()).toBeTruthy()
    await expect(
      page.getByRole("heading", { name: E2E_RACE_NAME, exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole("region", { name: /What fans wish they'd known/ })
    ).toHaveCount(0)
  })
})
