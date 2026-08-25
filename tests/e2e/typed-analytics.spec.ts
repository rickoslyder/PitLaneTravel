import { writeFileSync } from "node:fs"
import { gunzipSync } from "node:zlib"
import type { ConsoleMessage, Page, Request } from "@playwright/test"
import { installAutomationMarkerNormalization } from "./analytics-consent-automation"
import {
  classifyBrowserRequest,
  isAppOriginConsoleError,
  suppressionResponseFor
} from "./browser-network-isolation"
import { expect, test } from "./fixtures"
import {
  type DecodedVendorEvent,
  appDefinedCustomPropertyReview,
  vendorEventsFromPayload
} from "./typed-analytics-receipt"

const FORBIDDEN_PII =
  /\b(email|email_address|notes|passenger|passengers|passenger_type|phone|phone_number|dob|born_on|gender|external_id|user_id|item_name|first_name|last_name|given_name|family_name|clerk_id|token|secret)\b/i

type ObservedRequest = {
  method: string
  url: string
  resourceType: string
  body: string | null
  bodyBuffer: Buffer | null
}

function redactSecrets(text: string): string {
  return text
    .replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted-db-url]")
    .replace(/\b(?:sk|pk|whsec)_[A-Za-z0-9+/=._-]+/g, "[redacted-key]")
    .replace(/phc_[A-Za-z0-9]+/g, "[redacted-token]")
    .replace(/GTM-[A-Z0-9]+/g, "[redacted-gtm]")
}

function observeRequests(page: Page): ObservedRequest[] {
  const requests: ObservedRequest[] = []
  page.on("request", (request: Request) => {
    let bodyBuffer: Buffer | null = null
    try {
      const raw = request.postDataBuffer()
      bodyBuffer = raw ? Buffer.from(raw) : null
    } catch {
      bodyBuffer = null
    }
    requests.push({
      method: request.method(),
      url: request.url(),
      resourceType: request.resourceType(),
      body: request.postData(),
      bodyBuffer
    })
  })
  return requests
}

function isExactIngestPath(urlString: string): boolean {
  try {
    const path = new URL(urlString).pathname
    return path === "/ingest" || path.startsWith("/ingest/")
  } catch {
    return false
  }
}

function ingestPosts(requests: ObservedRequest[]): ObservedRequest[] {
  return requests.filter(
    request => request.method === "POST" && isExactIngestPath(request.url)
  )
}

function decodeMaybeGzip(buffer: Buffer | null, text: string | null): unknown {
  if (buffer && buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b) {
    return JSON.parse(gunzipSync(buffer).toString("utf8"))
  }
  if (!text) {
    if (buffer && buffer.length > 0) {
      const asText = buffer.toString("utf8")
      if (asText.startsWith("{") || asText.startsWith("[")) {
        return JSON.parse(asText)
      }
      if (asText.startsWith("data=")) {
        return decodeFormBody(asText)
      }
    }
    return null
  }
  if (text.startsWith("data=")) {
    return decodeFormBody(text)
  }
  if (text.startsWith("{") || text.startsWith("[")) {
    return JSON.parse(text)
  }
  return null
}

