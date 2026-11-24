import { slugify } from "@/lib/series"
import type {
  CircuitSeatingMapConfig,
  SeatingPin
} from "@/data/circuit-seating-maps/types"

/**
 * Yas Marina seating locator.
 *
 * Pin pixels are the numbered circle centres on the published seating
 * artwork (1 Main, 2 West, 3 North, 4 South, 5 Marina, 6 Abu Dhabi Hill).
 * `grandstandName` is the guide name in `data/seeds/grandstands.json`.
 */

const DESKTOP = {
  svg: "/images/maps/yas-marina-seating-desktop.svg",
  png: "/images/maps/yas-marina-seating-desktop.png",
  webp: "/images/maps/yas-marina-seating-desktop.webp",
  width: 1200,
  height: 960
} as const

const MOBILE = {
  svg: "/images/maps/yas-marina-seating-375.svg",
  png: "/images/maps/yas-marina-seating-375.png",
  webp: "/images/maps/yas-marina-seating-375.webp",
  width: 375,
  height: 1045
} as const

function pin(
  grandstandName: string,
  label: string,
  detail: string,
  desktop: SeatingPin["desktop"],
  mobile: SeatingPin["mobile"]
): SeatingPin {
  return {
    slug: slugify(grandstandName),
    grandstandName,
    label,
    detail,
    desktop,
    mobile
  }
}

export const yasMarinaSeatingMap: CircuitSeatingMapConfig = {
  circuitSlug: "yas-marina-circuit",
  alt: "North-up Yas Marina Circuit locator with Main, West, North, South and Marina grandstands and an approximate Abu Dhabi Hill point, numbered to a six-area key.",
  locatorId: "yas-marina-seating",
  loading: "eager",
  art: { mobile: MOBILE, desktop: DESKTOP },
  caption: "yas-marina-seating",
  expandLabel: "Expand seating map",
  title: "Yas Marina seating locator",
  dialogDescription:
    "Full seating locator with its legend, key, and source links.",
  keyTitle: "Seating key",
  pins: [
    pin(
      "Main Grandstand (start/finish, pits & podium)",
      "Main",
      "Start / finish",
      { x: 394.9, y: 515.43 },
      { x: 187.43, y: 393.84 }
    ),
    pin(
      "West Grandstand (Turn 6)",
      "West",
      "Turns 6–7",
      { x: 267.11, y: 577.11 },
      { x: 91.48, y: 440.15 }
    ),
    pin(
      "North Grandstand (Turn 5 hairpin)",
      "North",
      "Turn 5",
      { x: 390.06, y: 221.19 },
      { x: 183.79, y: 172.93 }
    ),
    pin(
      "South Grandstand (Turn 9)",
      "South",
      "Turn 9",
      { x: 483.59, y: 772.07 },
      { x: 254.01, y: 586.51 }
    ),
    pin(
      "Marina Grandstand (Turns 8-9 / marina section)",
      "Marina",
      "Support-pit building",
      { x: 379.29, y: 713.88 },
      { x: 175.7, y: 542.83 }
    ),
    pin(
      "Abu Dhabi Hill (General Admission)",
      "Abu Dhabi Hill",
      "Approximate area, not an entrance",
      { x: 369, y: 436.08 },
      { x: 167.98, y: 334.27 }
    )
  ]
}
