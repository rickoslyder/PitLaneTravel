"use client"

import { useAnalyticsConsent } from "@/lib/analytics-consent"
import { captureAnalyticsEvent } from "@/lib/analytics/capture"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function PostHogPageview() {
  const pathname = usePathname()
  const consent = useAnalyticsConsent()

  useEffect(() => {
    if (consent !== "granted" || !pathname) {
      return
    }
    captureAnalyticsEvent({ event: "page viewed", pathname })
  }, [consent, pathname])

  return null
}