function decodeFormBody(text: string): unknown {
  const encoded = text.slice("data=".length)
  const decoded = decodeURIComponent(encoded)
  try {
    return JSON.parse(decoded)
  } catch {
    try {
      return JSON.parse(Buffer.from(decoded, "base64").toString("utf8"))
    } catch {
      return null
    }
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function decodedIngestEvents(requests: ObservedRequest[]): DecodedVendorEvent[] {
  const events: DecodedVendorEvent[] = []
  for (const request of ingestPosts(requests)) {
    const payload = decodeMaybeGzip(request.bodyBuffer, request.body)
    events.push(...vendorEventsFromPayload(payload))
  }
  return events
}

async function attachIsolation(
  page: Page
): Promise<{ assertClean: () => void }> {
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

async function readDataLayer(page: Page): Promise<unknown[]> {
  return page.evaluate(() => {
    const w = window as Window & { dataLayer?: unknown[] }
    return Array.isArray(w.dataLayer) ? [...w.dataLayer] : []
  })
}

function dataLayerObjects(entries: unknown[]): Record<string, unknown>[] {
  return entries.flatMap(entry => {
    const record = asRecord(entry)
    return record ? [record] : []
  })
}

function assertNoForbiddenAnalyticsMaterial(value: unknown): void {
  const serialized = JSON.stringify(value)
  expect(serialized).not.toMatch(FORBIDDEN_PII)
  expect(serialized).not.toMatch(/@/)
  expect(serialized).not.toMatch(/phc_/)
  expect(serialized).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
}

test.describe("typed analytics", () => {
  test.beforeEach(async ({ page }) => {
    await installAutomationMarkerNormalization(page)
  })

  test("grants via the real banner then records a controlled production-browser PostHog receipt", async ({
    page
  }, testInfo) => {
    const guard = await attachIsolation(page)
    const requests = observeRequests(page)

    await gotoHome(page)
    await expect(
      page.getByRole("heading", { name: "Usage analytics", exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Accept analytics", exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Reject non-essential", exact: true })
    ).toBeVisible()

    expect(ingestPosts(requests), "no ingest POST before consent").toEqual([])
    expect(await readDataLayer(page)).toEqual([])

    const requestIndexBeforeGrant = requests.length
    await page.getByRole("button", { name: "Accept analytics", exact: true }).click()

    await expect
      .poll(async () =>
        dataLayerObjects(await readDataLayer(page)).some(
          entry => entry.event === "page_view"
        )
      )
      .toBe(true)

    await page
      .getByRole("link", { name: "View Race Calendar" })
      .first()
      .click()

    await expect
      .poll(
        () => {
          const events = decodedIngestEvents(
            requests.slice(requestIndexBeforeGrant)
          )
          return (
            events.some(event => event.event === "$pageview") &&
            events.some(event => event.event === "hero calendar CTA clicked")
          )
        },
        { timeout: 20_000 }
      )
      .toBe(true)
    await expect
      .poll(async () =>
        dataLayerObjects(await readDataLayer(page)).some(
          entry => entry.event === "hero_calendar_cta_clicked"
        )
      )
      .toBe(true)

    const afterGrant = requests.slice(requestIndexBeforeGrant)
    const ingest = ingestPosts(afterGrant)
    expect(ingest.length).toBeGreaterThan(0)
    expect(ingest.every(request => request.method === "POST")).toBe(true)

    const vendorEvents = decodedIngestEvents(afterGrant)
    const pageview = vendorEvents.find(event => event.event === "$pageview")
    const hero = vendorEvents.find(
      event => event.event === "hero calendar CTA clicked"
    )
    expect(pageview, "decoded $pageview").toBeTruthy()
    expect(hero, "decoded hero calendar CTA clicked").toBeTruthy()
    const pageviewReview = appDefinedCustomPropertyReview(pageview!)
    const heroReview = appDefinedCustomPropertyReview(hero!)
    expect(pageviewReview.unapprovedCustomKeys).toEqual([])
    expect(heroReview.unapprovedCustomKeys).toEqual([])
    expect(pageviewReview.approvedCustomProperties).toEqual({
      schema_version: 1,
      route: "/"
    })
    expect(heroReview.approvedCustomProperties).toEqual({
      schema_version: 1
    })

    const layer = dataLayerObjects(await readDataLayer(page))
    const gtmPage = layer.find(entry => entry.event === "page_view")
    const gtmHero = layer.find(
      entry => entry.event === "hero_calendar_cta_clicked"
    )
    expect(gtmPage).toMatchObject({ event: "page_view", schema_version: 1 })
    expect(gtmHero).toMatchObject({
      event: "hero_calendar_cta_clicked",
      schema_version: 1
    })

    assertNoForbiddenAnalyticsMaterial(pageviewReview.privacyScanMaterial)
    assertNoForbiddenAnalyticsMaterial(heroReview.privacyScanMaterial)
    assertNoForbiddenAnalyticsMaterial([gtmPage, gtmHero])

    const sample = ingest.find(request => {
      const events = decodedIngestEvents([request])
      return events.some(
        event =>
          event.event === "$pageview" ||
          event.event === "hero calendar CTA clicked"
      )
    })
    expect(sample, "browser-generated ingest POST").toBeTruthy()
    const sampleUrl = new URL(sample!.url)
    const receipt = {
      kind: "controlled production-browser PostHog receipt",
      method: sample!.method,
      url_path: sampleUrl.pathname,
      vendor_event:
        decodedIngestEvents([sample!]).find(
          event =>
            event.event === "$pageview" ||
            event.event === "hero calendar CTA clicked"
        )?.event ?? null,
      schema_version: 1,
      assertions: {
        no_vendor_before_consent: ingestPosts(requests.slice(0, requestIndexBeforeGrant))
          .length === 0,
        browser_generated_post: true,
        typed_pageview: Boolean(pageview),
        typed_hero_cta: Boolean(hero),
        gtm_page_view: Boolean(gtmPage),
        gtm_hero_calendar: Boolean(gtmHero),
        schema_version_is_1: true,
        no_forbidden_pii: true
      }
    }

    const receiptPath = testInfo.outputPath("typed-analytics-posthog-receipt.json")
    writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`)
    await testInfo.attach("typed-analytics-posthog-receipt.json", {
      path: receiptPath,
      contentType: "application/json"
    })

    guard.assertClean()
  })
})
