"use client"

import { useRef, type CSSProperties, type KeyboardEvent } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  LocatorAreaKey,
  LocatorInlineArt,
  locatorLinkClass,
  seatingKeyTitleClass
} from "@/components/maps/locator-frame"
import { YasMarinaSeatingDetails } from "@/components/maps/yas-marina-seating-caption"
import { focusGrandstand, useSeatingSync } from "@/components/maps/seating-sync"
import {
  activeSlugForPin,
  circuitMapAlt,
  circuitMapCaption,
  circuitMapEmptyCopy,
  grandstandAnchorId,
  hasTrackMapUrl,
  isPinActive,
  pinPercent,
  resolvePinGrandstand,
  type SeatingGrandstandRef
} from "@/data/circuit-seating-maps/match"
import type {
  CircuitSeatingMapConfig,
  SeatingCredit,
  SeatingPin
} from "@/data/circuit-seating-maps/types"

export type { SeatingGrandstandRef }

export type CircuitSeatingMapProps = {
  circuitName: string
  circuitSlug: string
  map?: CircuitSeatingMapConfig | null
  trackMapUrl?: string | null
  grandstands: readonly SeatingGrandstandRef[]
}

function keyItems(map: CircuitSeatingMapConfig) {
  return map.pins.map(pin => ({ name: pin.label, detail: pin.detail }))
}

function aspectClass(map: CircuitSeatingMapConfig): string {
  const { desktop, mobile } = map.art
  // Literals so Tailwind emits the rules. Other sizes use the scoped style.
  if (
    desktop.width === 1200 &&
    desktop.height === 960 &&
    mobile.width === 375 &&
    mobile.height === 1045
  ) {
    return "aspect-[1200/960] max-sm:aspect-[375/1045]"
  }
  return ""
}

function artAspectStyle(map: CircuitSeatingMapConfig): string {
  const { desktop, mobile } = map.art
  const hook = `[data-circuit-seating-map="${map.circuitSlug}"] img[data-locator-art="inline"]`
  return `${hook}{aspect-ratio:${desktop.width}/${desktop.height}}@media (max-width:639px){${hook}{aspect-ratio:${mobile.width}/${mobile.height}}}`
}

function pinLabel(pin: SeatingPin, index: number, overlay: boolean): string {
  if (overlay) return `${pin.label}, ${pin.detail}`
  return `${index + 1}, ${pin.label}, ${pin.detail}`
}

function SeatingCreditLine({ credit }: { credit: SeatingCredit }) {
  return (
    <p>
      {credit.before}
      <a className={locatorLinkClass} href={credit.href}>
        {credit.label}
      </a>
      {credit.after ?? ""}
    </p>
  )
}

function MapDetails({ map }: { map: CircuitSeatingMapConfig }) {
  const items = keyItems(map)
  if (map.caption === "yas-marina-seating") {
    return <YasMarinaSeatingDetails items={items} />
  }
  return (
    <>
      {map.note ? <p>{map.note}</p> : null}
      {map.credit ? <SeatingCreditLine credit={map.credit} /> : null}
      <LocatorAreaKey
        title={map.keyTitle ?? "Grandstands"}
        items={items}
        titleClassName={seatingKeyTitleClass}
      />
    </>
  )
}

