import type { ConsoleMessage, BrowserContext, Page, Request } from "@playwright/test"
import {
  classifyBrowserRequest,
  isAppOriginConsoleError,
  suppressionResponseFor
} from "./browser-network-isolation"
import { installAutomationMarkerNormalization } from "./analytics-consent-automation"
import { expect, test } from "./fixtures"

const CONSENT_KEY = "pitlane.analytics-consent"
const DENIED = '{"v":1,"status":"denied"}'
const GRANTED = '{"v":1,"status":"granted"}'
const DESKTOP = { width: 1440, height: 1000 }
const MOBILE = { width: 390, height: 844 }

type ObservedRequest = {
  method: string
  url: string
  resourceType: string
  body: string | null
}

type DataLayerEntry = unknown

function redactSecrets(text: string): string {
  return text
    .replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted-db-url]")
    .replace(/\b(?:sk|pk|whsec)_[A-Za-z0-9+/=._-]+/g, "[redacted-key]")
}

function safeRequestBody(request: Request): string | null {
  const raw = request.postData()
  if (!raw) {
    return null
  }
  return redactSecrets(raw)
    .replace(/phc_[A-Za-z0-9]+/g, "[redacted-token]")
    .replace(/GTM-[A-Z0-9]+/g, "[redacted-gtm]")
}

function observeRequests(page: Page): ObservedRequest[] {
  const requests: ObservedRequest[] = []
  page.on("request", (request: Request) => {
    requests.push({
      method: request.method(),
      url: request.url(),
      resourceType: request.resourceType(),
      body: safeRequestBody(request)
    })
  })
  return requests
}

function isAnalyticsVendorRequest(urlString: string): boolean {
  let url: URL
  try {
    url = new URL(urlString)
  } catch {
    return false
  }
  const host = url.hostname
  const path = url.pathname
  if (path === "/ingest" || path.startsWith("/ingest/")) {
    return true
  }
  if (
    /(^|\.)googletagmanager\.com$/i.test(host) ||
    /(^|\.)google-analytics\.com$/i.test(host) ||
    /(^|\.)googleadservices\.com$/i.test(host) ||
    /(^|\.)doubleclick\.net$/i.test(host) ||
    /(^|\.)clarity\.ms$/i.test(host) ||
    /(^|\.)posthog\.com$/i.test(host) ||
    /(^|\.)posthog\.invalid$/i.test(host) ||
    /(^|\.)vercel-insights\.com$/i.test(host) ||
    /(^|\.)va\.vercel-scripts\.com$/i.test(host)
  ) {
    return true
  }
  return (
    path.startsWith("/_vercel/speed-insights") ||
    path.startsWith("/_vercel/insights")
  )
}

function vendorRequests(requests: ObservedRequest[]): ObservedRequest[] {
  return requests.filter(request => isAnalyticsVendorRequest(request.url))
}

function hasPostHogInit(requests: ObservedRequest[]): boolean {
  return requests.some(request => {
    try {
      const url = new URL(request.url)
      const path = url.pathname
      return (
        request.method === "POST" &&
        (path === "/ingest" || path.startsWith("/ingest/"))
      )
    } catch {
      return false
    }
  })
}

function hasGtmInit(requests: ObservedRequest[]): boolean {
  return requests.some(
    request =>
      /googletagmanager\.com/i.test(request.url) && /gtm\.js/i.test(request.url)
  )
}

function hasSpeedInsightsInit(requests: ObservedRequest[]): boolean {
  return requests.some(
    request =>
      /\/_vercel\/speed-insights/i.test(request.url) ||
      /\/_vercel\/insights/i.test(request.url) ||
      /va\.vercel-scripts\.com/i.test(request.url) ||
      /vercel-insights\.com/i.test(request.url)
  )
}

function hasClarityRequest(requests: ObservedRequest[]): boolean {
  return requests.some(request => /clarity\.ms/i.test(request.url))
}

