import type { Page } from "@playwright/test"
import { racesPageDescription, racesPageTitle } from "@/app/races/metadata"
import {
  E2E_FAN_TIPS_ABU_DHABI_SLUG,
  E2E_RACE_SLUG,
  expect,
  test
} from "./fixtures"

const SHELL_PATHS = [
  "/",
  "/series/f1",
  "/guides",
  "/races",
  `/races/${E2E_RACE_SLUG}`
] as const

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

async function expectSequentialHeadings(page: Page, path: string) {
  const levels = await page
    .locator("h1, h2, h3, h4, h5, h6")
    .evaluateAll(nodes => nodes.map(node => Number(node.tagName.charAt(1))))
  expect(levels.length, path).toBeGreaterThan(0)
  for (let index = 1; index < levels.length; index += 1) {
    expect(
      levels[index] - levels[index - 1],
      `${path} heading ${levels[index - 1]} then ${levels[index]}`
    ).toBeLessThanOrEqual(1)
  }
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
    for (const path of SHELL_PATHS) {
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
    for (const path of SHELL_PATHS) {
      await expectOneMain(page, path)
    }
  })

  test("home carousel buttons are named and headings do not skip a level", async ({
    page
  }) => {
    const response = await page.goto("/")
    expect(response?.ok()).toBeTruthy()
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Every race, one calendar",
        exact: true
      })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Know your seat",
        exact: true
      })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Get out on time",
        exact: true
      })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Show previous races", exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Show next races", exact: true })
    ).toBeVisible()
    await expectSequentialHeadings(page, "/")
  })

  test("races page publishes the calendar title and a single h1", async ({
    page
  }) => {
    const response = await page.goto("/races")
    expect(response?.ok()).toBeTruthy()
    await expect(page).toHaveTitle(racesPageTitle)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      racesPageDescription
    )
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      racesPageTitle
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://www.pitlanetravel.com/races"
    )
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Motorsport Race Calendar",
        exact: true
      })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Race Calendar",
        exact: true
      })
    ).toBeVisible()
    await expectSequentialHeadings(page, "/races")
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

  test("in-view controls stay clear of the consent bar at 390 and 375", async ({
    page
  }) => {
    const viewports = [
      { width: 390, height: 844 },
      { width: 375, height: 667 }
    ] as const
    const paths = [
      "/races",
      "/series/f1",
      `/races/${E2E_FAN_TIPS_ABU_DHABI_SLUG}`
    ]

    for (const viewport of viewports) {
      await page.setViewportSize({ ...viewport })
      for (const path of paths) {
        const response = await page.goto(path)
        expect(response?.ok(), path).toBeTruthy()
        const bar = page.locator("[data-analytics-consent-bar]")
        await expect(bar).toBeVisible()

        const covered = await page.evaluate(() => {
          const barEl = document.querySelector("[data-analytics-consent-bar]")
          if (!(barEl instanceof HTMLElement)) return ["missing bar"]
          const barRect = barEl.getBoundingClientRect()
          const hits: string[] = []
          for (const el of document.querySelectorAll("button")) {
            if (barEl.contains(el)) continue
            const rect = el.getBoundingClientRect()
            if (rect.width < 8 || rect.height < 8) continue
            if (rect.top >= window.innerHeight || rect.bottom <= 0) continue
            if (rect.bottom <= barRect.top + 1) continue
            const label = (el.innerText || el.getAttribute("aria-label") || "")
              .trim()
              .replace(/\s+/g, " ")
              .slice(0, 60)
            hits.push(label || el.tagName)
          }
          return hits
        })
        expect(covered, `${path} ${viewport.width}x${viewport.height}`).toEqual(
          []
        )
      }
    }
  })
})

type AnswerSample = {
  height: number
  scrollHeight: number
  opacity: number
  inlineHeight: string
}

async function readAnswer(
  page: Page,
  answerId: string
): Promise<AnswerSample | null> {
  return page.evaluate(id => {
    const element = document.getElementById(id)
    if (!element) return null
    const style = getComputedStyle(element)
    return {
      height: element.getBoundingClientRect().height,
      scrollHeight: element.scrollHeight,
      opacity: Number(style.opacity),
      inlineHeight: element.style.height
    }
  }, answerId)
}

async function sampleAnswerHeights(
  page: Page,
  answerId: string,
  click: () => Promise<void>
): Promise<number[]> {
  const pending = page.evaluate(
    id =>
      new Promise<number[]>(resolve => {
        const samples: number[] = []
        let started = 0
        const giveUp = window.setTimeout(() => resolve(samples), 5000)
        const tick = () => {
          const element = document.getElementById(id)
          if (!element) {
            requestAnimationFrame(tick)
            return
          }
          if (started === 0) started = performance.now()
          samples.push(element.getBoundingClientRect().height)
          if (performance.now() - started < 400) {
            requestAnimationFrame(tick)
            return
          }
          window.clearTimeout(giveUp)
          resolve(samples)
        }
        requestAnimationFrame(tick)
      }),
    answerId
  )
  await click()
  return pending
}

