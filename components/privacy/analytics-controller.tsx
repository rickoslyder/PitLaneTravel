"use client"

import { GoogleTagManager } from "@next/third-parties/google"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { useEffect, useState } from "react"
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  subscribeAnalyticsConsent
} from "@/lib/analytics-consent"
import { createAnalyticsVendorLifecycle } from "@/lib/analytics-lifecycle"
import { createBrowserAnalyticsAdapters } from "@/lib/analytics-vendors"
import { gtmPixelID, gtmServerID } from "@/lib/google-tag-manager"
import { ConsentBanner } from "./consent-banner"

export function AnalyticsController() {
  const [gtmEnabled, setGtmEnabled] = useState(false)
  const [lifecycle] = useState(() =>
    createAnalyticsVendorLifecycle({
      persist: setAnalyticsConsent,
      adapters: createBrowserAnalyticsAdapters({
        onLoadGoogleTagManager() {
          setGtmEnabled(true)
        },
        reload() {
          window.location.reload()
        }
      })
    })
  )

  useEffect(() => {
    const applyObserved = () => {
      lifecycle.sync(getAnalyticsConsent())
    }
    applyObserved()
    return subscribeAnalyticsConsent(applyObserved)
  }, [lifecycle])

  return (
    <>
      {gtmEnabled ? (
        <>
          <GoogleTagManager gtmId={gtmPixelID} />
          <GoogleTagManager gtmId={gtmServerID} />
          <SpeedInsights />
        </>
      ) : null}
      <ConsentBanner
        onAccept={() => lifecycle.grant()}
        onReject={() => lifecycle.withdraw()}
        onWithdraw={() => lifecycle.withdraw()}
      />
    </>
  )
}