function isVendorPersistenceKey(key: string): boolean {
  if (key === CONSENT_KEY) {
    return false
  }
  return (
    /^(ph_|_clck|_clsk|_ga|_gid|_gcl)/i.test(key) ||
    /posthog/i.test(key) ||
    /clarity/i.test(key)
  )
}

async function attachIsolation(page: Page): Promise<{ assertClean: () => void }> {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  const deniedExternalRequests: string[] = []

  await page.route("**/*", async route => {
    const classification = classifyBrowserRequest(route.request().url())
    if (classification === "allow") {
      await route.continue()
      return
    }
    if (classification === "suppress") {
      await route.fulfill(
        suppressionResponseFor({
          method: route.request().method(),
          url: route.request().url()
        })
      )
      return
    }
    deniedExternalRequests.push(redactSecrets(route.request().url()))
    await route.abort("blockedbyclient")
  })

  page.on("console", (message: ConsoleMessage) => {
    if (message.type() !== "error") return
    const text = message.text()
    if (!isAppOriginConsoleError(text)) return
    consoleErrors.push(redactSecrets(text))
  })
  page.on("pageerror", error => {
    pageErrors.push(redactSecrets(error.message))
  })

  return {
    assertClean() {
      expect(deniedExternalRequests, deniedExternalRequests.join("\n")).toEqual(
        []
      )
      expect(consoleErrors, consoleErrors.join("\n")).toEqual([])
      expect(pageErrors, pageErrors.join("\n")).toEqual([])
    }
  }
}

async function gotoHome(page: Page): Promise<void> {
  const response = await page.goto("/")
  expect(response, "homepage should return a response").toBeTruthy()
  expect(response!.ok(), "homepage should be HTTP success").toBeTruthy()
}

async function readConsentRaw(page: Page): Promise<string | null> {
  return page.evaluate(key => window.localStorage.getItem(key), CONSENT_KEY)
}

async function readStorageKeys(page: Page): Promise<{
  local: string[]
  session: string[]
  cookies: string[]
}> {
  return page.evaluate(() => {
    const local: string[] = []
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index)
      if (key) local.push(key)
    }
    const session: string[] = []
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index)
      if (key) session.push(key)
    }
    const cookies = window.document.cookie
      ? window.document.cookie.split(";").map(part => part.split("=")[0]?.trim() ?? "")
      : []
    return { local, session, cookies: cookies.filter(Boolean) }
  })
}

async function readPublicGlobals(page: Page): Promise<{
  dataLayer: DataLayerEntry[]
  hasDataLayer: boolean
  hasClarity: boolean
  clarityGranted: boolean
  hasSpeedInsightsQueue: boolean
}> {
  return page.evaluate(() => {
    const w = window as Window & {
      dataLayer?: unknown[]
      clarity?: ((...args: unknown[]) => void) & { q?: unknown[] }
      si?: unknown
    }
    const dataLayer = Array.isArray(w.dataLayer)
      ? w.dataLayer.map(entry => {
          if (
            entry &&
            typeof entry === "object" &&
            !Array.isArray(entry) &&
            typeof (entry as { length?: unknown }).length === "number"
          ) {
            try {
              return Array.from(entry as ArrayLike<unknown>)
            } catch {
              return entry
            }
          }
          return entry
        })
      : []
    const queue = Array.isArray(w.clarity?.q) ? w.clarity.q : []
    const queuedGrant = queue.some(item => {
      const args = Array.isArray(item) ? item : Array.from((item as ArrayLike<unknown>) ?? [])
      const payload = args[1] as { analytics_Storage?: string } | undefined
      return args[0] === "consentv2" && payload?.analytics_Storage === "granted"
    })
    return {
      dataLayer,
      hasDataLayer: Array.isArray(w.dataLayer),
      hasClarity: typeof w.clarity === "function",
      clarityGranted: queuedGrant,
      hasSpeedInsightsQueue: typeof w.si === "function"
    }
  })
}

