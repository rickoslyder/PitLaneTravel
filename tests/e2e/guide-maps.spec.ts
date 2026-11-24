import type { Page } from "@playwright/test"
import { expect, test } from "./fixtures"

const GUIDE = "/guides/abu-dhabi-grand-prix-travel-guide"
const STANDS = "/circuits/yas-marina-circuit/grandstands"

const SEATING_ALT =
  "North-up Yas Marina Circuit locator with Main, West, North, South and Marina grandstands and an approximate Abu Dhabi Hill point, numbered to a six-area key."

const STAY_ALT =
  "Coastal map placing central Abu Dhabi west of Yas Island and Dubai to the northeast, with Dubai Marina and Downtown Dubai examples and a local inset showing Al Danah, Yas Island and Yas Marina Circuit."

async function expectNoHorizontalOverflow(page: Page, label: string) {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth
  }))
  expect(
    metrics.documentScrollWidth,
    `${label} documentElement.scrollWidth ${metrics.documentScrollWidth} > innerWidth ${metrics.innerWidth}`
  ).toBeLessThanOrEqual(metrics.innerWidth)
  expect(
    metrics.bodyScrollWidth,
    `${label} body.scrollWidth ${metrics.bodyScrollWidth} > innerWidth ${metrics.innerWidth}`
  ).toBeLessThanOrEqual(metrics.innerWidth)
}

async function installShiftObserver(page: Page) {
  await page.addInitScript(() => {
    const record = window as Window & { __cls?: number }
    record.__cls = 0
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          hadRecentInput?: boolean
          value?: number
        }
        if (!shift.hadRecentInput) {
          record.__cls = (record.__cls ?? 0) + (shift.value ?? 0)
        }
      }
    }).observe({ type: "layout-shift", buffered: true })
  })
}

async function expectCredits(scope: ReturnType<Page["locator"]>) {
  await expect(
    scope.getByRole("link", { name: "© OpenStreetMap contributors" })
  ).toHaveAttribute("href", "https://www.openstreetmap.org/copyright")
  await expect(
    scope.getByRole("link", { name: "ODbL", exact: true })
  ).toHaveAttribute("href", "https://opendatacommons.org/licenses/odbl/1-0/")
  await expect(
    scope.getByRole("link", { name: "OpenStreetMap-derived source data" })
  ).toHaveAttribute("href", "/data/maps/yas-marina-osm-derived.json")
}

async function expectCurrentSrc(
  img: ReturnType<Page["locator"]>,
  part: string
) {
  await expect
    .poll(async () =>
      img.evaluate(element => {
        const image = element as HTMLImageElement
        return image.complete && image.naturalWidth > 0 ? image.currentSrc : ""
      })
    )
    .toContain(part)
}

async function expectShortDialogStillScrolls(page: Page, name: string) {
  await page.setViewportSize({ width: 700, height: 320 })
  const button = page.getByRole("button", { name, exact: true })
  await button.scrollIntoViewIfNeeded()
  await button.focus()
  await page.keyboard.press("Enter")
  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible()
  const scroller = dialog.locator("[data-locator-scroll]")
  const metrics = await scroller.evaluate(element => {
    const credit = element.querySelector(
      'a[href="https://www.openstreetmap.org/copyright"]'
    )
    element.scrollTop = element.scrollHeight
    const creditTop = credit?.getBoundingClientRect().top ?? -1
    const scrollerBottom = element.getBoundingClientRect().bottom
    return {
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      creditInside: Boolean(credit),
      creditTop,
      scrollerBottom
    }
  })
  expect(metrics.clientHeight).toBeGreaterThan(80)
  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight)
  expect(metrics.creditInside).toBe(true)
  expect(metrics.creditTop).toBeLessThanOrEqual(metrics.scrollerBottom + 1)
  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
}

async function expectKeyboardDialog(
  page: Page,
  name: string,
  desktopSvg: string
) {
  const button = page.getByRole("button", { name, exact: true })
  await button.scrollIntoViewIfNeeded()
  await button.focus()
  await page.keyboard.press("Enter")
  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible()
  const expanded = dialog.locator('img[data-locator-art="expanded"]')
  await expect(expanded).toHaveAttribute("src", desktopSvg)
  await expect(expanded).toHaveAttribute("alt", /.+/)
  const scroller = dialog.locator("[data-locator-scroll]")
  await expect(scroller).toBeVisible()
  await expectCredits(scroller)
  const scrollMetrics = await scroller.evaluate(element => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight
  }))
  expect(scrollMetrics.clientHeight).toBeGreaterThan(80)
  expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight)

  const focusInside = await page.evaluate(() => {
    const node = document.querySelector('[role="dialog"]')
    return Boolean(node?.contains(document.activeElement))
  })
  expect(focusInside).toBe(true)

  await page.keyboard.press("Tab")
  const stillInside = await page.evaluate(() => {
    const node = document.querySelector('[role="dialog"]')
    return Boolean(node?.contains(document.activeElement))
  })
  expect(stillInside).toBe(true)

  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
  await expect(button).toBeFocused()
}

