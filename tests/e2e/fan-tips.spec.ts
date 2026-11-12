import {
  test,
  expect,
  E2E_FAN_TIPS_ABU_DHABI_NAME,
  E2E_FAN_TIPS_ABU_DHABI_SLUG,
  E2E_FAN_TIPS_LAS_VEGAS_NAME,
  E2E_FAN_TIPS_LAS_VEGAS_SLUG,
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
  test("renders on Qatar, Abu Dhabi, and Las Vegas and stays off another race", async ({
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
    await expect(qatarBox).toContainText(
      "The 2026 Qatar Grand Prix is on the official F1 calendar as of 11 November 2026, as Round 22, with the race on Sunday 29 November. Check formula1.com before booking non-refundable travel."
    )
    await expect(
      qatarBox.getByText(
        "If you can, book refundable or flexible fares, and a hotel you can cancel for free. In 2025 one fan's five-star Doha hotel booking was cancelled a week before the race, and the same fan passed on reports of another hotel doing the same. (2025; fan report, r/GrandPrixTravel, Nov 2025)"
      )
    ).toBeVisible()
    await expect(qatarBox).not.toContainText("F1 has said it is monitoring")
    const qatarCalendar = qatarBox.getByRole("link", { name: "formula1.com" })
    await expect(qatarCalendar).toHaveAttribute(
      "href",
      "https://www.formula1.com/en/racing/2026"
    )
    await expect(qatarCalendar).toHaveAttribute("target", "_blank")
    await expect(qatarCalendar).toHaveAttribute("rel", "noopener noreferrer")
    await expect(
      qatarBox.getByText(
        "Based on 16 fan reports from r/GrandPrixTravel, Nov 2024–Nov 2025. Fan reports last checked 31 Oct 2026. Calendar status re-checked 11 Nov 2026."
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
    await expect(abuDhabiBox).toContainText(
      "The 2026 Abu Dhabi Grand Prix is on the official F1 calendar as of 11 November 2026, as Round 23, with the race on Sunday 6 December. Check formula1.com before booking non-refundable travel."
    )
    await expect(
      abuDhabiBox.getByText(
        "If you can, book refundable or flexible fares, and a hotel you can cancel for free.",
        { exact: true }
      )
    ).toBeVisible()
    await expect(abuDhabiBox).not.toContainText("F1 has said it is monitoring")
    const abuDhabiCalendar = abuDhabiBox.getByRole("link", {
      name: "formula1.com"
    })
    await expect(abuDhabiCalendar).toHaveAttribute(
      "href",
      "https://www.formula1.com/en/racing/2026"
    )
    await expect(abuDhabiCalendar).toHaveAttribute("target", "_blank")
    await expect(abuDhabiCalendar).toHaveAttribute("rel", "noopener noreferrer")
    await expect(
      abuDhabiBox.getByText(
        "Based on reports from 13 fans on r/GrandPrixTravel, Dec 2024–Feb 2026. Fan reports last checked 31 Oct 2026. Calendar status re-checked 11 Nov 2026."
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

    const lasVegas = await page.goto(`/races/${E2E_FAN_TIPS_LAS_VEGAS_SLUG}`)
    expect(lasVegas?.ok()).toBeTruthy()
    await expect(
      page.getByRole("heading", {
        name: E2E_FAN_TIPS_LAS_VEGAS_NAME,
        exact: true
      })
    ).toBeVisible()
    const lasVegasBox = page.getByRole("region", {
      name: "What fans wish they'd known: Las Vegas Grand Prix"
    })
    await expect(lasVegasBox).toBeVisible()
    await expect(lasVegasBox).toContainText(
      "On the official F1 calendar as of 11 November 2026. Race: Saturday 21 November, 8 PM local. The promoter's ticket terms say all sales are final. [L2]"
    )
    await expect(
      lasVegasBox.getByRole("heading", { level: 3, name: "Getting out" })
    ).toBeVisible()
    await expect(lasVegasBox).not.toContainText("F1 has said it is monitoring")
    const lasVegasSource = lasVegasBox.getByRole("link", {
      name: "2024 race thread"
    })
    await expect(lasVegasSource).toHaveAttribute(
      "href",
      "https://redd.it/1gz5qv9"
    )
    await expect(lasVegasSource).toHaveAttribute("target", "_blank")
    await expect(lasVegasSource).toHaveAttribute("rel", "noopener noreferrer")
    const lasVegasGuide = lasVegasBox.getByRole("link", {
      name: "2026 Las Vegas GP A–Z Guide"
    })
    await expect(lasVegasGuide).toHaveAttribute(
      "href",
      "https://f1lasvegasgp.com/plan/f1-az-guide/"
    )
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
