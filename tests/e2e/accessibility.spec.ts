import type { Page } from "@playwright/test"
import { racesPageDescription, racesPageTitle } from "@/app/races/metadata"
import {
  E2E_FAN_TIPS_ABU_DHABI_NAME,
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
    await expect(page.locator('head meta[name="description"]')).toHaveAttribute(
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
        if (path === "/races") {
          await expect
            .poll(async () =>
              page.evaluate(() =>
                [...document.querySelectorAll("link")].some(link => {
                  if (!(link instanceof HTMLLinkElement)) return false
                  const href = link.getAttribute("href") || ""
                  return (
                    href.includes("/_next/static/css/") &&
                    (link.media === "all" || link.media === "")
                  )
                })
              )
            )
            .toBe(true)
          await page.evaluate(() => document.fonts.ready)
        }

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

  test("races full stylesheet is applied and below-fold cards keep prod styling", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const response = await page.goto("/races")
    expect(response?.ok()).toBeTruthy()
    await expect
      .poll(async () =>
        page.evaluate(() =>
          [...document.querySelectorAll('link[rel="stylesheet"]')].some(
            link => {
              if (!(link instanceof HTMLLinkElement)) return false
              const href = link.getAttribute("href") || ""
              return (
                href.includes("/_next/static/css/") &&
                (link.media === "all" || link.media === "")
              )
            }
          )
        )
      )
      .toBe(true)

    const html = await page.content()
    expect(html).toContain("<noscript>")
    expect(html).toContain('media="print"')
    expect(html).toContain('data-races-critical=""')

    const below = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("[data-race-card]")]
      // Designed cards have no photo. The full sheet is what adds the
      // image transition, so measure a below-fold card that still has one.
      const card =
        cards.find(el => {
          if (el.getBoundingClientRect().top < window.innerHeight) return false
          return el.querySelector(".race-listing-img") instanceof HTMLElement
        }) ?? null
      if (!(card instanceof HTMLElement)) return null
      const img = card.querySelector(".race-listing-img")
      return {
        top: card.getBoundingClientRect().top,
        innerHeight: window.innerHeight,
        borderTopWidth: getComputedStyle(card).borderTopWidth,
        transition:
          img instanceof HTMLElement
            ? getComputedStyle(img).transitionProperty
            : ""
      }
    })
    expect(below, "a photo card starts below the fold").not.toBeNull()
    expect(below!.top).toBeGreaterThanOrEqual(below!.innerHeight)
    expect(below!.borderTopWidth).toBe("1px")
    expect(below!.transition).toContain("transform")
  })

  test("races hero stays 16px above the calendar on a tall phone with the consent bar open", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const response = await page.goto("/races")
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator("[data-analytics-consent-bar]")).toBeVisible()
    await expect(page.locator("[data-races-series-filters]")).toBeVisible()

    const spacing = await page.evaluate(() => {
      const hero = document.querySelector("[data-races-listing-hero]")
      const body = document.querySelector("[data-races-listing-body]")
      const filters = document.querySelector("[data-races-series-filters]")
      if (
        !(hero instanceof HTMLElement) ||
        !(body instanceof HTMLElement) ||
        !(filters instanceof HTMLElement)
      ) {
        return null
      }
      const card = body.firstElementChild
      const heroBox = hero.getBoundingClientRect()
      const bodyBox = body.getBoundingClientRect()
      const cardBox =
        card instanceof HTMLElement ? card.getBoundingClientRect() : null
      const filtersBox = filters.getBoundingClientRect()
      return {
        heroBottom: Math.round(heroBox.bottom),
        filtersTop: Math.round(filtersBox.top),
        heroToBody: Math.round(bodyBox.top - heroBox.bottom),
        bodyToCard: cardBox ? Math.round(cardBox.top - bodyBox.top) : null,
        heroMarginTop: getComputedStyle(hero).marginTop,
        bodyMarginTop: getComputedStyle(body).marginTop,
        cardMarginTop:
          card instanceof HTMLElement ? getComputedStyle(card).marginTop : null
      }
    })

    expect(spacing).not.toBeNull()
    expect(spacing?.heroMarginTop).toBe("16px")
    expect(spacing?.bodyMarginTop).toBe("16px")
    expect(spacing?.cardMarginTop).toBe("0px")
    expect(spacing?.heroToBody).toBe(16)
    expect(spacing?.bodyToCard).toBe(0)
    expect(spacing!.filtersTop - spacing!.heroBottom).toBeGreaterThan(16)
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
async function scrollToAndRest(page: Page, top: number) {
  await page.evaluate(y => {
    return new Promise<void>(resolve => {
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        resolve()
      }
      window.addEventListener("scrollend", finish, { once: true })
      window.scrollTo({ top: y, behavior: "instant" })
      window.setTimeout(finish, 400)
    })
  }, top)
}

