import { describe, expect, it } from "vitest"
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  createAnalyticsConsentStore,
  serializeAnalyticsConsent
} from "./analytics-consent"
import { createAnalyticsVendorLifecycle } from "./analytics-lifecycle"

function createHarness() {
  const calls: string[] = []
  const persisted: string[] = []
  const lifecycle = createAnalyticsVendorLifecycle({
    persist(status: "granted" | "denied") {
      persisted.push(status)
      calls.push(`persist:${status}`)
    },
    adapters: {
      initPostHog() {
        calls.push("posthog.init")
      },
      optInPostHog() {
        calls.push("posthog.opt_in_capturing")
      },
      optOutPostHog() {
        calls.push("posthog.opt_out_capturing")
      },
      applyGoogleConsentDefaultDenied() {
        calls.push("google.consent.default.denied")
      },
      updateGoogleAnalyticsGranted() {
        calls.push("google.consent.update.analytics_granted")
      },
      updateGoogleConsentDenied() {
        calls.push("google.consent.update.denied")
      },
      loadGoogleTagManager() {
        calls.push("google.load")
      },
      initClarity() {
        calls.push("clarity.init")
      },
      grantClarityAnalytics() {
        calls.push("clarity.consentv2.analytics_granted")
      },
      denyClarityAndErase() {
        calls.push("clarity.consentv2.denied")
        calls.push("clarity.consent.false")
      },
      clearVendorPersistence() {
        calls.push("persistence.clear")
      },
      reload() {
        calls.push("reload")
      }
    }
  })

  return { calls, persisted, lifecycle }
}