async function assertNoVendorSurface(
  page: Page,
  requests: ObservedRequest[],
  label: string
): Promise<void> {
  expect(vendorRequests(requests), `${label} vendor requests`).toEqual([])
  const storage = await readStorageKeys(page)
  expect(
    storage.local.filter(isVendorPersistenceKey),
    `${label} vendor localStorage`
  ).toEqual([])
  expect(
    storage.session.filter(isVendorPersistenceKey),
    `${label} vendor sessionStorage`
  ).toEqual([])
  expect(
    storage.cookies.filter(isVendorPersistenceKey),
    `${label} vendor cookies`
  ).toEqual([])
  const globals = await readPublicGlobals(page)
  expect(globals.hasDataLayer, `${label} dataLayer`).toBe(false)
  expect(globals.hasClarity, `${label} clarity`).toBe(false)
  expect(globals.hasSpeedInsightsQueue, `${label} speed insights queue`).toBe(
    false
  )
}

async function assertNoPrivateMaterial(
  page: Page,
  requests: ObservedRequest[]
): Promise<void> {
  const html = await page.content()
  expect(html).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
  expect(html).not.toMatch(/\bsk_live_[A-Za-z0-9]+/)
  expect(html).not.toMatch(/\bwhsec_[A-Za-z0-9]+/)
  expect(html).not.toMatch(/CLERK_SECRET_KEY|DATABASE_URL|SUPABASE_SERVICE_ROLE/)
  for (const request of requests) {
    expect(request.url).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
    if (request.body) {
      expect(request.body).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
      expect(request.body).not.toMatch(/\bsk_live_/)
    }
  }
}

async function assertNoHorizontalOverflow(
  page: Page,
  label: string
): Promise<void> {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    bodyOverflow: getComputedStyle(document.body).overflow,
    bodyOverflowX: getComputedStyle(document.body).overflowX
  }))
  expect(
    metrics.documentScrollWidth,
    `${label} documentElement.scrollWidth ${metrics.documentScrollWidth} > innerWidth ${metrics.innerWidth}`
  ).toBeLessThanOrEqual(metrics.innerWidth)
  expect(
    metrics.bodyScrollWidth,
    `${label} body.scrollWidth ${metrics.bodyScrollWidth} > innerWidth ${metrics.innerWidth}`
  ).toBeLessThanOrEqual(metrics.innerWidth)
  expect(metrics.bodyOverflow, `${label} body overflow lock`).not.toBe("hidden")
  expect(metrics.bodyOverflowX, `${label} body overflow-x lock`).not.toBe(
    "hidden"
  )
}

async function assertEqualActionProminence(page: Page): Promise<void> {
  const accept = page.getByRole("button", {
    name: "Accept analytics",
    exact: true
  })
  const reject = page.getByRole("button", {
    name: "Reject non-essential",
    exact: true
  })
  await expect(accept).toBeVisible()
  await expect(reject).toBeVisible()
  expect(await accept.getAttribute("class")).toBe(await reject.getAttribute("class"))
  const acceptBox = await accept.boundingBox()
  const rejectBox = await reject.boundingBox()
  expect(acceptBox, "Accept analytics geometry").toBeTruthy()
  expect(rejectBox, "Reject non-essential geometry").toBeTruthy()
  expect(Math.abs(acceptBox!.width - rejectBox!.width)).toBeLessThanOrEqual(2)
  expect(Math.abs(acceptBox!.height - rejectBox!.height)).toBeLessThanOrEqual(2)
  await accept.focus()
  await expect(accept).toBeFocused()
  await page.keyboard.press("Tab")
  await expect(reject).toBeFocused()
}

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