async function progressSnapshot(page: Page) {
  return page.evaluate(async () => {
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
    const bar = document.querySelector("[data-scroll-progress-bar]")
    if (!(bar instanceof HTMLElement)) return null
    const transform = getComputedStyle(bar).transform
    const match = /matrix(?:3d)?\(([^)]+)\)/.exec(transform)
    const scale = match ? Number.parseFloat(match[1].split(",")[0]) : null
    return {
      mode: bar.dataset.scrollProgressMode ?? null,
      scale: scale !== null && Number.isFinite(scale) ? scale : null,
      max: document.documentElement.scrollHeight - window.innerHeight
    }
  })
}

test.describe("scroll handlers", () => {
  test("header blur toggles when the page leaves and returns to the top", async ({
    page
  }) => {
    const response = await page.goto("/")
    expect(response?.ok()).toBeTruthy()

    const header = page.locator("header.sticky.top-0")
    await expect(header).toHaveCount(1)
    await expect(header).not.toHaveClass(/backdrop-blur-sm/)

    const max = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight
    )
    expect(max).toBeGreaterThan(400)

    await expect
      .poll(async () => {
        await scrollToAndRest(page, 0)
        await scrollToAndRest(page, 40)
        return header.evaluate(element =>
          element.className.includes("backdrop-blur-sm")
        )
      })
      .toBe(true)
    await expect(header).toHaveClass(/shadow-sm/)

    await scrollToAndRest(page, 400)
    await expect(header).toHaveClass(/backdrop-blur-sm/)

    await scrollToAndRest(page, 0)
    await expect(header).not.toHaveClass(/backdrop-blur-sm/)
    await expect(header).not.toHaveClass(/shadow-sm/)
  })

  test("race progress, sticky shadow, and scroll announcements track the document", async ({
    page
  }) => {
    await page.setViewportSize({ width: 1280, height: 640 })
    const response = await page.goto(`/races/${E2E_RACE_SLUG}`)
    expect(response?.ok()).toBeTruthy()

    const bar = page.locator("[data-scroll-progress-bar]")
    const nav = page.getByRole("navigation", {
      name: "Race details navigation"
    })
    const toTop = page.getByRole("button", { name: "Scroll to top of page" })
    const announcer = page.locator("[data-scroll-announcer]")

    await expect(bar).toHaveCount(1)
    await expect(bar).toHaveAttribute(
      "data-scroll-progress-mode",
      /^(timeline|script)$/
    )
    await expect(announcer).toHaveAttribute("aria-live", "polite")
    await expect(announcer).toHaveText("")
    await expect(nav).not.toHaveClass(/shadow-md/)
    await expect(toTop).toHaveCount(0)

    const atTop = await progressSnapshot(page)
    expect(atTop?.max).toBeGreaterThan(700)
    expect(atTop?.scale).not.toBeNull()
    expect(atTop!.scale!).toBeLessThan(0.05)
    expect(["timeline", "script"]).toContain(atTop?.mode)

    await scrollToAndRest(page, 40)
    await expect(nav).toHaveClass(/shadow-md/)
    await expect(toTop).toHaveCount(0)

    await scrollToAndRest(page, 501)
    await expect(toTop).toBeVisible()

    await scrollToAndRest(page, Math.round((atTop?.max ?? 0) * 0.7))
    const mid = await progressSnapshot(page)
    expect(mid?.scale).not.toBeNull()
    expect(mid!.scale!).toBeGreaterThan(0.45)

    await scrollToAndRest(page, atTop?.max ?? 0)
    const end = await progressSnapshot(page)
    expect(end?.scale).not.toBeNull()
    expect(end!.scale!).toBeGreaterThan(0.95)
    await expect(announcer).toHaveText("Nearing the end of the page")

    const mutations = await page.evaluate(async () => {
      const node = document.querySelector("[data-scroll-announcer]")
      if (!node) return -1
      let count = 0
      const observer = new MutationObserver(() => {
        count += 1
      })
      observer.observe(node, {
        childList: true,
        characterData: true,
        subtree: true
      })
      const top =
        document.documentElement.scrollHeight - window.innerHeight - 20
      await new Promise<void>(resolve => {
        let settled = false
        const finish = () => {
          if (settled) return
          settled = true
          resolve()
        }
        window.addEventListener("scrollend", finish, { once: true })
        window.scrollTo({ top, behavior: "instant" })
        window.setTimeout(finish, 400)
      })
      observer.disconnect()
      return count
    })
    expect(mutations).toBe(0)
    await expect(announcer).toHaveText("Nearing the end of the page")

    await scrollToAndRest(page, 0)
    await expect(announcer).toHaveText("At the top of the page")
    await expect(nav).not.toHaveClass(/shadow-md/)
    await expect(toTop).toHaveCount(0)
    const back = await progressSnapshot(page)
    expect(back?.scale).not.toBeNull()
    expect(back!.scale!).toBeLessThan(0.05)
  })

  test("reduced motion still moves the progress bar from script", async ({
    page
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.setViewportSize({ width: 1280, height: 640 })
    const response = await page.goto(`/races/${E2E_RACE_SLUG}`)
    expect(response?.ok()).toBeTruthy()

    const bar = page.locator("[data-scroll-progress-bar]")
    await expect(bar).toHaveAttribute("data-scroll-progress-mode", "script")

    const atTop = await progressSnapshot(page)
    expect(atTop?.max).toBeGreaterThan(700)
    expect(atTop?.scale).not.toBeNull()
    expect(atTop!.scale!).toBeLessThan(0.05)

    await scrollToAndRest(page, atTop?.max ?? 0)
    const end = await progressSnapshot(page)
    expect(end?.mode).toBe("script")
    expect(end?.scale).not.toBeNull()
    expect(end!.scale!).toBeGreaterThan(0.95)
  })
})

