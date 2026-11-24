import type { SeatingPin } from "@/data/circuit-seating-maps/types"

export type SeatingGrandstandRef = {
  slug: string
  name: string
}

export function grandstandAnchorId(slug: string): string {
  return `grandstand-${slug}`
}

/** Pin centre as a percentage of the artwork, for CSS `left` / `top`. */
export function pinPercent(pixel: number, size: number): string {
  if (size <= 0) return "0%"
  return `${((pixel / size) * 100).toFixed(4)}%`
}

type PinIdentity = Pick<
  SeatingPin,
  "slug" | "label" | "grandstandName" | "alsoNames"
>

function sameStand(
  pin: PinIdentity,
  grandstand: SeatingGrandstandRef
): boolean {
  return (
    grandstand.slug === pin.slug ||
    grandstand.name === pin.grandstandName ||
    grandstand.name === pin.label ||
    (pin.alsoNames?.includes(grandstand.name) ?? false)
  )
}

export function pinMatchesGrandstand(
  pin: PinIdentity,
  grandstand: SeatingGrandstandRef
): boolean {
  return sameStand(pin, grandstand)
}

export function resolvePinGrandstand(
  pin: PinIdentity,
  grandstands: readonly SeatingGrandstandRef[]
): SeatingGrandstandRef | null {
  return grandstands.find(grandstand => sameStand(pin, grandstand)) ?? null
}

/** Slug to mark active: the stand on this page, or the pin slug when none matches. */
export function activeSlugForPin(
  pin: PinIdentity,
  grandstands: readonly SeatingGrandstandRef[]
): string {
  return resolvePinGrandstand(pin, grandstands)?.slug ?? pin.slug
}

export function isPinActive(
  pin: PinIdentity,
  activeSlug: string | null,
  grandstands: readonly SeatingGrandstandRef[]
): boolean {
  if (!activeSlug) return false
  const active = grandstands.find(grandstand => grandstand.slug === activeSlug)
  if (!active) return pin.slug === activeSlug
  return pinMatchesGrandstand(pin, active)
}

export function hasTrackMapUrl(
  trackMapUrl: string | null | undefined
): trackMapUrl is string {
  return Boolean(trackMapUrl?.trim())
}

export function showCircuitSeatingMap(input: {
  map: unknown
  trackMapUrl?: string | null
}): boolean {
  if (input.map) return true
  return hasTrackMapUrl(input.trackMapUrl)
}

/** Honest caption for an official circuit diagram with no stand markers. */
export function circuitMapCaption(circuitName: string): string {
  return `Circuit map of ${circuitName}. This shows the circuit layout, not a seating map.`
}

export function circuitMapAlt(circuitName: string): string {
  return `Circuit map of ${circuitName}`
}

export function circuitMapEmptyCopy(circuitName: string): string {
  return `No circuit map for ${circuitName}.`
}
