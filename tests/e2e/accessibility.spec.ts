import type { Page } from "@playwright/test"
import { expect, test } from "./fixtures"

const NARROW = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 375, height: 667 }
] as const

async function expectOneMain(page: Page, path: string) {
  const response = await page.goto(path)
  expect(response?.ok(), path).toBeTruthy()
  await expect(page.locator("main")).toHaveCount(1)
  await expect(page.locator("main#main-content")).toHaveCount(1)
}

test.describe("accessibility", () => {
  test("theme toggle is a focusable button with a name", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.ok()).toBeTruthy()

    const toggle = page.getByRole("button", {
      name: /Switch to (dark|light) theme/
    })
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute("type", "button")
    await expect(toggle).toHaveAttribute("aria-pressed", /true|false/)
    await toggle.focus()
    await expect(toggle).toBeFocused()
  })

  test("mobile menu sets aria-expanded and makes outside content inert", async ({
    page
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    const response = await page.goto("/")
    expect(response?.ok()).toBeTruthy()

    const menu = page.getByRole("button", { name: "Menu", exact: true })
    await expect(page.locator('nav[aria-label="Main"]')).toHaveCount(1)
    await expect(menu).toBeVisible()
    await expect(menu).toHaveAttribute("aria-expanded", "false")
    await expect(menu).toHaveAttribute("aria-controls", "mobile-nav")

    await menu.click()
    await expect(menu).toHaveAttribute("aria-expanded", "true")

    const panel = page.locator("#mobile-nav")
    await expect(panel).toBeVisible()
    await expect(panel).toHaveAttribute("aria-label", "Primary")
    await expect(panel.locator("a, button").first()).toBeFocused()

    const outside = await page.evaluate(() => {
      const inert = (el: Element | null) => Boolean(el?.closest("[inert]"))
      const signUp = [...document.querySelectorAll("button")].find(
        button => button.textContent?.trim() === "Sign Up"
      )
      const theme = [...document.querySelectorAll("button")].find(button =>
        /Switch to (dark|light) theme/.test(
          button.getAttribute("aria-label") ?? ""
        )
      )
      const nav = document.getElementById("mobile-nav")
      return {
        panelInert: Boolean(nav?.closest("[inert]")),
        logoInert: inert(document.querySelector('header a[href="/"]')),
        mainInert: inert(document.getElementById("main-content")),
        consentInert: inert(
          document.querySelector("[data-analytics-consent-bar]")
        ),
        themeInert: inert(theme ?? null),
        signUpInert: signUp ? inert(signUp) : true
      }
    })
    expect(outside.panelInert).toBe(false)
    expect(outside.logoInert).toBe(true)
    expect(outside.mainInert).toBe(true)
    expect(outside.consentInert).toBe(true)
    expect(outside.themeInert).toBe(true)
    expect(outside.signUpInert).toBe(true)

    await page.keyboard.press("Escape")
    await expect(menu).toHaveAttribute("aria-expanded", "false")
    await expect(panel).toHaveCount(0)
    await expect(menu).toBeFocused()

    await menu.click()
    await expect(panel).toBeVisible()
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(panel).toHaveCount(0)
    await expect(page.locator("#main-content")).not.toHaveAttribute("inert", "")
    const mainInert = await page.evaluate(() =>
      Boolean(document.getElementById("main-content")?.closest("[inert]"))
    )
    expect(mainInert).toBe(false)
    await expect(
      page.getByRole("link", { name: "Races", exact: true })
    ).toBeVisible()
  })

  test("FAQ questions are buttons", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.ok()).toBeTruthy()

    const questions = page.locator("button[aria-controls^='faq-answer-']")
    await expect.poll(async () => questions.count()).toBeGreaterThan(0)
    const first = questions.first()
    await first.evaluate(element =>
      element.scrollIntoView({ block: "center", inline: "nearest" })
    )
    await expect(first).toHaveAttribute("type", "button")
    await expect(first).toHaveAttribute("aria-expanded", "true")
    const controls = await first.getAttribute("aria-controls")
    expect(controls).toBeTruthy()
    await expect(page.locator(`#${controls}`)).toBeVisible()
    await expect(
      page.locator("[aria-labelledby='faq-title'] [role='button']")
    ).toHaveCount(0)

    await first.click()
    await expect(first).toHaveAttribute("aria-expanded", "false")
  })

  test("skip link is the first focusable control and moves focus to main", async ({
    page
  }) => {
    for (const path of ["/", "/series/f1", "/guides", "/races"]) {
      const response = await page.goto(path)
      expect(response?.ok(), path).toBeTruthy()
      await page.keyboard.press("Tab")
      await expect(
        page.getByRole("link", { name: "Skip to main content", exact: true })
      ).toBeFocused()
      await page.keyboard.press("Enter")
      await expect(page.locator("#main-content")).toBeFocused()
    }
  })

  test("each public page has exactly one main", async ({ page }) => {
    for (const path of ["/", "/races", "/series/f1", "/guides"]) {
      await expectOneMain(page, path)
    }
  })

  test("first series card CTAs stay clear of the consent bar on narrow screens", async ({
    page
  }) => {
    for (const viewport of NARROW) {
      await page.setViewportSize({ ...viewport })
      const response = await page.goto("/series/f1")
      expect(response?.ok(), `${viewport.width}`).toBeTruthy()

      const bar = page.locator("[data-analytics-consent-bar]")
      const ctas = page.locator("[data-race-card]").first().locator("a, button")
      await expect(bar).toBeVisible()
      await expect(ctas.first()).toBeVisible()

      await expect
        .poll(async () => {
          const scrollY = await page.evaluate(() => window.scrollY)
          const barBox = await bar.boundingBox()
          const boxes = await ctas.evaluateAll(nodes =>
            nodes.map(node => {
              const rect = node.getBoundingClientRect()
              return { top: rect.top, bottom: rect.bottom, height: rect.height }
            })
          )
          if (scrollY !== 0 || !barBox || boxes.length === 0) return false
          return boxes.every(
            box => box.height > 0 && box.bottom <= barBox.y + 1
          )
        })
        .toBe(true)

      const hit = await page.evaluate(() => {
        const barEl = document.querySelector("[data-analytics-consent-bar]")
        const cta = document.querySelector(
          "[data-race-card] a, [data-race-card] button"
        )
        if (!(barEl instanceof HTMLElement) || !(cta instanceof HTMLElement)) {
          return "missing"
        }
        const rect = cta.getBoundingClientRect()
        const top = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        )
        if (barEl.contains(top)) return "covered"
        return top?.closest("a, button") === cta ? "cta" : "other"
      })
      expect(hit, `${viewport.width}x${viewport.height}`).toBe("cta")
    }
  })
})
