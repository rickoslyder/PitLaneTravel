import { describe, expect, it } from "vitest"
import {
  ANALYTICS_CONSENT_SCHEMA_VERSION,
  ANALYTICS_CONSENT_STORAGE_KEY,
  createAnalyticsConsentStore,
  parseAnalyticsConsent,
  serializeAnalyticsConsent
} from "./analytics-consent"

type MemoryStorage = {
  data: Map<string, string>
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

function memoryStorage(): MemoryStorage {
  const data = new Map<string, string>()
  return {
    data,
    getItem(key) {
      return data.has(key) ? data.get(key)! : null
    },
    setItem(key, value) {
      data.set(key, value)
    }
  }
}

function memoryTarget() {
  const listeners = new Set<(event: { key: string | null; newValue: string | null }) => void>()
  return {
    listeners,
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
    },
    dispatch(event: { key: string | null; newValue: string | null }) {
      for (const listener of [...listeners]) {
        listener(event)
      }
    }
  }
}

describe("analytics consent parser/storage", () => {
  it("returns undecided when storage is absent or empty", () => {
    expect(parseAnalyticsConsent(null)).toBe("undecided")
    expect(parseAnalyticsConsent("")).toBe("undecided")
  })

  it("returns denied for exact current-version denied payload", () => {
    expect(
      parseAnalyticsConsent(
        JSON.stringify({
          v: ANALYTICS_CONSENT_SCHEMA_VERSION,
          status: "denied"
        })
      )
    ).toBe("denied")
  })

  it("returns granted only for exact current-version granted payload", () => {
    expect(
      parseAnalyticsConsent(
        JSON.stringify({
          v: ANALYTICS_CONSENT_SCHEMA_VERSION,
          status: "granted"
        })
      )
    ).toBe("granted")
  })

  it("fails closed to undecided on corrupt JSON", () => {
    expect(parseAnalyticsConsent("{")).toBe("undecided")
    expect(parseAnalyticsConsent("not-json")).toBe("undecided")
    expect(parseAnalyticsConsent("undefined")).toBe("undecided")
  })

  it("fails closed to undecided on wrong schema version", () => {
    expect(
      parseAnalyticsConsent(JSON.stringify({ v: 0, status: "granted" }))
    ).toBe("undecided")
    expect(
      parseAnalyticsConsent(JSON.stringify({ v: 2, status: "granted" }))
    ).toBe("undecided")
    expect(
      parseAnalyticsConsent(JSON.stringify({ v: "1", status: "granted" }))
    ).toBe("undecided")
  })

  it("fails closed to undecided on unknown status values and extra keys", () => {
    expect(
      parseAnalyticsConsent(
        JSON.stringify({ v: ANALYTICS_CONSENT_SCHEMA_VERSION, status: "yes" })
      )
    ).toBe("undecided")
    expect(
      parseAnalyticsConsent(
        JSON.stringify({
          v: ANALYTICS_CONSENT_SCHEMA_VERSION,
          status: "granted",
          userId: "user_123"
        })
      )
    ).toBe("undecided")
    expect(
      parseAnalyticsConsent(JSON.stringify({ status: "granted" }))
    ).toBe("undecided")
    expect(parseAnalyticsConsent(JSON.stringify(["granted"]))).toBe("undecided")
    expect(parseAnalyticsConsent("true")).toBe("undecided")
  })

  it("serializes only a versioned granted or denied payload", () => {
    expect(JSON.parse(serializeAnalyticsConsent("granted"))).toEqual({
      v: ANALYTICS_CONSENT_SCHEMA_VERSION,
      status: "granted"
    })
    expect(JSON.parse(serializeAnalyticsConsent("denied"))).toEqual({
      v: ANALYTICS_CONSENT_SCHEMA_VERSION,
      status: "denied"
    })
    expect(ANALYTICS_CONSENT_STORAGE_KEY).toBe("pitlane.analytics-consent")
  })

  it("fails closed when storage getItem or setItem throws", () => {
    const storage = {
      getItem() {
        throw new Error("blocked")
      },
      setItem() {
        throw new Error("blocked")
      }
    }
    const store = createAnalyticsConsentStore({ storage, target: null })
    expect(store.get()).toBe("undecided")
    store.set("granted")
    expect(store.get()).toBe("undecided")
  })
})

