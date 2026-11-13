"use client"

import React, { useState } from "react"
import {
  useAnalyticsConsent,
  type AnalyticsConsentStatus
} from "@/lib/analytics-consent"

const actionClassName =
  "inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-md border border-zinc-900 bg-zinc-900 px-1.5 py-2 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white sm:w-44 sm:px-3 sm:text-sm"

const settingsClassName =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-900 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"

export type ConsentBannerViewProps = {
  status: AnalyticsConsentStatus
  settingsOpen: boolean
  onAccept: () => void
  onReject: () => void
  onWithdraw: () => void
  onOpenSettings: () => void
  onCloseSettings: () => void
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

  return (
    <>
      {showFirstVisit ? (
        <section
          role="region"
          aria-labelledby="analytics-consent-heading"
          data-analytics-consent-bar=""
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-zinc-300 bg-white text-zinc-900 shadow-[0_-6px_20px_rgba(28,25,22,0.16)]"
        >
          <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:gap-4 sm:px-4 sm:py-2.5">
            <div className="min-w-0 flex-1">
              <h2
                id="analytics-consent-heading"
                className="inline text-sm font-semibold leading-5 text-zinc-900"
              >
                Usage analytics
              </h2>{" "}
              <p
                id="analytics-consent-description"
                className="inline text-xs leading-4 text-zinc-800 sm:text-sm sm:leading-5"
              >
                PitLane Travel can use nonessential usage analytics from
                PostHog, Google, Microsoft Clarity, and Vercel Speed Insights to
                understand how the site is used. Essential features still work
                if you reject.
              </p>
            </div>
            <div className="flex w-44 shrink-0 flex-col gap-1.5 sm:w-auto sm:flex-row sm:gap-2">
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
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-end gap-3 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {settingsOpen ? (
            <section
              id="analytics-privacy-settings"
              aria-labelledby="analytics-privacy-settings-heading"
              className="pointer-events-auto w-full max-w-full rounded-lg border border-zinc-200 bg-white p-4 shadow-lg sm:max-w-md"
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
                {status === "granted" ? "are on." : "are off."}
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
            className={`${settingsClassName} pointer-events-auto`}
            aria-expanded={settingsOpen}
            aria-controls="analytics-privacy-settings"
            onClick={settingsOpen ? onCloseSettings : onOpenSettings}
          >
            Privacy settings
          </button>
        </div>
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
