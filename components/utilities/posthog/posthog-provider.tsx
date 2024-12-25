/*
<ai_context>
This client component provides the PostHog provider for the app.
It includes error handling and ad blocker detection.
</ai_context>
*/

"use client"

import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { useEffect, useState } from "react"

// Initialize PostHog with error handling
const initPostHog = () => {
  try {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

    if (!key || !host) {
      return
    }

    posthog.init(key, {
      api_host: host,
      loaded: posthog => {
        if (process.env.NODE_ENV === "development") {
          console.log("[PostHog] Loaded successfully")
        }
      },
      bootstrap: {
        distinctID: "anonymous"
      },
      autocapture: false,
      capture_pageview: true,
      capture_pageleave: false,
      disable_session_recording: true,
      persistence: "localStorage",
      advanced_disable_decide: true,
      opt_out_capturing_by_default: true // Start opted out until we confirm no blocker
    })
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[PostHog] Failed to initialize:", error)
    }
  }
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Only initialize PostHog once on the client side
    initPostHog()

    // Check if PostHog is blocked and enable if not
    const checkAndEnablePostHog = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_POSTHOG_HOST || "",
          {
            method: "HEAD",
            mode: "no-cors"
          }
        )
        posthog.opt_in_capturing() // Enable tracking if not blocked
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[PostHog] Blocked by client (likely an ad blocker)")
        }
      }
      setIsInitialized(true)
    }

    checkAndEnablePostHog()
  }, [])

  // Always render the provider to avoid hydration mismatches
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