function SeatingPins({
  map,
  grandstands
}: {
  map: CircuitSeatingMapConfig
  grandstands: readonly SeatingGrandstandRef[]
}) {
  const sync = useSeatingSync()
  const groupRef = useRef<HTMLDivElement>(null)
  const overlay = map.markers === "overlay"
  if (map.pins.length === 0) return null

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const key = event.key
    const buttons = [
      ...(groupRef.current?.querySelectorAll<HTMLButtonElement>(
        "button[data-seating-pin]"
      ) ?? [])
    ]
    const last = buttons.length - 1
    if (last < 0) return
    const enabled = (candidate: number) => !buttons[candidate]?.disabled
    let next = -1
    if (key === "Home" || key === "End") {
      const step = key === "Home" ? 1 : -1
      const start = key === "Home" ? 0 : last
      for (let cursor = start; cursor >= 0 && cursor <= last; cursor += step) {
        if (enabled(cursor)) {
          next = cursor
          break
        }
      }
    } else if (
      key === "ArrowRight" ||
      key === "ArrowDown" ||
      key === "ArrowLeft" ||
      key === "ArrowUp"
    ) {
      const step = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1
      for (let hop = 1; hop <= buttons.length; hop += 1) {
        const candidate = (index + step * hop + buttons.length) % buttons.length
        if (enabled(candidate)) {
          next = candidate
          break
        }
      }
    } else return
    if (next < 0) return
    event.preventDefault()
    buttons[next]?.focus()
  }

  return (
    <div
      ref={groupRef}
      role="group"
      aria-label="Grandstand locations"
      className="pointer-events-none absolute inset-0"
    >
      <p className="sr-only">
        Choose a grandstand on the map to jump to its guide. Arrow keys move
        between grandstands.
      </p>
      {map.pins.map((pin, index) => {
        const match = resolvePinGrandstand(pin, grandstands)
        const navigable = match != null
        const slug = match?.slug ?? activeSlugForPin(pin, grandstands)
        const active =
          navigable && isPinActive(pin, sync?.activeSlug ?? null, grandstands)
        const style = {
          "--pin-x": pinPercent(pin.desktop.x, map.art.desktop.width),
          "--pin-y": pinPercent(pin.desktop.y, map.art.desktop.height),
          "--pin-x-mobile": pinPercent(pin.mobile.x, map.art.mobile.width),
          "--pin-y-mobile": pinPercent(pin.mobile.y, map.art.mobile.height),
          "--pin-d": "2.8333%",
          "--pin-d-mobile": "6.4%"
        } as CSSProperties

        return (
          <button
            key={pin.slug}
            type="button"
            id={`seating-pin-${map.circuitSlug}-${pin.slug}`}
            data-seating-pin={pin.slug}
            data-active={active ? "true" : "false"}
            aria-label={pinLabel(pin, index, overlay)}
            aria-controls={navigable ? grandstandAnchorId(slug) : undefined}
            aria-current={active ? "true" : undefined}
            disabled={!navigable}
            style={style}
            onPointerEnter={event => {
              if (!navigable || event.pointerType === "touch") return
              sync?.setHoverSlug(slug)
            }}
            onPointerLeave={event => {
              if (event.pointerType === "touch") return
              sync?.setHoverSlug(null)
            }}
            onFocus={() => sync?.setHoverSlug(slug)}
            onBlur={event => {
              const next = event.relatedTarget
              if (
                next instanceof HTMLElement &&
                next.dataset.grandstandSlug === slug
              ) {
                return
              }
              sync?.setHoverSlug(null)
            }}
            onKeyDown={event => moveFocus(event, index)}
            onClick={() => {
              if (!navigable) return
              sync?.selectSlug(slug)
              focusGrandstand(slug)
            }}
            className={
              overlay
                ? "pointer-events-auto absolute left-[var(--pin-x)] top-[var(--pin-y)] flex aspect-square w-[var(--pin-d)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#b64a27] p-0 text-[10px] font-bold leading-none text-white ring-2 ring-[#f7f4eb] hover:ring-[#e10600] focus-visible:outline-none focus-visible:ring-[#e10600] disabled:pointer-events-none disabled:opacity-40 data-[active=true]:ring-[#e10600] max-sm:left-[var(--pin-x-mobile)] max-sm:top-[var(--pin-y-mobile)] max-sm:w-[var(--pin-d-mobile)] sm:text-[13px]"
                : "pointer-events-auto absolute left-[var(--pin-x)] top-[var(--pin-y)] size-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent p-0 hover:ring-2 hover:ring-inset hover:ring-[#e10600] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e10600] disabled:pointer-events-none disabled:opacity-40 data-[active=true]:ring-2 data-[active=true]:ring-inset data-[active=true]:ring-[#e10600] max-sm:left-[var(--pin-x-mobile)] max-sm:top-[var(--pin-y-mobile)]"
            }
          >
            {overlay ? pin.label : null}
          </button>
        )
      })}
    </div>
  )
}

