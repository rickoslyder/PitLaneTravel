"use client"

import React, { useEffect, useLayoutEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  useAnalyticsConsent,
  type AnalyticsConsentStatus
} from "@/lib/analytics-consent"

const actionClassName =
  "inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-md border border-zinc-900 bg-zinc-900 px-1.5 py-2 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white sm:w-44 sm:px-3 sm:text-sm"

const settingsClassName =
  "inline-flex min-h-6 items-center rounded-md py-1 text-sm font-medium text-zinc-900 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"

const linkClassName =
  "inline-block min-h-6 font-medium text-zinc-900 underline underline-offset-2"

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

function PrivacySettingsDock({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null)

  useClientLayoutEffect(() => {
    const slot = document.querySelector<HTMLElement>(
      "[data-privacy-settings-slot]"
    )
    const fallback = document.querySelector<HTMLElement>(
      "[data-privacy-settings-fallback]"
    )
    setTarget(slot ?? fallback)
  }, [])

  if (target) return createPortal(children, target)
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
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-zinc-300 bg-white text-zinc-900 shadow-[0_-6px_20px_rgba(28,25,22,0.16)]"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-2.5">
            <div
              data-analytics-consent-copy=""
              className="min-w-0 flex-1 text-xs leading-4 text-zinc-800 sm:text-sm sm:leading-5"
            >
              <h2
                id="analytics-consent-heading"
                className="inline text-sm font-semibold leading-5 text-zinc-900"
              >
                Usage analytics
              </h2>{" "}
              <p id="analytics-consent-description" className="inline">
                PitLane Travel can use nonessential usage analytics. Essential
                features still work if you reject.{" "}
                <a href="/privacy" className={linkClassName}>
                  Privacy policy
                </a>{" "}
              </p>
              <details className="inline">
                <summary className="inline-block min-h-6 cursor-pointer font-medium text-zinc-900">
                  Details
                </summary>
                <p className="mt-1">
                  Vendors: PostHog, Google, Microsoft Clarity, and Vercel Speed
                  Insights. Used to understand how the site is used.
                </p>
              </details>
            </div>
            <div className="grid w-full shrink-0 grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:gap-2">
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
                className="w-full rounded-lg border border-zinc-200 bg-white p-4 text-zinc-900 shadow-lg"
              >
                <h2
                  id="analytics-privacy-settings-heading"
                  className="text-base font-semibold text-zinc-900"
                >
                  Privacy settings
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-700">
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
