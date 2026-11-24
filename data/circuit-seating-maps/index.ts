import { yasMarinaSeatingMap } from "@/data/circuit-seating-maps/yas-marina-circuit"
import type { CircuitSeatingMapConfig } from "@/data/circuit-seating-maps/types"

/**
 * Prepared seating maps, keyed by circuit slug.
 *
 * To add a circuit:
 * 1. Measure pin positions on an existing map image. Do not guess coordinates
 *    and do not draw a new map here.
 * 2. Add `data/circuit-seating-maps/<circuit-slug>.ts` exporting a
 *    `CircuitSeatingMapConfig`.
 * 3. Register that export in `SEATING_MAPS` below.
 *
 * Circuits that are absent here, but have `circuits.trackMapUrl`, still render
 * `CircuitSeatingMap` with that image and no pins.
 */
const SEATING_MAPS: Record<string, CircuitSeatingMapConfig> = {
  [yasMarinaSeatingMap.circuitSlug]: yasMarinaSeatingMap
}

export function getCircuitSeatingMap(
  circuitSlug: string
): CircuitSeatingMapConfig | null {
  return SEATING_MAPS[circuitSlug] ?? null
}

export function listCircuitSeatingMaps(): CircuitSeatingMapConfig[] {
  return Object.values(SEATING_MAPS)
}