async function assertProgressierBadgeDoesNotCoverConsentActions(
  page: Page
): Promise<void> {
  const accept = page.getByRole("button", {
    name: "Accept analytics",
    exact: true
  })
  const reject = page.getByRole("button", {
    name: "Reject non-essential",
    exact: true
  })
  const acceptBox = await accept.boundingBox()
  const rejectBox = await reject.boundingBox()
  expect(acceptBox, "Accept analytics geometry").toBeTruthy()
  expect(rejectBox, "Reject non-essential geometry").toBeTruthy()

  const badgeBox = await page.evaluate(() => {
    const boxes: Array<{ x: number; y: number; width: number; height: number }> =
      []
    const visit = (root: Document | ShadowRoot) => {
      const nodes = Array.from(root.querySelectorAll("*"))
      for (const node of nodes) {
        if (node instanceof HTMLElement && node.shadowRoot) {
          visit(node.shadowRoot)
        }
        const text = (node.textContent ?? "").replace(/\s+/g, " ").trim()
        if (!/powered by progressier/i.test(text) || text.length > 80) {
          continue
        }
        const rect = node.getBoundingClientRect()
        if (rect.width >= 8 && rect.height >= 8) {
          boxes.push({
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          })
        }
      }
    }
    visit(document)
    if (boxes.length === 0) {
      return null
    }
    boxes.sort((left, right) => left.width * left.height - right.width * right.height)
    return boxes[0] ?? null
  })

  if (!badgeBox) {
    return
  }

  expect(
    boxesOverlap(badgeBox, acceptBox!),
    "Progressier badge intersects Accept analytics"
  ).toBe(false)
  expect(
    boxesOverlap(badgeBox, rejectBox!),
    "Progressier badge intersects Reject non-essential"
  ).toBe(false)
}

async function assertFirstVisitBanner(page: Page): Promise<void> {
  await expect(
    page.getByRole("heading", { name: "Usage analytics", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Accept analytics", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Reject non-essential", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Privacy settings", exact: true })
  ).toHaveCount(0)
}

async function openPrivacySettings(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Privacy settings", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Privacy settings", exact: true })
  ).toBeVisible()
}

function trackMainFrameLoads(page: Page): { count: () => number } {
  let count = 0
  page.on("load", () => {
    count += 1
  })
  return {
    count: () => count
  }
}

async function installOrderProbe(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const order: Array<{ kind: "consent" | "vendor" }> = []
    const key = "pitlane.analytics-consent"
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function setItem(name, value) {
      if (String(name) === key) {
        order.push({ kind: "consent" })
      }
      return original.apply(this, [name, value])
    }
    const mark = (url: unknown) => {
      const value = String(url ?? "")
      if (
        /\/ingest(\/|$|\?)/.test(value) ||
        /googletagmanager\.com/i.test(value) ||
        /clarity\.ms/i.test(value) ||
        /speed-insights/i.test(value) ||
        /vercel-insights/i.test(value) ||
        /va\.vercel-scripts\.com/i.test(value) ||
        /posthog\.(com|invalid)/i.test(value)
      ) {
        order.push({ kind: "vendor" })
      }
    }
    const origFetch = window.fetch
    if (typeof origFetch === "function") {
      window.fetch = function fetchProbe(input, init) {
        if (typeof input === "string") {
          mark(input)
        } else if (input instanceof URL) {
          mark(input.toString())
        } else if (input && typeof input === "object" && "url" in input) {
          mark(String((input as { url: unknown }).url))
        }
        return origFetch.apply(this, [input, init])
      }
    }
    const origOpen = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function openProbe(
      method: string,
      url: string | URL
    ) {
      mark(url)
      return origOpen.apply(this, arguments as unknown as Parameters<typeof origOpen>)
    }
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLScriptElement && node.src) {
            mark(node.src)
          }
        }
      }
    })
    observer.observe(document, { childList: true, subtree: true })
    ;(
      window as Window & {
        __pltAnalyticsOrder?: Array<{ kind: "consent" | "vendor" }>
      }
    ).__pltAnalyticsOrder = order
  })
}

