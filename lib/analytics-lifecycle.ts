import type { AnalyticsConsentStatus, StoredAnalyticsConsentStatus } from "./analytics-consent"

export type AnalyticsVendorAdapters = {
  initPostHog: () => void
  optInPostHog: () => void
  optOutPostHog: () => void
  applyGoogleConsentDefaultDenied: () => void
  updateGoogleAnalyticsGranted: () => void
  updateGoogleConsentDenied: () => void
  loadGoogleTagManager: () => void
  initClarity: () => void
  grantClarityAnalytics: () => void
  denyClarityAndErase: () => void
  clearVendorPersistence: () => void
  reload: () => void
}

export type AnalyticsVendorLifecycle = {
  isInitialized(): boolean
  boot(status: AnalyticsConsentStatus): void
  sync(status: AnalyticsConsentStatus): void
  grant(): void
  withdraw(): void
}

function initializeVendors(adapters: AnalyticsVendorAdapters): void {
  adapters.initPostHog()
  adapters.optInPostHog()
  adapters.applyGoogleConsentDefaultDenied()
  adapters.updateGoogleAnalyticsGranted()
  adapters.loadGoogleTagManager()
  adapters.initClarity()
  adapters.grantClarityAnalytics()
}

function teardownVendors(adapters: AnalyticsVendorAdapters): void {
  adapters.optOutPostHog()
  adapters.updateGoogleConsentDenied()
  adapters.denyClarityAndErase()
  adapters.clearVendorPersistence()
  adapters.reload()
}

export function createAnalyticsVendorLifecycle(deps: {
  persist: (status: StoredAnalyticsConsentStatus) => boolean | void
  adapters: AnalyticsVendorAdapters
}): AnalyticsVendorLifecycle {
  let initialized = false
  let denied = false
  let transitioning = false

  function sync(status: AnalyticsConsentStatus): void {
    if (status === "granted") {
      if (initialized) {
        return
      }
      initializeVendors(deps.adapters)
      initialized = true
      denied = false
      return
    }
    if (status === "denied") {
      denied = true
    }
    if (!initialized) {
      return
    }
    initialized = false
    teardownVendors(deps.adapters)
  }

  function grant(): void {
    if (initialized || transitioning) {
      return
    }
    transitioning = true
    let persisted = false
    try {
      persisted = deps.persist("granted") !== false
    } catch {
      persisted = false
    }
    transitioning = false
    if (!persisted) {
      return
    }
    denied = false
    sync("granted")
  }

  function withdraw(): void {
    if (transitioning || denied) {
      return
    }
    transitioning = true
    denied = true
    try {
      deps.persist("denied")
    } catch {
      // Current-tab deny still applies when durable storage fails.
    }
    sync("denied")
    transitioning = false
  }

  return {
    isInitialized() {
      return initialized
    },
    boot: sync,
    sync,
    grant,
    withdraw
  }
}