const PHONE = { width: 360, height: 676 } as const

function boxesOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

test.describe("mobile chrome at 360x676", () => {
  test.use({ viewport: PHONE })

  test("consent copy is fully readable and links to the privacy policy", async ({
    page
  }) => {
    const response = await page.goto("/")
    expect(response?.ok()).toBeTruthy()

    const bar = page.locator("[data-analytics-consent-bar]")
    const copy = page.locator("[data-analytics-consent-copy]")
    await expect(bar).toBeVisible()
    await expect(copy).toBeVisible()
    await expect(
      bar.getByRole("link", { name: "Privacy policy", exact: true })
    ).toBeVisible()
    await expect(bar.getByText("PostHog")).toBeHidden()

    const fit = await copy.evaluate(node => ({
      scrollHeight: node.scrollHeight,
      clientHeight: node.clientHeight
    }))
    expect(fit.scrollHeight).toBeLessThanOrEqual(fit.clientHeight)
    const closedBar = await bar.boundingBox()
    expect(closedBar?.height ?? 999).toBeLessThanOrEqual(76)
    for (const name of [
      "Accept analytics",
      "Reject non-essential",
      "Details"
    ]) {
      const control = bar.getByText(name, { exact: true })
      const box = await control.boundingBox()
      expect(box?.height ?? 0, name).toBeGreaterThanOrEqual(24)
    }

    await bar.getByText("Details", { exact: true }).click()
    await expect(bar.getByText("PostHog")).toBeVisible()
    await expect(bar.getByText("Microsoft Clarity")).toBeVisible()
    await expect(bar.getByText("Vercel Speed Insights")).toBeVisible()
    await expect(
      bar.getByText("Essential features still work if you reject.")
    ).toBeVisible()

    const openFit = await copy.evaluate(node => ({
      scrollHeight: node.scrollHeight,
      clientHeight: node.clientHeight
    }))
    expect(openFit.scrollHeight).toBeLessThanOrEqual(openFit.clientHeight)
  })

  test("privacy settings stay clear of the races heading", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "pitlane.analytics-consent",
        '{"v":1,"status":"denied"}'
      )
    })
    const response = await page.goto("/races")
    expect(response?.ok()).toBeTruthy()

    const heading = page.getByRole("heading", {
      level: 1,
      name: "Motorsport Race Calendar",
      exact: true
    })
    const privacy = page.getByRole("button", {
      name: "Privacy settings",
      exact: true
    })
    await expect(heading).toBeVisible()
    await expect(privacy).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Toggle Sidebar" })
    ).toHaveCount(0)
    await expect(page.locator("[data-sidebar='sidebar']")).toHaveCount(0)

    const headingBox = await heading.boundingBox()
    const privacyBox = await privacy.boundingBox()
    expect(headingBox).toBeTruthy()
    expect(privacyBox).toBeTruthy()
    expect(boxesOverlap(headingBox!, privacyBox!)).toBe(false)
  })

  test("privacy settings stay available after a client navigation", async ({
    page
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "pitlane.analytics-consent",
        '{"v":1,"status":"denied"}'
      )
    })
    const home = await page.goto("/")
    expect(home?.ok()).toBeTruthy()
    const privacy = page.getByRole("button", {
      name: "Privacy settings",
      exact: true
    })
    await expect(privacy).toBeVisible()

    await page.getByRole("button", { name: "Menu", exact: true }).click()
    await page.getByRole("link", { name: "Races", exact: true }).click()
    await expect(page).toHaveURL(/\/races$/)
    await expect(privacy).toBeVisible()
    await expect(page.locator("[data-privacy-settings]")).toHaveCount(1)
  })

  test("races pages use the main header", async ({ page }) => {
    for (const path of ["/races", `/races/${E2E_FAN_TIPS_ABU_DHABI_SLUG}`]) {
      const response = await page.goto(path)
      expect(response?.ok(), path).toBeTruthy()
      await expect(
        page.getByRole("link", { name: "PitLane Travel", exact: true })
      ).toBeVisible()
      await expect(
        page.getByRole("button", { name: "Menu", exact: true })
      ).toBeVisible()
      await expect(
        page.getByRole("button", { name: "Toggle Sidebar" })
      ).toHaveCount(0)
      await expect(page.locator("main")).toHaveCount(1)

      const crumb = page.getByRole("navigation", { name: "breadcrumb" })
      await expect(
        crumb.getByRole("link", { name: "Home", exact: true })
      ).toBeVisible()
      await expect(crumb).not.toContainText("Race Calendar")

      const blocks = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents()
      const breadcrumb = blocks
        .map(
          block =>
            JSON.parse(block) as {
              "@type"?: string
              itemListElement?: Array<{ name?: string; item?: string }>
            }
        )
        .find(block => block["@type"] === "BreadcrumbList")
      const names = breadcrumb?.itemListElement?.map(entry => entry.name)
      const visible = (await crumb.innerText()).replace(/\s+/g, " ")

      if (path === "/races") {
        expect(names).toEqual(["Home", "Races"])
        await expect(crumb.getByText("Races", { exact: true })).toBeVisible()
        expect(visible).toContain("Home")
        expect(visible).toContain("Races")
      } else {
        expect(names).toEqual(["Home", "Races", E2E_FAN_TIPS_ABU_DHABI_NAME])
        await expect(
          crumb.getByRole("link", { name: "Races", exact: true })
        ).toBeVisible()
        await expect(
          crumb.getByText(E2E_FAN_TIPS_ABU_DHABI_NAME, { exact: true })
        ).toBeVisible()
        expect(visible).toContain(E2E_FAN_TIPS_ABU_DHABI_NAME)
      }
      for (const name of names ?? []) {
        expect(visible, path).toContain(name)
      }
    }
  })

  test("faq title differs from the not-found title", async ({
    page,
    request
  }) => {
    const faq = await page.goto("/faq")
    expect(faq?.ok()).toBeTruthy()
    await expect(page).toHaveTitle("F1 Travel FAQ | PitLane Travel")
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "F1 Travel FAQ | PitLane Travel"
    )

    const missing = await request.get("/this-page-is-not-real")
    expect(missing.status()).toBe(404)
    const html = await missing.text()
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ""
    expect(title).toBe("Page not found | PitLane Travel")
    expect(title).not.toBe(await page.title())
  })

  test("footer links are at least 24px tall", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.ok()).toBeTruthy()
    const heights = await page
      .locator("footer a")
      .evaluateAll(nodes =>
        nodes.map(node => Math.round(node.getBoundingClientRect().height))
      )
    expect(heights.length).toBeGreaterThan(0)
    for (const height of heights) {
      expect(height).toBeGreaterThanOrEqual(24)
    }

    const guide = await page.goto("/guides/abu-dhabi-grand-prix-travel-guide")
    expect(guide?.ok()).toBeTruthy()
    const source = page.getByRole("link", { name: "formula1.com" }).first()
    await expect(source).toBeVisible()
    const box = await source.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.height).toBeGreaterThanOrEqual(24)
  })
})