function IllustratedMap({
  map,
  grandstands
}: {
  map: CircuitSeatingMapConfig
  grandstands: readonly SeatingGrandstandRef[]
}) {
  const desktop = map.art.desktop
  const expandLabel = map.expandLabel

  return (
    <figure
      data-locator={map.locatorId}
      data-circuit-seating-map={map.circuitSlug}
      data-seating-pins={String(map.pins.length)}
      className="my-6 max-w-full"
    >
      <style>{artAspectStyle(map)}</style>
      <div className="relative">
        <LocatorInlineArt
          mobile={map.art.mobile}
          desktop={desktop}
          alt={map.alt}
          loading={map.loading}
          aspectClass={aspectClass(map)}
        />
        <SeatingPins map={map} grandstands={grandstands} />
      </div>
      <figcaption className="text-muted-foreground mt-3 space-y-3 text-sm leading-relaxed">
        <MapDetails map={map} />
        {expandLabel ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                {expandLabel}
              </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[90vh] w-[min(calc(100%-2rem),1240px)] max-w-none flex-col gap-4 overflow-hidden">
              <DialogHeader className="shrink-0 pr-8">
                <DialogTitle>{map.title ?? expandLabel}</DialogTitle>
                <DialogDescription className="sr-only">
                  {map.dialogDescription ?? expandLabel}
                </DialogDescription>
              </DialogHeader>
              <div
                tabIndex={0}
                aria-label={expandLabel}
                data-locator-scroll=""
                className="min-h-0 flex-1 overflow-auto"
              >
                <img
                  src={desktop.svg}
                  alt={map.alt}
                  width={desktop.width}
                  height={desktop.height}
                  decoding="async"
                  data-locator-art="expanded"
                  style={{
                    width: desktop.width,
                    height: "auto",
                    maxWidth: "none"
                  }}
                />
                <div className="text-muted-foreground mt-4 space-y-3 text-sm leading-relaxed">
                  <MapDetails map={map} />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : null}
      </figcaption>
    </figure>
  )
}

function CircuitMapEmpty({
  circuitName,
  circuitSlug
}: {
  circuitName: string
  circuitSlug: string
}) {
  return (
    <figure
      data-circuit-seating-map={circuitSlug}
      data-circuit-map="empty"
      data-seating-pins="0"
      className="my-6 max-w-full"
    >
      <div className="bg-card rounded-lg border px-5 py-8">
        <p className="text-foreground text-sm font-medium">
          {circuitMapEmptyCopy(circuitName)}
        </p>
      </div>
    </figure>
  )
}

function TrackMapOnly({
  circuitName,
  circuitSlug,
  trackMapUrl,
  grandstands
}: {
  circuitName: string
  circuitSlug: string
  trackMapUrl: string
  grandstands: readonly SeatingGrandstandRef[]
}) {
  const sync = useSeatingSync()

  return (
    <figure
      data-circuit-seating-map={circuitSlug}
      data-circuit-map="circuit"
      data-seating-pins="0"
      className="my-6 max-w-full"
    >
      <div className="bg-card relative aspect-[16/9] w-full overflow-hidden rounded-lg border">
        <Image
          src={trackMapUrl}
          alt={circuitMapAlt(circuitName)}
          fill
          sizes="(max-width: 640px) 100vw, 76rem"
          className="object-contain"
        />
      </div>
      <figcaption className="text-muted-foreground mt-3 space-y-3 text-sm leading-relaxed">
        <p>{circuitMapCaption(circuitName)}</p>
        {grandstands.length > 0 ? (
          <div>
            <p className="text-foreground font-medium">Jump to a grandstand</p>
            <ul className="mt-2 space-y-1">
              {grandstands.map(grandstand => {
                const active = sync?.activeSlug === grandstand.slug
                return (
                  <li key={grandstand.slug}>
                    <button
                      type="button"
                      data-active={active ? "true" : "false"}
                      className={`text-foreground inline-flex min-h-11 items-center text-left font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e10600] ${active ? "underline" : ""}`}
                      onPointerEnter={event => {
                        if (event.pointerType === "touch") return
                        sync?.setHoverSlug(grandstand.slug)
                      }}
                      onPointerLeave={event => {
                        if (event.pointerType === "touch") return
                        sync?.setHoverSlug(null)
                      }}
                      onFocus={() => sync?.setHoverSlug(grandstand.slug)}
                      onBlur={() => sync?.setHoverSlug(null)}
                      onClick={() => {
                        sync?.selectSlug(grandstand.slug)
                        focusGrandstand(grandstand.slug)
                      }}
                    >
                      {grandstand.name}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </figcaption>
    </figure>
  )
}

export function CircuitSeatingMap({
  circuitName,
  circuitSlug,
  map,
  trackMapUrl,
  grandstands
}: CircuitSeatingMapProps) {
  if (map?.art) {
    return <IllustratedMap map={map} grandstands={grandstands} />
  }
  if (!hasTrackMapUrl(trackMapUrl)) {
    return (
      <CircuitMapEmpty circuitName={circuitName} circuitSlug={circuitSlug} />
    )
  }
  return (
    <TrackMapOnly
      circuitName={circuitName}
      circuitSlug={circuitSlug}
      trackMapUrl={trackMapUrl.trim()}
      grandstands={grandstands}
    />
  )
}
