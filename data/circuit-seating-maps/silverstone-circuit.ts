import { pointFromPercent } from "@/data/circuit-seating-maps/percent"
import type {
  CircuitSeatingMapConfig,
  SeatingArt,
  SeatingPin,
  SeatingPinPoint
} from "@/data/circuit-seating-maps/types"
import { slugify } from "@/lib/series"

/**
 * Silverstone seating locator.
 *
 * Centres are measured percentages of the pin-free artwork. The Landostand
 * is the Stowe area on that artwork and has no numbered point: the 2025
 * plan shows it as blocks A to D.
 */

const DESKTOP: SeatingArt = {
  svg: "/images/maps/silverstone-seating-desktop.svg",
  png: "/images/maps/silverstone-seating-desktop.png",
  webp: "/images/maps/silverstone-seating-desktop.webp",
  width: 1200,
  height: 838
}

const MOBILE: SeatingArt = {
  svg: "/images/maps/silverstone-seating-375.svg",
  png: "/images/maps/silverstone-seating-375.png",
  webp: "/images/maps/silverstone-seating-375.webp",
  width: 375,
  height: 283
}

function at(
  desktop: [number, number],
  mobile: [number, number]
): {
  desktop: SeatingPinPoint
  mobile: SeatingPinPoint
} {
  return {
    desktop: pointFromPercent(
      desktop[0],
      desktop[1],
      DESKTOP.width,
      DESKTOP.height
    ),
    mobile: pointFromPercent(mobile[0], mobile[1], MOBILE.width, MOBILE.height)
  }
}

function pin(
  grandstandName: string,
  label: string,
  detail: string,
  desktop: [number, number],
  mobile: [number, number]
): SeatingPin {
  return {
    slug: slugify(grandstandName),
    grandstandName,
    label,
    detail,
    ...at(desktop, mobile)
  }
}

export const silverstoneSeatingMap: CircuitSeatingMapConfig = {
  circuitSlug: "silverstone-circuit",
  alt: "Silverstone Circuit locator based on the 2025 layout, with area markers for Abbey, Copse, Becketts and Club Corner. The Landostand is the Stowe area and is not numbered.",
  loading: "eager",
  art: { mobile: MOBILE, desktop: DESKTOP },
  markers: "overlay",
  note: "Based on the 2025 official layout. Numbers mark guide areas, not the circuit's own stand numbers. Abbey, Copse, Becketts and Club Corner are area markers. The Landostand is the Stowe area: that plan shows blocks A to D, so it has no single numbered point. Not a seat view, shade or access map.",
  expandLabel: "Expand seating map",
  title: "Silverstone seating locator",
  dialogDescription: "Full seating locator with its key.",
  keyTitle: "Seating key",
  pins: [
    pin("Abbey (A/B)", "1", "Abbey A/B", [52.72, 69.92], [52.68, 64.78]),
    pin("Copse (A/B/C)", "2", "Copse A/B/C", [8.13, 20.2], [8.61, 19.29]),
    pin(
      "Becketts",
      "3",
      "Maggots and Becketts",
      [44.06, 10.52],
      [44.13, 10.44]
    ),
    pin(
      "Club Corner (B/C)",
      "4",
      "Club Corner B/C",
      [72.43, 85.6],
      [72.18, 79.12]
    )
  ]
}