test.describe("reduced motion", () => {
  test("scrolls instantly and expands FAQ answers without a height animation", async ({
    page
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    const response = await page.goto("/")
    expect(response?.ok()).toBeTruthy()

    const scrolling = await page.evaluate(() => ({
      body: getComputedStyle(document.body).scrollBehavior,
      root: getComputedStyle(document.documentElement).scrollBehavior
    }))
    expect(scrolling.body).toBe("auto")
    expect(scrolling.root).toBe("auto")

    await page.keyboard.press("Tab")
    await expect(
      page.getByRole("link", { name: "Skip to main content", exact: true })
    ).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page.locator("#main-content")).toBeFocused()

    const questions = page.locator("button[aria-controls^='faq-answer-']")
    await expect.poll(async () => questions.count()).toBeGreaterThan(1)

    const entrance = await page.evaluate(() => {
      const heading = document.getElementById("faq-title")
      const root = heading?.parentElement
      if (!root) return null
      const style = getComputedStyle(root)
      return { opacity: Number(style.opacity), transform: style.transform }
    })
    expect(entrance?.opacity).toBeGreaterThan(0.99)
    expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(entrance?.transform)

    const closed = questions.nth(1)
    await closed.evaluate(element =>
      element.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "instant"
      })
    )
    await expect(closed).toHaveAttribute("aria-expanded", "false")
    const controls = await closed.getAttribute("aria-controls")
    expect(controls).toBeTruthy()

    await expect
      .poll(async () =>
        closed
          .locator("svg")
          .evaluate(element => getComputedStyle(element).transitionDuration)
      )
      .toBe("0s")

    const answerId = controls!
    const samples = await sampleAnswerHeights(page, answerId, () =>
      closed.click()
    )
    const panel = page.locator(`#${answerId}`)
    await expect(panel).toBeVisible()
    const settled = await readAnswer(page, answerId)
    expect(settled).not.toBeNull()
    expect(settled!.opacity).toBeGreaterThan(0.99)
    expect(settled!.height).toBeGreaterThan(20)
    expect(Math.abs(settled!.height - settled!.scrollHeight)).toBeLessThan(2)

    const present = samples.filter(height => height > 0)
    expect(present, samples.join(",")).toHaveLength(samples.length)
    expect(present.length).toBeGreaterThan(2)
    const spread = Math.max(...present) - Math.min(...present)
    expect(spread).toBeLessThan(1)
    await expect(panel.locator("p")).not.toBeEmpty()
  })
})

test.describe("motion allowed", () => {
  test("smooth-scrolls and animates FAQ answer height", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" })
    const response = await page.goto("/")
    expect(response?.ok()).toBeTruthy()

    const scrolling = await page.evaluate(() => ({
      body: getComputedStyle(document.body).scrollBehavior,
      root: getComputedStyle(document.documentElement).scrollBehavior
    }))
    expect(scrolling.body).toBe("smooth")
    expect(scrolling.root).toBe("auto")

    const questions = page.locator("button[aria-controls^='faq-answer-']")
    await expect.poll(async () => questions.count()).toBeGreaterThan(1)
    const closed = questions.nth(1)
    await closed.evaluate(element =>
      element.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "instant"
      })
    )
    await expect(closed).toHaveAttribute("aria-expanded", "false")
    const controls = await closed.getAttribute("aria-controls")
    expect(controls).toBeTruthy()

    const chevronDuration = await closed
      .locator("svg")
      .evaluate(element => getComputedStyle(element).transitionDuration)
    expect(parseFloat(chevronDuration)).toBeGreaterThan(0)

    const samples = await sampleAnswerHeights(page, controls!, () =>
      closed.click()
    )
    const present = samples.filter(height => height > 0)
    expect(present.length, samples.join(",")).toBeGreaterThan(2)
    const spread = Math.max(...present) - Math.min(...present)
    expect(spread, samples.join(",")).toBeGreaterThan(8)

    const panel = page.locator(`#${controls}`)
    await expect(panel).toBeVisible()
    await expect
      .poll(async () => {
        const sample = await readAnswer(page, controls!)
        if (!sample) return false
        return (
          sample.opacity > 0.99 &&
          sample.height > 20 &&
          Math.abs(sample.height - sample.scrollHeight) < 2
        )
      })
      .toBe(true)
  })
})
