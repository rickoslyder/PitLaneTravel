"use client"

import { useAnalyticsConsent } from "@/lib/analytics-consent"
import { sendGTMEvent } from "@/lib/analytics-events"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function PageViewTracker({ userId }: { userId: string | null }) {
  const pathname = usePathname()
  const consent = useAnalyticsConsent()

  useEffect(() => {
    if (consent !== "granted" || !pathname) {
      return
    }
    sendGTMEvent({
      event: "page_view",
      user_data: {
        external_id: userId ?? null
      },
      x_fb_ud_external_id: userId ?? null
    })
  }, [consent, pathname, userId])

  return null
}
