"use client"

import React, { useEffect, useLayoutEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  useAnalyticsConsent,
  type AnalyticsConsentStatus
} from "@/lib/analytics-consent"

const actionClassName =
  "inline-flex min-h-8 w-full items-center justify-center whitespace-nowrap rounded-md border border-foreground bg-foreground px-1.5 py-1 text-xs font-medium text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-background sm:w-44 sm:px-3 sm:text-sm"

const settingsClassName =
  "inline-flex min-h-6 items-center rounded-md py-1 text-sm font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"

const linkClassName =
  "inline-block min-h-6 font-medium text-foreground underline underline-offset-2"

const useClientLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect

export type ConsentBannerViewProps = {
  status: AnalyticsConsentStatus
  settingsOpen: boolean
  onAccept: () => void
  onReject: () => void
  onWithdraw: () => void
  onOpenSettings: () => void
  onCloseSettings: () => void
}

function privacySettingsTarget(): HTMLElement | null {
  const slots = document.querySelectorAll<HTMLElement>(
    "[data-privacy-settings-slot]"
  )
  for (const slot of slots) {
    if (slot.isConnected) return slot
  }
  return document.querySelector<HTMLElement>("[data-privacy-settings-fallback]")
}

function PrivacySettingsDock({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null)

  useClientLayoutEffect(() => {
    const apply = () => {
      const next = privacySettingsTarget()
      setTarget(current => (current === next ? current : next))
    }
    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  if (target?.isConnected) return createPortal(children, target)
  return <div hidden>{children}</div>
}

export function ConsentBannerView({
  status,
  settingsOpen,
  onAccept,
  onReject,
  onWithdraw,
  onOpenSettings,
  onCloseSettings
}: ConsentBannerViewProps) {
  const showFirstVisit = status === "undecided"
  const showSettingsButton = status !== "undecided"

  useEffect(() => {
    if (!showFirstVisit) {
      document.documentElement.style.removeProperty("--consent-bar-height")
      return
    }

    const bar = document.querySelector("[data-analytics-consent-bar]")
    if (!(bar instanceof HTMLElement)) return

    const apply = () => {
      document.documentElement.style.setProperty(
        "--consent-bar-height",
        `${Math.ceil(bar.getBoundingClientRect().height)}px`
      )
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(bar)
    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty("--consent-bar-height")
    }
  }, [showFirstVisit])

  return (
    <>
      {showFirstVisit ? (
        <section
          role="region"
          aria-labelledby="analytics-consent-heading"
          data-analytics-consent-bar=""
          className="border-brand bg-background text-foreground fixed inset-x-0 bottom-0 z-[60] border-t shadow-[0_-4px_16px_rgba(28,25,22,0.12)] sm:left-auto sm:w-[min(32rem,calc(100%-1rem))] sm:rounded-tl-lg sm:border-l"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-0.5 px-2 pb-[max(0.125rem,env(safe-area-inset-bottom))] pt-0.5 sm:max-w-none sm:px-3 sm:py-2">
            <div
              data-analytics-consent-copy=""
              className="text-foreground min-w-0 text-xs leading-4 sm:flex-1 sm:text-sm sm:leading-5"
            >
              {[
                <h2
                  key="heading"
                  id="analytics-consent-heading"
                  className="text-foreground inline text-xs font-semibold leading-4 sm:text-sm sm:leading-5"
                >
                  Usage analytics
                </h2>,
                <p
                  key="description"
                  id="analytics-consent-description"
                  className="inline"
                >
                  {". We use optional analytics. "}
                  <a href="/privacy" className={linkClassName}>
                    Privacy policy
                  </a>
                </p>
              ]}
            </div>
            <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-1.5 sm:flex sm:w-auto sm:gap-2">
              <details className="min-w-0 open:col-span-3">
                <summary className="text-foreground inline-flex min-h-8 cursor-pointer items-center px-1 text-xs font-medium sm:px-2 sm:text-sm">
                  Details
                </summary>
                <p className="text-foreground mt-1 max-w-xl text-xs leading-4 sm:text-sm sm:leading-5">
                  We use optional analytics to improve the site. These are
                  nonessential usage analytics from PostHog, Google, Microsoft
                  Clarity, and Vercel Speed Insights. Essential features still
                  work if you reject.
                </p>
              </details>
              <button
                type="button"
                className={actionClassName}
                onClick={onAccept}
              >
                Accept analytics
              </button>
              <button
                type="button"
                className={actionClassName}
                onClick={onReject}
              >
                Reject non-essential
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {showSettingsButton ? (
        <PrivacySettingsDock>
          <div className="flex w-full max-w-md flex-col items-start gap-3">
            {settingsOpen ? (
              <section
                id="analytics-privacy-settings"
                aria-labelledby="analytics-privacy-settings-heading"
                className="border-border bg-background text-foreground w-full rounded-lg border p-4 shadow-lg"
              >
                <h2
                  id="analytics-privacy-settings-heading"
                  className="text-foreground text-base font-semibold"
                >
                  Privacy settings
                </h2>
                <p className="text-foreground mt-2 text-sm leading-6">
                  These nonessential usage analytics from PostHog, Google,
                  Microsoft Clarity, and Vercel Speed Insights{" "}
                  {status === "granted" ? "are on." : "are off."}{" "}
                  <a href="/privacy" className={linkClassName}>
                    Privacy policy
                  </a>
                </p>
                <div className="mt-4 flex w-full max-w-full flex-col gap-3 sm:flex-row">
                  {status === "granted" ? (
                    <button
                      type="button"
                      className={actionClassName}
                      onClick={onWithdraw}
                    >
                      Withdraw analytics consent
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={actionClassName}
                      onClick={onAccept}
                    >
                      Accept analytics
                    </button>
                  )}
                </div>
              </section>
            ) : null}
            <button
              type="button"
              className={settingsClassName}
              data-privacy-settings=""
              aria-expanded={settingsOpen}
              aria-controls="analytics-privacy-settings"
              onClick={settingsOpen ? onCloseSettings : onOpenSettings}
            >
              Privacy settings
            </button>
          </div>
        </PrivacySettingsDock>
      ) : null}
    </>
  )
}

export function ConsentBanner({
  onAccept,
  onReject,
  onWithdraw
}: {
  onAccept: () => void
  onReject: () => void
  onWithdraw: () => void
}) {
  const status = useAnalyticsConsent()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <ConsentBannerView
      status={status}
      settingsOpen={settingsOpen}
      onAccept={() => {
        onAccept()
        setSettingsOpen(false)
      }}
      onReject={() => {
        onReject()
        setSettingsOpen(false)
      }}
      onWithdraw={() => {
        onWithdraw()
        setSettingsOpen(false)
      }}
      onOpenSettings={() => setSettingsOpen(true)}
      onCloseSettings={() => setSettingsOpen(false)}
    />
  )
}
