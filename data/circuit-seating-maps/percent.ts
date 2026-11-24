import type { SeatingPinPoint } from "@/data/circuit-seating-maps/types"

/** Measured percentage of the artwork, origin top-left, as pixels. */
export function pointFromPercent(
  xPercent: number,
  yPercent: number,
  width: number,
  height: number
): SeatingPinPoint {
  return {
    x: (xPercent / 100) * width,
    y: (yPercent / 100) * height
  }
}
