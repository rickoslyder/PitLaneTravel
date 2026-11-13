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

const F1_2026_CALENDAR = "https://www.formula1.com/en/racing/2026"
const ABU_DHABI_CALENDAR =
  "The 2026 Abu Dhabi Grand Prix is on the official F1 calendar as of 11 November 2026, as Round 23, with the race on Sunday 6 December. Check formula1.com (https://www.formula1.com/en/racing/2026) before booking non-refundable travel. If you can, book refundable or flexible fares, and a hotel you can cancel for free."
const QATAR_CALENDAR =
  "The 2026 Qatar Grand Prix is on the official F1 calendar as of 11 November 2026, as Round 22, with the race on Sunday 29 November. Check formula1.com (https://www.formula1.com/en/racing/2026) before booking non-refundable travel. If you can, book refundable or flexible fares, and a hotel you can cancel for free."

test.describe("grandstand fans say", () => {
  test("renders Writer's lines on the five grandstand pages and leaves the gaps blank", async ({
    page
  }) => {
    const silverstone = await page.goto(
      "/circuits/silverstone-circuit/grandstands"
    )
    expect(silverstone?.ok()).toBeTruthy()
    await expect(
      page.getByRole("heading", {
        name: "Best grandstands at Silverstone Circuit",
        exact: true
      })
    ).toBeVisible()
    const landostand = page.locator(
      '[data-grandstand-name="Landostand (Stowe)"]'
    )
    await expect(landostand).toContainText(
      "One fan called it one of the best seats at the circuit for about £600, and said its price wasn't dynamic. The downside: it's on the opposite side from the coaches."
    )
    await expect(landostand).toContainText("F1 fans, 2026")
    const landoSource = landostand.getByRole("link", {
      name: "archived Reddit copy"
    })
    await expect(landoSource).toHaveAttribute(
      "href",
      "https://www.reddit.com/comments/1waka4w/_/p8iohh1/"
    )
    await expect(landoSource).toHaveAttribute("target", "_blank")
    await expect(landoSource).toHaveAttribute("rel", "noopener noreferrer")

    const montreal = await page.goto(
      "/circuits/circuit-gilles-villeneuve/grandstands"
    )
    expect(montreal?.ok()).toBeTruthy()
    const gs1 = page.locator(
      '[data-grandstand-name="Grandstand 1 (Start-finish straight)"]'
    )
    await expect(gs1).toContainText(
      "with a view over the grille and onto the track."
    )
    const montrealNote = page.locator("[data-fans-say-circuit]")
    await expect(montrealNote).toContainText(
      "General admission: another first-timer found a big grassy patch near GS34 with a clear view at the fence."
    )
    for (const name of [
      "Grandstand 34 (hairpin — panoramic)",
      "Platine (Senna S, T1–2)"
    ]) {
      const card = page.locator(`[data-grandstand-name="${name}"]`)
      await expect(card).toBeVisible()
      await expect(card.locator("[data-fans-say]")).toHaveCount(0)
    }

    const spa = await page.goto(
      "/circuits/circuit-de-spa-francorchamps/grandstands"
    )
    expect(spa?.ok()).toBeTruthy()
    const combes = page.locator('[data-grandstand-name="Combes (1-4)"]')
    await expect(combes).toBeVisible()
    await expect(combes.locator("[data-fans-say]")).toHaveCount(0)
    const silver3 = page.locator('[data-grandstand-name="Silver 3 (Pouhon)"]')
    await expect(silver3.locator("[data-fans-say]")).toBeVisible()
    await expect(silver3).toContainText("Silver 3, 5 and 6")
    await expect(page.locator("[data-fans-say-circuit]")).toContainText(
      "a stand for fans aged 17–27"
    )

    const yas = await page.goto("/circuits/yas-marina-circuit/grandstands")
    expect(yas?.ok()).toBeTruthy()
    const yasNote = page.locator("[data-fans-say-circuit]")
    await expect(yasNote).toContainText(ABU_DHABI_CALENDAR)
    await expect(yasNote).toContainText("(Pit Lane note, not a fan line)")
    const yasCalendar = yasNote.getByRole("link", { name: F1_2026_CALENDAR })
    await expect(yasCalendar).toHaveAttribute("href", F1_2026_CALENDAR)
    await expect(yasCalendar).toHaveAttribute("target", "_blank")
    await expect(yasCalendar).toHaveAttribute("rel", "noopener noreferrer")

    const lusail = await page.goto(
      "/circuits/lusail-international-circuit/grandstands"
    )
    expect(lusail?.ok()).toBeTruthy()
    const lusailNote = page.locator("[data-fans-say-circuit]")
    await expect(lusailNote).toContainText(QATAR_CALENDAR)
    const lusailCalendar = lusailNote.getByRole("link", {
      name: F1_2026_CALENDAR
    })
    await expect(lusailCalendar).toHaveAttribute("href", F1_2026_CALENDAR)

    for (const pathname of [
      "/circuits/silverstone-circuit/grandstands",
      "/circuits/circuit-gilles-villeneuve/grandstands",
      "/circuits/circuit-de-spa-francorchamps/grandstands",
      "/circuits/yas-marina-circuit/grandstands",
      "/circuits/lusail-international-circuit/grandstands"
    ]) {
      const response = await page.goto(pathname)
      expect(response?.ok()).toBeTruthy()
      const body = await page.locator("body").innerText()
      expect(body.toLowerCase()).not.toContain("1v1giqt")
      expect(body.toLowerCase()).not.toContain("silver 1")
      expect(body.toLowerCase()).not.toContain("gpticketshop")
      expect(body.toLowerCase()).not.toContain("abudhabi.gp")
      expect(body.toLowerCase()).not.toContain("abu_dhabi_gp_2025")
      expect(body.toLowerCase()).not.toContain("anpr")
      expect(body).not.toContain("F1 has confirmed")
      expect(body).not.toContain("F1 has said it is monitoring")
    }
  })
})
