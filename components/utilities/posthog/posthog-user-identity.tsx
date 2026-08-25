"use client"

import { useUser } from "@clerk/nextjs"
import { useAnalyticsConsent } from "@/lib/analytics-consent"
import { identifyPostHog, resetPostHog } from "@/lib/analytics-events"
import { useEffect } from "react"

export function PostHogUserIdentify() {
  const { user } = useUser()
  const consent = useAnalyticsConsent()

  useEffect(() => {
    if (consent !== "granted") {
      return
    }
    if (user?.id) {
      identifyPostHog(user.id)
    } else {
      resetPostHog()
    }
  }, [consent, user?.id])

  return null
}