describe("analytics consent store subscription", () => {
  it("notifies same-tab subscribers on set and persists the versioned value", () => {
    const storage = memoryStorage()
    const store = createAnalyticsConsentStore({ storage, target: null })
    const seen: string[] = []
    const unsubscribe = store.subscribe(() => {
      seen.push(store.get())
    })

    expect(store.get()).toBe("undecided")
    store.set("granted")
    expect(store.get()).toBe("granted")
    expect(seen).toEqual(["granted"])
    expect(storage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)).toBe(
      serializeAnalyticsConsent("granted")
    )

    unsubscribe()
    store.set("denied")
    expect(seen).toEqual(["granted"])
    expect(store.get()).toBe("denied")
  })

  it("applies cross-tab storage events and ignores other keys", () => {
    const storage = memoryStorage()
    const target = memoryTarget()
    const store = createAnalyticsConsentStore({ storage, target })
    const seen: string[] = []
    store.subscribe(() => {
      seen.push(store.get())
    })

    storage.setItem(
      ANALYTICS_CONSENT_STORAGE_KEY,
      serializeAnalyticsConsent("granted")
    )
    target.dispatch({
      key: ANALYTICS_CONSENT_STORAGE_KEY,
      newValue: serializeAnalyticsConsent("granted")
    })
    expect(store.get()).toBe("granted")
    expect(seen).toEqual(["granted"])

    target.dispatch({
      key: "unrelated",
      newValue: serializeAnalyticsConsent("denied")
    })
    expect(store.get()).toBe("granted")
    expect(seen).toEqual(["granted"])

    storage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, "{")
    target.dispatch({
      key: ANALYTICS_CONSENT_STORAGE_KEY,
      newValue: "{"
    })
    expect(store.get()).toBe("undecided")
    expect(seen).toEqual(["granted", "undecided"])
  })

  it("does not leak subscribe or storage listeners after unsubscribe and detach", () => {
    const storage = memoryStorage()
    const target = memoryTarget()
    const store = createAnalyticsConsentStore({ storage, target })
    const listener = () => {
      throw new Error("leaked subscriber")
    }
    const unsubscribe = store.subscribe(listener)
    expect(target.listeners.size).toBe(1)
    unsubscribe()
    store.set("granted")

    store.detach()
    expect(target.listeners.size).toBe(0)
    storage.setItem(
      ANALYTICS_CONSENT_STORAGE_KEY,
      serializeAnalyticsConsent("denied")
    )
    target.dispatch({
      key: ANALYTICS_CONSENT_STORAGE_KEY,
      newValue: serializeAnalyticsConsent("denied")
    })
    expect(store.get()).toBe("granted")
  })

  it("uses an undecided server snapshot even when client storage is granted", () => {
    const storage = memoryStorage()
    storage.setItem(
      ANALYTICS_CONSENT_STORAGE_KEY,
      serializeAnalyticsConsent("granted")
    )
    const store = createAnalyticsConsentStore({ storage, target: null })
    expect(store.get()).toBe("granted")
    expect(store.getServerSnapshot()).toBe("undecided")
  })

  it("returns false and stays undecided when a granted write throws", () => {
    const storage = {
      getItem() {
        return null
      },
      setItem() {
        throw new Error("blocked")
      }
    }
    const store = createAnalyticsConsentStore({ storage, target: null })
    const seen: string[] = []
    store.subscribe(() => {
      seen.push(store.get())
    })

    expect(store.set("granted")).toBe(false)
    expect(store.get()).toBe("undecided")
    expect(seen).toEqual([])
  })

  it("denies cached state, notifies once, and reports persistence failure when a denied write throws", () => {
    const storage = memoryStorage()
    const store = createAnalyticsConsentStore({ storage, target: null })
    expect(store.set("granted")).toBe(true)

    storage.setItem = () => {
      throw new Error("blocked")
    }
    const seen: string[] = []
    store.subscribe(() => {
      seen.push(store.get())
    })

    expect(store.set("denied")).toBe(false)
    expect(store.get()).toBe("denied")
    expect(seen).toEqual(["denied"])
    expect(storage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)).toBe(
      serializeAnalyticsConsent("granted")
    )
  })

  it("does not rewrite or re-notify when the same status is set again", () => {
    const storage = memoryStorage()
    let writes = 0
    const originalSet = storage.setItem.bind(storage)
    storage.setItem = (key, value) => {
      writes += 1
      originalSet(key, value)
    }
    const store = createAnalyticsConsentStore({ storage, target: null })
    expect(store.set("granted")).toBe(true)
    const seen: string[] = []
    store.subscribe(() => {
      seen.push(store.get())
    })

    expect(store.set("granted")).toBe(true)
    expect(writes).toBe(1)
    expect(seen).toEqual([])
    expect(store.get()).toBe("granted")
  })
})