async function readOrderProbe(
  page: Page
): Promise<Array<{ kind: "consent" | "vendor" }>> {
  return page.evaluate(() => {
    return (
      (
        window as Window & {
          __pltAnalyticsOrder?: Array<{ kind: "consent" | "vendor" }>
        }
      ).__pltAnalyticsOrder ?? []
    )
  })
}

function consentCommands(layer: DataLayerEntry[]): Array<{
  phase: string
  state: Record<string, string>
}> {
  const commands: Array<{ phase: string; state: Record<string, string> }> = []
  for (const entry of layer) {
    if (!Array.isArray(entry)) continue
    if (
      entry[0] === "consent" &&
      (entry[1] === "default" || entry[1] === "update") &&
      entry[2] &&
      typeof entry[2] === "object"
    ) {
      commands.push({
        phase: String(entry[1]),
        state: entry[2] as Record<string, string>
      })
    }
  }
  return commands
}

async function expectGrantedVendors(
  page: Page,
  requests: ObservedRequest[]
): Promise<void> {
  await expect
    .poll(async () => (await readConsentRaw(page)) === GRANTED)
    .toBe(true)
  await expect.poll(() => hasGtmInit(vendorRequests(requests))).toBe(true)
  await expect.poll(() => hasPostHogInit(vendorRequests(requests))).toBe(true)
  await expect.poll(() => hasSpeedInsightsInit(vendorRequests(requests))).toBe(true)
  const globals = await readPublicGlobals(page)
  expect(globals.hasClarity || hasClarityRequest(requests)).toBe(true)
  expect(globals.clarityGranted || hasClarityRequest(requests)).toBe(true)
  const commands = consentCommands(globals.dataLayer)
  const defaultDenied = commands.find(command => command.phase === "default")
  const update = commands.find(command => command.phase === "update")
  expect(defaultDenied, "Google consent default").toBeTruthy()
  expect(update, "Google consent update").toBeTruthy()
  expect(commands.findIndex(command => command.phase === "default")).toBeLessThan(
    commands.findIndex(command => command.phase === "update")
  )
  expect(defaultDenied!.state).toMatchObject({
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied"
  })
  expect(update!.state).toMatchObject({
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted"
  })
}

async function expectPostConsentPageview(page: Page): Promise<void> {
  await expect
    .poll(async () => {
      const globals = await readPublicGlobals(page)
      return globals.dataLayer.some(
        entry =>
          Boolean(entry) &&
          typeof entry === "object" &&
          !Array.isArray(entry) &&
          (entry as { event?: string }).event === "page_view"
      )
    })
    .toBe(true)
}

async function openSecondPage(
  context: BrowserContext
): Promise<{ page: Page; guard: { assertClean: () => void }; requests: ObservedRequest[] }> {
  const page = await context.newPage()
  await installAutomationMarkerNormalization(page)
  const guard = await attachIsolation(page)
  const requests = observeRequests(page)
  return { page, guard, requests }
}

