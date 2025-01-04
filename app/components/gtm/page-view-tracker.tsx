"use client"

import { sendGTMEvent } from "@next/third-parties/google"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function PageViewTracker({ userId }: { userId: string | null }) {
  const pathname = usePathname()

  useEffect(() => {
    // Track a pageview whenever the pathname changes
    if (pathname) {
      sendGTMEvent({
        event: "page_view",
        user_data: {
          external_id: userId ?? null
        },
        x_fb_ud_external_id: userId ?? null
      })
    }
  }, [pathname])

  return null
}
