import type { Page } from "@playwright/test"

export async function installAutomationMarkerNormalization(
  page: Page
): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      configurable: true,
      get() {
        return false
      }
    })

    const originalUserAgent = navigator.userAgent
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      get() {
        return originalUserAgent.replace("HeadlessChrome", "Chrome")
      }
    })

    const original = (
      navigator as Navigator & {
        userAgentData?: {
          brands: Array<{ brand: string; version: string }>
        }
      }
    ).userAgentData
    if (!original) {
      return
    }

    const proxied = new Proxy(original, {
      get(target, prop) {
        if (prop === "brands") {
          return target.brands.map(entry =>
            entry.brand === "HeadlessChrome"
              ? { brand: "Google Chrome", version: entry.version }
              : entry
          )
        }
        const value: unknown = Reflect.get(target, prop)
        if (typeof value === "function") {
          return value.bind(target)
        }
        return value
      }
    })

    Object.defineProperty(navigator, "userAgentData", {
      configurable: true,
      get() {
        return proxied
      }
    })
  })
}