test.describe("analytics consent", () => {
  test.beforeEach(async ({ page }) => {
    await installAutomationMarkerNormalization(page)
  })

  test("first anonymous visit shows banner and emits nothing on desktop and mobile", async ({
    page
  }, testInfo) => {
    const requests = observeRequests(page)
    await page.setViewportSize(DESKTOP)
    await gotoHome(page)

    await assertFirstVisitBanner(page)
    await assertEqualActionProminence(page)
    await assertProgressierBadgeDoesNotCoverConsentActions(page)
    expect(await readConsentRaw(page)).toBeNull()
    await assertNoVendorSurface(page, requests, "first visit desktop")
    await assertNoHorizontalOverflow(page, "desktop 1440x1000")
    await assertNoPrivateMaterial(page, requests)

    const desktopPath = testInfo.outputPath(
      "analytics-consent-first-visit-desktop.png"
    )
    await page.screenshot({
      path: desktopPath,
      fullPage: true,
      animations: "disabled"
    })
    await testInfo.attach("analytics-consent-first-visit-desktop.png", {
      path: desktopPath,
      contentType: "image/png"
    })

    await page.setViewportSize(MOBILE)
    await assertFirstVisitBanner(page)
    await assertEqualActionProminence(page)
    await assertProgressierBadgeDoesNotCoverConsentActions(page)
    expect(await readConsentRaw(page)).toBeNull()
    await assertNoVendorSurface(page, requests, "first visit mobile")
    await assertNoHorizontalOverflow(page, "mobile 390x844")

    const mobilePath = testInfo.outputPath(
      "analytics-consent-first-visit-mobile.png"
    )
    await page.screenshot({
      path: mobilePath,
      fullPage: true,
      animations: "disabled"
    })
    await testInfo.attach("analytics-consent-first-visit-mobile.png", {
      path: mobilePath,
      contentType: "image/png"
    })
  })

  test("reject persists denied and a return visit stays dark", async ({
    page,
    context
  }, testInfo) => {
    const requests = observeRequests(page)
    await page.setViewportSize(DESKTOP)
    await gotoHome(page)
    const beforeChoice = vendorRequests(requests).length
    expect(beforeChoice).toBe(0)

    await page.getByRole("button", { name: "Reject non-essential", exact: true }).click()
    await expect(
      page.getByRole("heading", { name: "Usage analytics", exact: true })
    ).toHaveCount(0)
    expect(await readConsentRaw(page)).toBe(DENIED)
    const storage = await readStorageKeys(page)
    expect(storage.local.filter(key => key !== CONSENT_KEY)).toEqual([])
    await expect(
      page.getByRole("button", { name: "Privacy settings", exact: true })
    ).toBeVisible()
    await openPrivacySettings(page)
    await expect(page.getByText("are off.")).toBeVisible()
    await assertNoVendorSurface(page, requests, "after reject")

    const deniedPath = testInfo.outputPath(
      "analytics-consent-denied-settings-desktop.png"
    )
    await page.screenshot({
      path: deniedPath,
      fullPage: true,
      animations: "disabled"
    })
    await testInfo.attach("analytics-consent-denied-settings-desktop.png", {
      path: deniedPath,
      contentType: "image/png"
    })

    const second = await openSecondPage(context)
    try {
      await second.page.setViewportSize(MOBILE)
      await gotoHome(second.page)
      expect(await readConsentRaw(second.page)).toBe(DENIED)
      await expect(
        second.page.getByRole("heading", {
          name: "Usage analytics",
          exact: true
        })
      ).toHaveCount(0)
      await expect(
        second.page.getByRole("button", { name: "Privacy settings", exact: true })
      ).toBeVisible()
      await assertNoVendorSurface(second.page, second.requests, "rejected return")
    } finally {
      second.guard.assertClean()
      await second.page.close()
    }
  })

  test("accept persists granted before vendors initialize and emits after consent", async ({
    page
  }, testInfo) => {
    const requests = observeRequests(page)
    await installOrderProbe(page)
    await page.setViewportSize(DESKTOP)
    await gotoHome(page)
    expect(vendorRequests(requests)).toEqual([])

    await page.getByRole("button", { name: "Accept analytics", exact: true }).click()
    await expectGrantedVendors(page, requests)
    await expectPostConsentPageview(page)

    const order = await readOrderProbe(page)
    const firstConsent = order.findIndex(item => item.kind === "consent")
    const firstVendor = order.findIndex(item => item.kind === "vendor")
    expect(firstConsent).toBeGreaterThanOrEqual(0)
    expect(firstVendor).toBeGreaterThan(firstConsent)

    await openPrivacySettings(page)
    await expect(page.getByText("are on.")).toBeVisible()
    await expect(
      page.getByRole("button", {
        name: "Withdraw analytics consent",
        exact: true
      })
    ).toBeVisible()
    await assertNoPrivateMaterial(page, requests)
    await assertNoHorizontalOverflow(page, "granted desktop")

    const grantedPath = testInfo.outputPath(
      "analytics-consent-granted-settings-desktop.png"
    )
    await page.screenshot({
      path: grantedPath,
      fullPage: true,
      animations: "disabled"
    })
    await testInfo.attach("analytics-consent-granted-settings-desktop.png", {
      path: grantedPath,
      contentType: "image/png"
    })
  })

  test("withdraw denies before reload and stays dark afterward", async ({
    page
  }) => {
    const requests = observeRequests(page)
    await gotoHome(page)
    await page.getByRole("button", { name: "Accept analytics", exact: true }).click()
    await expectGrantedVendors(page, requests)
    await openPrivacySettings(page)

    await page.evaluate(key => {
      window.addEventListener(
        "beforeunload",
        () => {
          try {
            window.sessionStorage.setItem(
              "plt-e2e-denied-before-unload",
              window.localStorage.getItem(key) === '{"v":1,"status":"denied"}'
                ? "yes"
                : "no"
            )
          } catch {
            // probe only
          }
        },
        { once: true }
      )
    }, CONSENT_KEY)

    const requestIndexBeforeWithdraw = requests.length
    const vendorCountBeforeWithdraw = vendorRequests(requests).length
    const loads = trackMainFrameLoads(page)
    const reload = page.waitForEvent("load")
    await page
      .getByRole("button", { name: "Withdraw analytics consent", exact: true })
      .click()
    await reload
    expect(loads.count()).toBe(1)
    expect(await readConsentRaw(page)).toBe(DENIED)
    const deniedBeforeUnload = await page.evaluate(() =>
      window.sessionStorage.getItem("plt-e2e-denied-before-unload")
    )
    expect(deniedBeforeUnload).toBe("yes")

    const afterWithdraw = requests.slice(requestIndexBeforeWithdraw)
    await expect(
      page.getByRole("heading", { name: "Usage analytics", exact: true })
    ).toHaveCount(0)
    await expect(
      page.getByRole("button", { name: "Privacy settings", exact: true })
    ).toBeVisible()
    await openPrivacySettings(page)
    await expect(page.getByText("are off.")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Accept analytics", exact: true })
    ).toBeVisible()
    expect(
      vendorRequests(afterWithdraw),
      "vendor traffic after withdraw start"
    ).toEqual([])
    expect(vendorRequests(requests).length).toBe(vendorCountBeforeWithdraw)
    await assertNoVendorSurface(page, afterWithdraw, "after withdraw reload")
    const storage = await readStorageKeys(page)
    expect(storage.local.filter(isVendorPersistenceKey)).toEqual([])
    expect(storage.session.filter(isVendorPersistenceKey)).toEqual([])
    expect(storage.cookies.filter(isVendorPersistenceKey)).toEqual([])
    const globals = await readPublicGlobals(page)
    expect(globals.hasDataLayer).toBe(false)
    expect(globals.dataLayer).toEqual([])
  })

  test("grant in one tab activates the other once then deny tears down once", async ({
    page,
    context
  }) => {
    const requestsA = observeRequests(page)
    await gotoHome(page)
    const second = await openSecondPage(context)
    try {
      await gotoHome(second.page)
      await assertFirstVisitBanner(page)
      await assertFirstVisitBanner(second.page)

      const bLoads = trackMainFrameLoads(second.page)
      await page.getByRole("button", { name: "Accept analytics", exact: true }).click()
      await expectGrantedVendors(page, requestsA)
      await expect(
        second.page.getByRole("button", { name: "Privacy settings", exact: true })
      ).toBeVisible()
      await expectGrantedVendors(second.page, second.requests)
      expect(bLoads.count()).toBe(0)
      const bGlobals = await readPublicGlobals(second.page)
      expect(
        consentCommands(bGlobals.dataLayer).filter(command => command.phase === "default")
      ).toHaveLength(1)

      const aLoads = trackMainFrameLoads(page)
      await openPrivacySettings(second.page)
      const aReload = page.waitForEvent("load")
      await second.page
        .getByRole("button", {
          name: "Withdraw analytics consent",
          exact: true
        })
        .click()
      await aReload
      expect(aLoads.count()).toBe(1)
      expect(await readConsentRaw(page)).toBe(DENIED)
      await expect(
        page.getByRole("heading", { name: "Usage analytics", exact: true })
      ).toHaveCount(0)
      await expect(
        page.getByRole("button", { name: "Privacy settings", exact: true })
      ).toBeVisible()
      expect(aLoads.count()).toBe(1)
    } finally {
      second.guard.assertClean()
      await second.page.close()
    }
  })

  test("removed consent storage unloads vendors without rewriting the missing key", async ({
    page,
    context
  }) => {
    const requestsA = observeRequests(page)
    await gotoHome(page)
    await page.getByRole("button", { name: "Accept analytics", exact: true }).click()
    await expectGrantedVendors(page, requestsA)
    const second = await openSecondPage(context)
    try {
      await gotoHome(second.page)
      const loads = trackMainFrameLoads(page)
      const reload = page.waitForEvent("load")
      const vendorCount = vendorRequests(requestsA).length
      await second.page.evaluate(key => {
        window.localStorage.removeItem(key)
      }, CONSENT_KEY)
      await reload
      expect(loads.count()).toBe(1)
      expect(await readConsentRaw(page)).toBeNull()
      await assertFirstVisitBanner(page)
      expect(vendorRequests(requestsA).slice(vendorCount)).toEqual([])
      expect(loads.count()).toBe(1)
    } finally {
      second.guard.assertClean()
      await second.page.close()
    }
  })

  test("malformed consent storage unloads vendors without rewriting the damaged value", async ({
    page,
    context
  }) => {
    const damaged = "{not-json"
    const requestsA = observeRequests(page)
    await gotoHome(page)
    await page.getByRole("button", { name: "Accept analytics", exact: true }).click()
    await expectGrantedVendors(page, requestsA)
    const second = await openSecondPage(context)
    try {
      await gotoHome(second.page)
      const loads = trackMainFrameLoads(page)
      const reload = page.waitForEvent("load")
      const vendorCount = vendorRequests(requestsA).length
      await second.page.evaluate(
        ({ key, value }) => {
          window.localStorage.setItem(key, value)
        },
        { key: CONSENT_KEY, value: damaged }
      )
      await reload
      expect(loads.count()).toBe(1)
      expect(await readConsentRaw(page)).toBe(damaged)
      await assertFirstVisitBanner(page)
      expect(vendorRequests(requestsA).slice(vendorCount)).toEqual([])
      expect(loads.count()).toBe(1)
    } finally {
      second.guard.assertClean()
      await second.page.close()
    }
  })

  test("unknown-version consent storage unloads vendors without rewriting the damaged value", async ({
    page,
    context
  }) => {
    const damaged = '{"v":99,"status":"granted"}'
    const requestsA = observeRequests(page)
    await gotoHome(page)
    await page.getByRole("button", { name: "Accept analytics", exact: true }).click()
    await expectGrantedVendors(page, requestsA)
    const second = await openSecondPage(context)
    try {
      await gotoHome(second.page)
      const loads = trackMainFrameLoads(page)
      const reload = page.waitForEvent("load")
      const vendorCount = vendorRequests(requestsA).length
      await second.page.evaluate(
        ({ key, value }) => {
          window.localStorage.setItem(key, value)
        },
        { key: CONSENT_KEY, value: damaged }
      )
      await reload
      expect(loads.count()).toBe(1)
      expect(await readConsentRaw(page)).toBe(damaged)
      await assertFirstVisitBanner(page)
      expect(vendorRequests(requestsA).slice(vendorCount)).toEqual([])
      expect(loads.count()).toBe(1)
    } finally {
      second.guard.assertClean()
      await second.page.close()
    }
  })
})
