"use client"

import { useEffect, useRef } from "react"

export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement>(null)

  const announce = (message: string, assertive = false) => {
    if (announcerRef.current) {
      // Clear previous announcement
      announcerRef.current.textContent = ""

      // Force a DOM reflow
      void announcerRef.current.offsetWidth

      // Set new announcement
      announcerRef.current.textContent = message
    }
  }

  return {
    announce,
    Announcer: () => (
      <div
        ref={announcerRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    )
  }
}
