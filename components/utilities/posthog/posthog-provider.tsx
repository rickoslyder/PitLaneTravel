"use client"

// The React provider used to import posthog-js into the root layout's client
// graph, so the library was a <script> in the initial head. Nothing on the
// page calls usePostHog. Vendor code loads posthog-js itself after consent.
export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return children
}
