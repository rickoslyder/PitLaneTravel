import { useSyncExternalStore } from "react"

export const ANALYTICS_CONSENT_STORAGE_KEY = "pitlane.analytics-consent"
export const ANALYTICS_CONSENT_SCHEMA_VERSION = 1

export type AnalyticsConsentStatus = "undecided" | "granted" | "denied"
export type StoredAnalyticsConsentStatus = "granted" | "denied"

export function parseAnalyticsConsent(
  raw: string | null
): AnalyticsConsentStatus {
  if (raw == null || raw === "") {
    return "undecided"
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return "undecided"
    }

    const record = parsed as Record<string, unknown>
    const keys = Object.keys(record)
    if (keys.length !== 2) {
      return "undecided"
    }
    if (
      record.v !== ANALYTICS_CONSENT_SCHEMA_VERSION ||
      (record.status !== "granted" && record.status !== "denied")
    ) {
      return "undecided"
    }

    return record.status
  } catch {
    return "undecided"
  }
}

export function serializeAnalyticsConsent(
  status: StoredAnalyticsConsentStatus
): string {
  return JSON.stringify({
    v: ANALYTICS_CONSENT_SCHEMA_VERSION,
    status
  })
}

export type AnalyticsConsentStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export type AnalyticsConsentStorageEvent = {
  key: string | null
  newValue: string | null
}

export type AnalyticsConsentEventTarget = {
  addEventListener(
    type: "storage",
    listener: (event: AnalyticsConsentStorageEvent) => void
  ): void
  removeEventListener(
    type: "storage",
    listener: (event: AnalyticsConsentStorageEvent) => void
  ): void
}

export type AnalyticsConsentStore = {
  get(): AnalyticsConsentStatus
  set(status: StoredAnalyticsConsentStatus): boolean
  subscribe(listener: () => void): () => void
  getServerSnapshot(): AnalyticsConsentStatus
  detach(): void
}

function readConsent(storage: AnalyticsConsentStorage | null): AnalyticsConsentStatus {
  if (!storage) {
    return "undecided"
  }
  try {
    return parseAnalyticsConsent(storage.getItem(ANALYTICS_CONSENT_STORAGE_KEY))
  } catch {
    return "undecided"
  }
}

export function createAnalyticsConsentStore(options?: {
  storage?: AnalyticsConsentStorage | null
  target?: AnalyticsConsentEventTarget | null
}): AnalyticsConsentStore {
  const storage = options && "storage" in options ? options.storage ?? null : getDefaultStorage()
  const target = options && "target" in options ? options.target ?? null : getDefaultTarget()
  let cached: AnalyticsConsentStatus | undefined
  const listeners = new Set<() => void>()

  function get(): AnalyticsConsentStatus {
    if (cached === undefined) {
      cached = readConsent(storage)
    }
    return cached
  }

  function emit(): void {
    for (const listener of listeners) {
      listener()
    }
  }

  function set(status: StoredAnalyticsConsentStatus): boolean {
    if (get() === status) {
      return true
    }
    if (!storage) {
      if (status === "granted") {
        return false
      }
      cached = "denied"
      emit()
      return false
    }
    let persisted = false
    try {
      storage.setItem(
        ANALYTICS_CONSENT_STORAGE_KEY,
        serializeAnalyticsConsent(status)
      )
      persisted = true
    } catch {
      persisted = false
    }
    if (status === "granted" && !persisted) {
      return false
    }
    cached = status
    emit()
    return persisted
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  function onStorage(event: AnalyticsConsentStorageEvent): void {
    if (event.key !== null && event.key !== ANALYTICS_CONSENT_STORAGE_KEY) {
      return
    }
    cached = readConsent(storage)
    emit()
  }

  if (target) {
    target.addEventListener("storage", onStorage)
  }

  return {
    get,
    set,
    subscribe,
    getServerSnapshot() {
      return "undecided"
    },
    detach() {
      if (target) {
        target.removeEventListener("storage", onStorage)
      }
      listeners.clear()
    }
  }
}

function getDefaultStorage(): AnalyticsConsentStorage | null {
  if (typeof window === "undefined") {
    return null
  }
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function getDefaultTarget(): AnalyticsConsentEventTarget | null {
  if (typeof window === "undefined") {
    return null
  }
  return window
}

const defaultStore = createAnalyticsConsentStore()

export function getAnalyticsConsent(): AnalyticsConsentStatus {
  return defaultStore.get()
}

export function isAnalyticsGranted(): boolean {
  return defaultStore.get() === "granted"
}

export function setAnalyticsConsent(status: StoredAnalyticsConsentStatus): boolean {
  return defaultStore.set(status)
}

export function subscribeAnalyticsConsent(listener: () => void): () => void {
  return defaultStore.subscribe(listener)
}

export function getAnalyticsConsentServerSnapshot(): AnalyticsConsentStatus {
  return defaultStore.getServerSnapshot()
}

export function useAnalyticsConsent(): AnalyticsConsentStatus {
  return useSyncExternalStore(
    defaultStore.subscribe,
    defaultStore.get,
    defaultStore.getServerSnapshot
  )
}
