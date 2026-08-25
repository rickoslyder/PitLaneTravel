import { sendGTMEvent as sendGoogleTagManagerEvent } from "@next/third-parties/google"
import posthog from "posthog-js"
import { isAnalyticsGranted } from "./analytics-consent"

export type AnalyticsEventVendors = {
  isGranted: () => boolean
  sendGTMEvent: (event: Record<string, unknown>) => void
  capture: (event: string, properties?: Record<string, unknown>) => void
  identify: (distinctId: string) => void
  reset: () => void
}

export type AnalyticsEventGuards = {
  sendGTMEvent: (event: Record<string, unknown>) => boolean
  capturePostHog: (
    event: string,
    properties?: Record<string, unknown>
  ) => boolean
  identifyPostHog: (distinctId: string) => boolean
  resetPostHog: () => boolean
}

function runIfGranted(
  isGranted: () => boolean,
  run: () => void
): boolean {
  if (!isGranted()) {
    return false
  }
  try {
    run()
    return true
  } catch {
    return false
  }
}

export function createAnalyticsEventGuards(
  deps: AnalyticsEventVendors
): AnalyticsEventGuards {
  return {
    sendGTMEvent(event) {
      return runIfGranted(deps.isGranted, () => {
        deps.sendGTMEvent(event)
      })
    },
    capturePostHog(event, properties) {
      return runIfGranted(deps.isGranted, () => {
        deps.capture(event, properties)
      })
    },
    identifyPostHog(distinctId) {
      return runIfGranted(deps.isGranted, () => {
        deps.identify(distinctId)
      })
    },
    resetPostHog() {
      return runIfGranted(deps.isGranted, () => {
        deps.reset()
      })
    }
  }
}

const defaultGuards = createAnalyticsEventGuards({
  isGranted: isAnalyticsGranted,
  sendGTMEvent(event) {
    sendGoogleTagManagerEvent(event)
  },
  capture(event, properties) {
    posthog.capture(event, properties)
  },
  identify(distinctId) {
    posthog.identify(distinctId)
  },
  reset() {
    posthog.reset()
  }
})

export function sendGTMEvent(event: object): boolean {
  return defaultGuards.sendGTMEvent(event as Record<string, unknown>)
}

export function capturePostHog(
  event: string,
  properties?: Record<string, unknown>
): boolean {
  return defaultGuards.capturePostHog(event, properties)
}

export function identifyPostHog(distinctId: string): boolean {
  return defaultGuards.identifyPostHog(distinctId)
}

export function resetPostHog(): boolean {
  return defaultGuards.resetPostHog()
}
