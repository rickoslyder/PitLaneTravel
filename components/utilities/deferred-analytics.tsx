"use client"

import dynamic from "next/dynamic"

// Loaded after hydration so posthog-js and the toaster are not <script> tags
// in the initial head. Lantern treats every script that finishes before the
// h1 paint as work that paint waited on.
export const PostHogPageview = dynamic(
  () =>
    import("@/components/utilities/posthog/posthog-pageview").then(
      mod => mod.PostHogPageview
    ),
  { ssr: false }
)

export const PostHogUserIdentify = dynamic(
  () =>
    import("@/components/utilities/posthog/posthog-user-identity").then(
      mod => mod.PostHogUserIdentify
    ),
  { ssr: false }
)

export const Toaster = dynamic(
  () => import("@/components/ui/toaster").then(mod => mod.Toaster),
  { ssr: false }
)
