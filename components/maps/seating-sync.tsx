"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react"
import { grandstandAnchorId } from "@/data/circuit-seating-maps/match"
import { cn } from "@/lib/utils"

type SeatingSyncValue = {
  activeSlug: string | null
  setHoverSlug: (slug: string | null) => void
  selectSlug: (slug: string) => void
}

const SeatingSyncContext = createContext<SeatingSyncValue | null>(null)

export function useSeatingSync(): SeatingSyncValue | null {
  return useContext(SeatingSyncContext)
}

export function focusGrandstand(slug: string) {
  const node = document.getElementById(grandstandAnchorId(slug))
  if (!node) return
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  node.scrollIntoView({
    behavior: reduce ? "auto" : "smooth",
    block: "start"
  })
  node.focus({ preventScroll: true })
}

export function SeatingSyncProvider({ children }: { children: ReactNode }) {
  const [hoverSlug, setHoverSlug] = useState<string | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const activeSlug = hoverSlug ?? selectedSlug
  const selectSlug = useCallback((slug: string) => {
    setSelectedSlug(slug)
    setHoverSlug(slug)
  }, [])
  const value = useMemo(
    () => ({ activeSlug, setHoverSlug, selectSlug }),
    [activeSlug, selectSlug]
  )

  return (
    <SeatingSyncContext.Provider value={value}>
      {children}
    </SeatingSyncContext.Provider>
  )
}

export function GrandstandCardFrame({
  slug,
  children
}: {
  slug: string
  children: ReactNode
}) {
  const sync = useSeatingSync()
  const active = sync?.activeSlug === slug

  return (
    <div
      id={grandstandAnchorId(slug)}
      data-grandstand-slug={slug}
      data-active={active ? "true" : "false"}
      tabIndex={-1}
      onPointerEnter={event => {
        if (event.pointerType === "touch") return
        sync?.setHoverSlug(slug)
      }}
      onPointerLeave={event => {
        if (event.pointerType === "touch") return
        sync?.setHoverSlug(null)
      }}
      onFocus={() => sync?.setHoverSlug(slug)}
      onBlur={event => {
        const next = event.relatedTarget
        if (next instanceof HTMLElement && next.dataset.seatingPin) return
        sync?.setHoverSlug(null)
      }}
      className={cn(
        "relative h-full scroll-mt-24 rounded-lg outline-none",
        active &&
          "after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-lg after:ring-2 after:ring-inset after:ring-[#e10600] after:content-['']"
      )}
    >
      {children}
    </div>
  )
}