test.describe("prepared geographic locators", () => {
  test("stay-zone map sits under Where to stay and stays in the column", async ({
    page,
    request
  }) => {
    await installShiftObserver(page)
    await page.setViewportSize({ width: 375, height: 812 })
    const response = await page.goto(GUIDE)
    expect(response?.ok()).toBeTruthy()

    const figure = page.locator('[data-locator="abu-dhabi-stay-zones"]')
    const before = await figure.boundingBox()
    expect(before).toBeTruthy()

    const order = await page.evaluate(() => {
      const heading = document.getElementById(
        "where-to-stay-yas-island-vs-downtown-abu-dhabi-vs-dubai"
      )
      const map = document.querySelector(
        '[data-locator="abu-dhabi-stay-zones"]'
      )
      const table = [...document.querySelectorAll("article table")].find(
        candidate =>
          candidate.textContent?.includes("Downtown Abu Dhabi") &&
          heading != null &&
          (heading.compareDocumentPosition(candidate) &
            Node.DOCUMENT_POSITION_FOLLOWING) !==
            0
      )
      if (!heading || !map || !table) return "missing"
      const mapFollowsHeading =
        (heading.compareDocumentPosition(map) &
          Node.DOCUMENT_POSITION_FOLLOWING) !==
        0
      const tableFollowsMap =
        (map.compareDocumentPosition(table) &
          Node.DOCUMENT_POSITION_FOLLOWING) !==
        0
      return mapFollowsHeading && tableFollowsMap ? "ok" : "bad"
    })
    expect(order).toBe("ok")

    const img = figure.locator('img[data-locator-art="inline"]')
    await expect(img).toHaveAttribute("alt", STAY_ALT)
    await expect(img).toHaveAttribute("loading", "lazy")
    await expect(img).not.toHaveAttribute("fetchpriority", "high")
    await expect(
      figure.getByText("Geographic locator, not navigation.")
    ).toBeVisible()
    await expect(
      figure.getByRole("listitem").filter({ hasText: "Al Danah" })
    ).toBeVisible()
    await expectCredits(figure)
    await expect(
      figure.getByRole("link", { name: "Made with Natural Earth" })
    ).toHaveAttribute(
      "href",
      "https://www.naturalearthdata.com/about/terms-of-use/"
    )

    await figure.scrollIntoViewIfNeeded()
    await expectCurrentSrc(img, "abu-dhabi-stay-zones-375.svg")
    const width = await img.evaluate(
      element => element.getBoundingClientRect().width
    )
    expect(Math.abs(width - 343)).toBeLessThan(2)
    const after = await figure.boundingBox()
    expect(Math.abs((before?.height ?? 0) - (after?.height ?? 0))).toBeLessThan(
      1
    )

    const cls = await page.evaluate(
      () => (window as Window & { __cls?: number }).__cls ?? 0
    )
    expect(cls).toBeLessThan(0.01)

    const html = await page.content()
    expect(html).not.toContain("M02")
    expect(html).not.toContain("M03")
    await expectNoHorizontalOverflow(page, "stay-zone guide at 375")

    const source = await request.get("/data/maps/yas-marina-osm-derived.json")
    expect(source.ok()).toBeTruthy()
    const derived = (await source.json()) as { license?: string }
    expect(derived.license).toContain("ODbL")

    await expectKeyboardDialog(
      page,
      "Expand stay-zone map",
      "/images/maps/abu-dhabi-stay-zones-desktop.svg"
    )

    await page.setViewportSize({ width: 1280, height: 900 })
    await figure.scrollIntoViewIfNeeded()
    await expectCurrentSrc(img, "abu-dhabi-stay-zones-desktop.svg")
    await expectNoHorizontalOverflow(page, "stay-zone guide at desktop")
    await expectShortDialogStillScrolls(page, "Expand stay-zone map")
  })

  test("seating map sits above the grandstand comparisons", async ({
    page
  }) => {
    await installShiftObserver(page)
    await page.setViewportSize({ width: 375, height: 812 })
    const response = await page.goto(STANDS)
    expect(response?.ok()).toBeTruthy()

    const figure = page.locator('[data-locator="yas-marina-seating"]')
    const before = await figure.boundingBox()
    expect(before).toBeTruthy()
    expect(before!.y).toBeLessThan(812)

    const aboveCards = await page.evaluate(() => {
      const map = document.querySelector('[data-locator="yas-marina-seating"]')
      const card = [...document.querySelectorAll("h3")].find(
        heading => heading.textContent?.trim() === "Main"
      )
      if (!map || !card) return false
      return (
        (map.compareDocumentPosition(card) &
          Node.DOCUMENT_POSITION_FOLLOWING) !==
        0
      )
    })
    expect(aboveCards).toBe(true)
    await expect(
      page.locator("main").getByRole("heading", { level: 3 })
    ).toHaveCount(6)

    const img = figure.locator('img[data-locator-art="inline"]')
    await expect(img).toHaveAttribute("alt", SEATING_ALT)
    await expect(img).toHaveAttribute("loading", "eager")
    await expect(img).not.toHaveAttribute("fetchpriority", "high")
    await expect(
      figure.getByText("Hill marker is approximate, not an entrance.")
    ).toBeVisible()
    await expect(
      figure.getByRole("listitem").filter({ hasText: "Main" })
    ).toBeVisible()
    await expectCredits(figure)
    await expect(
      figure.getByRole("link", { name: "Made with Natural Earth" })
    ).toHaveCount(0)

    await expectCurrentSrc(img, "yas-marina-seating-375.svg")
    const width = await img.evaluate(
      element => element.getBoundingClientRect().width
    )
    expect(Math.abs(width - 343)).toBeLessThan(2)
    const after = await figure.boundingBox()
    expect(Math.abs((before?.height ?? 0) - (after?.height ?? 0))).toBeLessThan(
      1
    )

    const cls = await page.evaluate(
      () => (window as Window & { __cls?: number }).__cls ?? 0
    )
    expect(cls).toBeLessThan(0.01)

    const html = await page.content()
    expect(html).not.toContain("M02")
    expect(html).not.toContain("M03")
    await expectNoHorizontalOverflow(page, "seating map at 375")

    await expectKeyboardDialog(
      page,
      "Expand seating map",
      "/images/maps/yas-marina-seating-desktop.svg"
    )

    await page.setViewportSize({ width: 1280, height: 900 })
    await figure.scrollIntoViewIfNeeded()
    await expectCurrentSrc(img, "yas-marina-seating-desktop.svg")
    const desktopWidth = await img.evaluate(
      element => element.getBoundingClientRect().width
    )
    expect(desktopWidth).toBeGreaterThan(1000)
    expect(desktopWidth).toBeLessThanOrEqual(1220)
    await expectNoHorizontalOverflow(page, "seating map at desktop")
    await expectShortDialogStillScrolls(page, "Expand seating map")
  })

  test("seating pins follow the grandstand cards at phone and desktop widths", async ({
    page
  }) => {
    async function expectPinsInsideMap(label: string) {
      const figure = page.locator('[data-locator="yas-marina-seating"]')
      await figure.scrollIntoViewIfNeeded()
      const img = figure.locator('img[data-locator-art="inline"]')
      const pin = figure.getByRole("button", {
        name: "1, Main, Start / finish"
      })
      await expect(pin).toBeVisible()
      const boxes = await Promise.all([img.boundingBox(), pin.boundingBox()])
      const imageBox = boxes[0]
      const pinBox = boxes[1]
      expect(imageBox, label).toBeTruthy()
      expect(pinBox, label).toBeTruthy()
      expect(pinBox!.x).toBeGreaterThanOrEqual(imageBox!.x - 1)
      expect(pinBox!.y).toBeGreaterThanOrEqual(imageBox!.y - 1)
      expect(pinBox!.x + pinBox!.width).toBeLessThanOrEqual(
        imageBox!.x + imageBox!.width + 1
      )
      expect(pinBox!.y + pinBox!.height).toBeLessThanOrEqual(
        imageBox!.y + imageBox!.height + 1
      )
    }

    await page.setViewportSize({ width: 390, height: 844 })
    const response = await page.goto(STANDS)
    expect(response?.ok()).toBeTruthy()
    await expectPinsInsideMap("390")
    await expectNoHorizontalOverflow(page, "seating map at 390")

    const mainPin = page.getByRole("button", {
      name: "1, Main, Start / finish"
    })
    const westPin = page.getByRole("button", { name: "2, West, Turns 6–7" })
    const mainCard = page.locator("#grandstand-main")
    const westCard = page.locator("#grandstand-west")

    await expect
      .poll(async () => {
        await mainPin.focus()
        await page.keyboard.press("ArrowDown")
        return westPin.evaluate(node => node === document.activeElement)
      })
      .toBe(true)
    await expect(westPin).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(westCard).toBeFocused()
    await expect(westCard).toHaveAttribute("data-active", "true")
    await expect(westPin).toHaveAttribute("data-active", "true")

    await mainCard.hover()
    await expect(mainCard).toHaveAttribute("data-active", "true")
    await expect(mainPin).toHaveAttribute("data-active", "true")
    await expect(westPin).toHaveAttribute("data-active", "false")

    await page.setViewportSize({ width: 1440, height: 900 })
    await expectPinsInsideMap("1440")
    await expectNoHorizontalOverflow(page, "seating map at 1440")
    await mainPin.click()
    await expect(mainCard).toBeFocused()
    await expect(mainCard).toHaveAttribute("data-active", "true")
  })
})
