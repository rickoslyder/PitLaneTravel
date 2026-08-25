"use client"

import { useAnalyticsConsent } from "@/lib/analytics-consent"
import { capturePostHog } from "@/lib/analytics-events"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function PostHogPageview() {
  const pathname = usePathname()
  const consent = useAnalyticsConsent()

  useEffect(() => {
    if (consent !== "granted" || !pathname) {
      return
    }
    capturePostHog("$pageview", { path: pathname })
  }, [consent, pathname])

  return null
}
