"use client"

import React, { useState } from "react"
import {
  useAnalyticsConsent,
  type AnalyticsConsentStatus
} from "@/lib/analytics-consent"

const actionClassName =
  "inline-flex min-h-11 w-full min-w-0 flex-1 items-center justify-center rounded-md border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white"

const settingsClassName =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-900 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm"

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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] p-3 pb-20 sm:p-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        {showFirstVisit ? (
          <section
            aria-labelledby="analytics-consent-heading"
            className="pointer-events-auto w-full max-w-full rounded-lg border border-zinc-200 bg-white p-4 shadow-lg"
          >
            <h2
              id="analytics-consent-heading"
              className="text-base font-semibold text-zinc-900"
            >
              Usage analytics
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-700">
              PitLane Travel can use nonessential usage analytics from
              PostHog, Google, Microsoft Clarity, and Vercel Speed Insights to
              understand how the site is used. Essential features still work if
              you reject.
            </p>
            <div className="mt-4 flex w-full max-w-full flex-col gap-3 sm:flex-row">
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
          </section>
        ) : null}

        {showSettingsButton ? (
          <div className="flex w-full max-w-full flex-col items-stretch gap-3 sm:items-end">
            {settingsOpen ? (
              <section
                id="analytics-privacy-settings"
                aria-labelledby="analytics-privacy-settings-heading"
                className="pointer-events-auto w-full max-w-full rounded-lg border border-zinc-200 bg-white p-4 shadow-lg"
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
              className={`${settingsClassName} pointer-events-auto self-end`}
              aria-expanded={settingsOpen}
              aria-controls="analytics-privacy-settings"
              onClick={settingsOpen ? onCloseSettings : onOpenSettings}
            >
              Privacy settings
            </button>
          </div>
        ) : null}
      </div>
    </div>
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