describe("analytics vendor lifecycle", () => {
  it("does not initialize vendors on undecided or denied", () => {
    const { calls, lifecycle } = createHarness()
    expect(lifecycle.isInitialized()).toBe(false)
    lifecycle.boot("undecided")
    expect(lifecycle.isInitialized()).toBe(false)
    lifecycle.boot("denied")
    expect(lifecycle.isInitialized()).toBe(false)
    expect(calls).toEqual([])
  })

  it("initializes and opts in exactly once after grant", () => {
    const { calls, persisted, lifecycle } = createHarness()
    lifecycle.grant()
    lifecycle.grant()
    expect(persisted).toEqual(["granted"])
    expect(calls).toEqual([
      "persist:granted",
      "posthog.init",
      "posthog.opt_in_capturing",
      "google.consent.default.denied",
      "google.consent.update.analytics_granted",
      "google.load",
      "clarity.init",
      "clarity.consentv2.analytics_granted"
    ])
    expect(lifecycle.isInitialized()).toBe(true)
  })

  it("boots from a stored grant with the same init+opt-in sequence", () => {
    const { calls, lifecycle } = createHarness()
    lifecycle.boot("granted")
    expect(calls).toEqual([
      "posthog.init",
      "posthog.opt_in_capturing",
      "google.consent.default.denied",
      "google.consent.update.analytics_granted",
      "google.load",
      "clarity.init",
      "clarity.consentv2.analytics_granted"
    ])
  })

  it("withdraws with persisted deny before vendor denial, erase, and reload", () => {
    const { calls, persisted, lifecycle } = createHarness()
    lifecycle.grant()
    calls.length = 0
    persisted.length = 0
    lifecycle.withdraw()
    expect(persisted).toEqual(["denied"])
    expect(calls).toEqual([
      "persist:denied",
      "posthog.opt_out_capturing",
      "google.consent.update.denied",
      "clarity.consentv2.denied",
      "clarity.consent.false",
      "persistence.clear",
      "reload"
    ])
    expect(calls.indexOf("persist:denied")).toBeLessThan(calls.indexOf("reload"))
    expect(lifecycle.isInitialized()).toBe(false)
  })

  it("persists deny without vendor APIs or reload when vendors never loaded", () => {
    const { calls, lifecycle } = createHarness()
    lifecycle.withdraw()
    expect(calls).toEqual(["persist:denied"])
  })

  it("initializes each vendor exactly once when grant persist reenters the controller subscriber", () => {
    const calls: string[] = []
    const persisted: string[] = []
    const box: { lifecycle?: ReturnType<typeof createAnalyticsVendorLifecycle> } =
      {}
    const lifecycle = createAnalyticsVendorLifecycle({
      persist(status) {
        persisted.push(status)
        calls.push(`persist:${status}`)
        const current = box.lifecycle
        if (!current) {
          return
        }
        if (status === "granted") {
          current.boot("granted")
        } else if (status === "denied" && current.isInitialized()) {
          current.withdraw()
        }
      },
      adapters: recordingAdapters(calls)
    })
    box.lifecycle = lifecycle

    lifecycle.grant()

    expect(persisted).toEqual(["granted"])
    expect(calls.filter((call) => call === "posthog.init")).toEqual([
      "posthog.init"
    ])
    expect(calls.filter((call) => call === "clarity.init")).toEqual([
      "clarity.init"
    ])
    expect(calls.filter((call) => call === "google.load")).toEqual([
      "google.load"
    ])
    expect(lifecycle.isInitialized()).toBe(true)
  })

  it("does not recurse when withdraw persist reenters the controller subscriber", () => {
    const calls: string[] = []
    const persisted: string[] = []
    const box: { lifecycle?: ReturnType<typeof createAnalyticsVendorLifecycle> } =
      {}
    const lifecycle = createAnalyticsVendorLifecycle({
      persist(status) {
        persisted.push(status)
        calls.push(`persist:${status}`)
        if (persisted.length > 20) {
          throw new Error("reentrant persistence loop")
        }
        const current = box.lifecycle
        if (!current) {
          return
        }
        if (status === "granted") {
          current.boot("granted")
        } else if (status === "denied" && current.isInitialized()) {
          current.withdraw()
        }
      },
      adapters: recordingAdapters(calls)
    })
    box.lifecycle = lifecycle

    lifecycle.grant()
    calls.length = 0
    persisted.length = 0

    expect(() => lifecycle.withdraw()).not.toThrow()
    expect(persisted).toEqual(["denied"])
    expect(calls).toEqual([
      "persist:denied",
      "posthog.opt_out_capturing",
      "google.consent.update.denied",
      "clarity.consentv2.denied",
      "clarity.consent.false",
      "persistence.clear",
      "reload"
    ])
    expect(lifecycle.isInitialized()).toBe(false)
  })

  it("applies cross-tab denied teardown without rewriting storage", () => {
    const { calls, persisted, lifecycle } = createHarness()
    lifecycle.boot("granted")
    calls.length = 0
    persisted.length = 0

    lifecycle.boot("denied")

    expect(persisted).toEqual([])
    expect(calls).toEqual([
      "posthog.opt_out_capturing",
      "google.consent.update.denied",
      "clarity.consentv2.denied",
      "clarity.consent.false",
      "persistence.clear",
      "reload"
    ])
    expect(lifecycle.isInitialized()).toBe(false)
  })

  it("tears down initialized vendors when observed status becomes undecided", () => {
    const { calls, persisted, lifecycle } = createHarness()
    lifecycle.grant()
    expect(lifecycle.isInitialized()).toBe(true)
    calls.length = 0
    persisted.length = 0

    lifecycle.sync("undecided")

    expect(persisted).toEqual([])
    expect(lifecycle.isInitialized()).toBe(false)
    expect(calls).toEqual([
      "posthog.opt_out_capturing",
      "google.consent.update.denied",
      "clarity.consentv2.denied",
      "clarity.consent.false",
      "persistence.clear",
      "reload"
    ])
    expect(calls.filter((call) => call === "posthog.opt_out_capturing")).toHaveLength(1)
    expect(calls.filter((call) => call === "google.consent.update.denied")).toHaveLength(1)
    expect(calls.filter((call) => call === "clarity.consentv2.denied")).toHaveLength(1)
    expect(calls.filter((call) => call === "clarity.consent.false")).toHaveLength(1)
    expect(calls.filter((call) => call === "persistence.clear")).toHaveLength(1)
    expect(calls.filter((call) => call === "reload")).toHaveLength(1)

    lifecycle.sync("undecided")
    expect(persisted).toEqual([])
    expect(lifecycle.isInitialized()).toBe(false)
    expect(calls.filter((call) => call === "posthog.opt_out_capturing")).toHaveLength(1)
    expect(calls.filter((call) => call === "google.consent.update.denied")).toHaveLength(1)
    expect(calls.filter((call) => call === "clarity.consentv2.denied")).toHaveLength(1)
    expect(calls.filter((call) => call === "clarity.consent.false")).toHaveLength(1)
    expect(calls.filter((call) => call === "persistence.clear")).toHaveLength(1)
    expect(calls.filter((call) => call === "reload")).toHaveLength(1)
  })

  it("tears down once on a cross-tab corrupt or removed consent event without rewriting storage", () => {
    const data = new Map<string, string>()
    const storage = {
      getItem(key: string) {
        return data.has(key) ? data.get(key)! : null
      },
      setItem(key: string, value: string) {
        data.set(key, value)
      }
    }
    const listeners = new Set<
      (event: { key: string | null; newValue: string | null }) => void
    >()
    const target = {
      addEventListener(
        _type: "storage",
        listener: (event: { key: string | null; newValue: string | null }) => void
      ) {
        listeners.add(listener)
      },
      removeEventListener(
        _type: "storage",
        listener: (event: { key: string | null; newValue: string | null }) => void
      ) {
        listeners.delete(listener)
      }
    }
    const store = createAnalyticsConsentStore({ storage, target })
    const calls: string[] = []
    const persistWrites: string[] = []
    const lifecycle = createAnalyticsVendorLifecycle({
      persist(status) {
        persistWrites.push(status)
        return store.set(status)
      },
      adapters: recordingAdapters(calls)
    })
    store.subscribe(() => {
      lifecycle.sync(store.get())
    })

    expect(store.set("granted")).toBe(true)
    expect(store.get()).toBe("granted")
    expect(lifecycle.isInitialized()).toBe(true)
    expect(data.get(ANALYTICS_CONSENT_STORAGE_KEY)).toBe(
      serializeAnalyticsConsent("granted")
    )

    calls.length = 0
    persistWrites.length = 0

    data.delete(ANALYTICS_CONSENT_STORAGE_KEY)
    for (const listener of [...listeners]) {
      listener({
        key: ANALYTICS_CONSENT_STORAGE_KEY,
        newValue: null
      })
    }

    expect(store.get()).toBe("undecided")
    expect(lifecycle.isInitialized()).toBe(false)
    expect(persistWrites).toEqual([])
    expect(data.has(ANALYTICS_CONSENT_STORAGE_KEY)).toBe(false)
    expect(calls).toEqual([
      "posthog.opt_out_capturing",
      "google.consent.update.denied",
      "clarity.consentv2.denied",
      "clarity.consent.false",
      "persistence.clear",
      "reload"
    ])

    data.set(ANALYTICS_CONSENT_STORAGE_KEY, "{")
    for (const listener of [...listeners]) {
      listener({
        key: ANALYTICS_CONSENT_STORAGE_KEY,
        newValue: "{"
      })
    }

    expect(store.get()).toBe("undecided")
    expect(lifecycle.isInitialized()).toBe(false)
    expect(persistWrites).toEqual([])
    expect(data.get(ANALYTICS_CONSENT_STORAGE_KEY)).toBe("{")
    expect(calls.filter((call) => call === "reload")).toEqual(["reload"])
  })

  it("is idempotent for repeated grant, boot, withdraw, and denied apply", () => {
    const { calls, persisted, lifecycle } = createHarness()
    lifecycle.grant()
    lifecycle.grant()
    lifecycle.boot("granted")
    expect(persisted).toEqual(["granted"])
    expect(calls.filter((call) => call === "posthog.init")).toHaveLength(1)

    calls.length = 0
    persisted.length = 0
    lifecycle.withdraw()
    lifecycle.withdraw()
    lifecycle.boot("denied")
    expect(persisted).toEqual(["denied"])
    expect(calls.filter((call) => call === "reload")).toEqual(["reload"])
    expect(lifecycle.isInitialized()).toBe(false)
  })

  it("does not initialize vendors when grant persistence fails", () => {
    const calls: string[] = []
    const lifecycle = createAnalyticsVendorLifecycle({
      persist(status) {
        calls.push(`persist:${status}`)
        return false
      },
      adapters: recordingAdapters(calls)
    })

    lifecycle.grant()

    expect(lifecycle.isInitialized()).toBe(false)
    expect(calls).toEqual(["persist:granted"])
  })

  it("tears down exactly once when withdrawal persistence throws", () => {
    const calls: string[] = []
    const persisted: string[] = []
    let failWrites = false
    const lifecycle = createAnalyticsVendorLifecycle({
      persist(status) {
        persisted.push(status)
        calls.push(`persist:${status}`)
        if (failWrites) {
          throw new Error("blocked")
        }
        return true
      },
      adapters: recordingAdapters(calls)
    })

    lifecycle.grant()
    calls.length = 0
    persisted.length = 0
    failWrites = true

    expect(() => lifecycle.withdraw()).not.toThrow()
    expect(persisted).toEqual(["denied"])
    expect(calls.filter((call) => call === "reload")).toEqual(["reload"])
    expect(calls.filter((call) => call === "posthog.opt_out_capturing")).toHaveLength(
      1
    )
    expect(lifecycle.isInitialized()).toBe(false)
  })
})

function recordingAdapters(calls: string[]) {
  return {
    initPostHog() {
      calls.push("posthog.init")
    },
    optInPostHog() {
      calls.push("posthog.opt_in_capturing")
    },
    optOutPostHog() {
      calls.push("posthog.opt_out_capturing")
    },
    applyGoogleConsentDefaultDenied() {
      calls.push("google.consent.default.denied")
    },
    updateGoogleAnalyticsGranted() {
      calls.push("google.consent.update.analytics_granted")
    },
    updateGoogleConsentDenied() {
      calls.push("google.consent.update.denied")
    },
    loadGoogleTagManager() {
      calls.push("google.load")
    },
    initClarity() {
      calls.push("clarity.init")
    },
    grantClarityAnalytics() {
      calls.push("clarity.consentv2.analytics_granted")
    },
    denyClarityAndErase() {
      calls.push("clarity.consentv2.denied")
      calls.push("clarity.consent.false")
    },
    clearVendorPersistence() {
      calls.push("persistence.clear")
    },
    reload() {
      calls.push("reload")
    }
  }
}
