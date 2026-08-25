import Clarity from "@microsoft/clarity"
import posthog from "posthog-js"
import { ANALYTICS_CONSENT_STORAGE_KEY } from "./analytics-consent"
import type { AnalyticsVendorAdapters } from "./analytics-lifecycle"

const DENIED_GOOGLE_CONSENT = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied"
} as const

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[] }

type AnalyticsWindow = Window & {
  dataLayer?: unknown[]
  clarity?: ClarityFn
}

function analyticsWindow(): AnalyticsWindow | null {
  if (typeof window === "undefined") {
    return null
  }
  return window
}

// Official consent commands push the `arguments` object, not a plain array.
// https://developers.google.com/tag-platform/security/guides/consent
function gtag(..._args: unknown[]): void {
  const w = analyticsWindow()
  if (!w) {
    return
  }
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push(arguments)
}

function vendorStorageKey(key: string): boolean {
  if (key === ANALYTICS_CONSENT_STORAGE_KEY) {
    return false
  }
  return (
    /^(ph_|_clck|_clsk|_ga|_gid|_gcl)/i.test(key) ||
    /posthog/i.test(key) ||
    /clarity/i.test(key)
  )
}

function clearStorage(storage: Storage): void {
  const keys: string[] = []
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i)
    if (key) {
      keys.push(key)
    }
  }
  for (const key of keys) {
    if (vendorStorageKey(key)) {
      storage.removeItem(key)
    }
  }
}

const VENDOR_COOKIE_EXPIRED = "Thu, 01 Jan 1970 00:00:00 GMT"

function isIpHostname(hostname: string): boolean {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || hostname.includes(":")
}

function cookiePathCandidates(pathname: string): string[] {
  const raw = pathname.trim() || "/"
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`
  const noQuery = withSlash.split("?")[0]?.split("#")[0] || "/"
  const paths = new Set<string>(["/"])
  if (noQuery !== "/") {
    const trimmed =
      noQuery.length > 1 && noQuery.endsWith("/") ? noQuery.slice(0, -1) : noQuery
    const parts = trimmed.split("/").filter(Boolean)
    let acc = ""
    for (const part of parts) {
      acc += `/${part}`
      paths.add(acc)
    }
  }
  return [...paths]
}

function cookieDomainCandidates(hostname: string): Array<string | null> {
  const host = hostname.trim().toLowerCase().replace(/\.$/, "")
  if (!host || host === "localhost" || isIpHostname(host)) {
    return [null]
  }
  const domains = new Set<string | null>([null, host, `.${host}`])
  const labels = host.split(".").filter(Boolean)
  for (let index = 1; index <= labels.length - 2; index += 1) {
    const parent = labels.slice(index).join(".")
    domains.add(parent)
    domains.add(`.${parent}`)
  }
  return [...domains]
}

// Visible first-party vendor cookies are not uniformly path=/ or host-only:
// Google `_ga`/`_gid`/`_gcl*` are often Domain=.registrable with path=/;
// Clarity `_clck`/`_clsk` and leftover PostHog `ph_*` cookies are typically
// host-only path=/. A route-path cookie cannot be expired with path=/ alone.
// document.cookie cannot read Domain/Path/SameSite, so withdrawal best-effort
// enumerates bounded path prefixes plus host-only/current/parent Domain
// variants. No public-suffix lookup and no invented localhost parents.
export function vendorCookieDeletionStrings(input: {
  name: string
  hostname: string
  pathname: string
}): string[] {
  const name = input.name.trim()
  if (!name) {
    return []
  }
  const paths = cookiePathCandidates(input.pathname)
  const domains = cookieDomainCandidates(input.hostname)
  const values = new Set<string>()
  for (const path of paths) {
    for (const domain of domains) {
      for (const extra of ["", "; SameSite=Lax"]) {
        let value = `${name}=; Max-Age=0; Expires=${VENDOR_COOKIE_EXPIRED}; path=${path}`
        if (domain) {
          value += `; Domain=${domain}`
        }
        value += extra
        values.add(value)
      }
    }
  }
  return [...values]
}

function callClarity(...args: unknown[]): void {
  const w = analyticsWindow()
  if (!w) {
    return
  }
  if (typeof w.clarity === "function") {
    w.clarity(...args)
    return
  }
  const queued: ClarityFn = function clarityQueued(...queuedArgs: unknown[]) {
    queued.q = queued.q || []
    queued.q.push(queuedArgs)
  }
  queued.q = []
  w.clarity = queued
  queued(...args)
}

export function createBrowserAnalyticsAdapters(options: {
  onLoadGoogleTagManager: () => void
  reload: () => void
}): AnalyticsVendorAdapters {
  return {
    initPostHog() {
      const w = analyticsWindow()
      if (!w) {
        return
      }
      const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
      const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
      if (!key || !host) {
        return
      }
      try {
        // https://posthog.com/docs/libraries/js
        // https://posthog.com/docs/libraries/js/config
        posthog.init(key, {
          api_host: "https://www.pitlanetravel.com/ingest",
          ui_host: host,
          autocapture: false,
          capture_pageview: false,
          capture_pageleave: false,
          disable_session_recording: true,
          persistence: "localStorage",
          advanced_disable_decide: true,
          opt_out_capturing_by_default: true,
          opt_out_persistence_by_default: true
        })
      } catch {
        return
      }
    },
    optInPostHog() {
      try {
        posthog.opt_in_capturing()
      } catch {
        return
      }
    },
    optOutPostHog() {
      try {
        posthog.opt_out_capturing()
      } catch {
        return
      }
    },
    applyGoogleConsentDefaultDenied() {
      gtag("consent", "default", { ...DENIED_GOOGLE_CONSENT })
    },
    updateGoogleAnalyticsGranted() {
      gtag("consent", "update", {
        ...DENIED_GOOGLE_CONSENT,
        analytics_storage: "granted"
      })
    },
    updateGoogleConsentDenied() {
      gtag("consent", "update", { ...DENIED_GOOGLE_CONSENT })
    },
    loadGoogleTagManager() {
      options.onLoadGoogleTagManager()
    },
    initClarity() {
      const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID
      if (!projectId || !analyticsWindow()) {
        return
      }
      try {
        Clarity.init(projectId)
      } catch {
        return
      }
    },
    grantClarityAnalytics() {
      // https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2
      callClarity("consentv2", {
        ad_Storage: "denied",
        analytics_Storage: "granted"
      })
    },
    denyClarityAndErase() {
      callClarity("consentv2", {
        ad_Storage: "denied",
        analytics_Storage: "denied"
      })
      try {
        Clarity.consent(false)
      } catch {
        callClarity("consent", false)
      }
    },
    clearVendorPersistence() {
      const w = analyticsWindow()
      if (!w) {
        return
      }
      try {
        clearStorage(w.localStorage)
      } catch {
        // fail closed; do not log storage contents
      }
      try {
        clearStorage(w.sessionStorage)
      } catch {
        // fail closed
      }
      try {
        const cookies = w.document.cookie.split(";")
        const hostname = w.location.hostname
        const pathname = w.location.pathname
        for (const cookie of cookies) {
          const name = cookie.split("=")[0]?.trim()
          if (name && vendorStorageKey(name)) {
            for (const deletion of vendorCookieDeletionStrings({
              name,
              hostname,
              pathname
            })) {
              w.document.cookie = deletion
            }
          }
        }
      } catch {
        // fail closed
      }
      try {
        if (Array.isArray(w.dataLayer)) {
          w.dataLayer.length = 0
        }
      } catch {
        // fail closed
      }
    },
    reload() {
      options.reload()
    }
  }
}
