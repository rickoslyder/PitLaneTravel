"use client"

import { forwardRef, useCallback, useRef } from "react"
import { publishLiveMessage } from "@/lib/scroll-signals"

export const Announcer = forwardRef<HTMLDivElement>(
  function Announcer(props, ref) {
    return (
      <div
        {...props}
        ref={ref}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-scroll-announcer=""
      />
    )
  }
)

export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<string | null>(null)

  const announce = useCallback((message: string) => {
    const node = announcerRef.current
    if (!node) return
    lastMessageRef.current = publishLiveMessage(
      node,
      lastMessageRef.current,
      message
    )
  }, [])

  return { announce, announcerRef, Announcer }
}
