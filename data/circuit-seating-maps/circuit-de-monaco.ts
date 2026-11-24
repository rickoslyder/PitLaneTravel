import { pointFromPercent } from "@/data/circuit-seating-maps/percent"
import type {
  CircuitSeatingMapConfig,
  SeatingArt,
  SeatingPin,
  SeatingPinPoint
} from "@/data/circuit-seating-maps/types"
import { slugify } from "@/lib/series"

/**
 * Circuit de Monaco seating locator.
 *
 * Centres are measured percentages of the pin-free artwork. Desktop and
 * mobile are both north-up. K and L also match the earlier guide headings.
 */

const DESKTOP: SeatingArt = {
  svg: "/images/maps/circuit-de-monaco-seating-desktop.svg",
  png: "/images/maps/circuit-de-monaco-seating-desktop.png",
  webp: "/images/maps/circuit-de-monaco-seating-desktop.webp",
  width: 1200,
  height: 632
}

const MOBILE: SeatingArt = {
  svg: "/images/maps/circuit-de-monaco-seating-375.svg",
  png: "/images/maps/circuit-de-monaco-seating-375.png",
  webp: "/images/maps/circuit-de-monaco-seating-375.webp",
  width: 375,
  height: 219
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
  mobile: [number, number],
  stable?: { slug: string; alsoNames: readonly string[] }
): SeatingPin {
  return {
    slug: stable?.slug ?? slugify(grandstandName),
    grandstandName,
    alsoNames: stable?.alsoNames,
    label,
    detail,
    ...at(desktop, mobile)
  }
}

export const monacoSeatingMap: CircuitSeatingMapConfig = {
  circuitSlug: "circuit-de-monaco",
  alt: "North-up simplified Circuit de Monaco locator with area markers for grandstands A at Sainte-Dévote, B at Casino, K on the harbour start straight, L at the Swimming Pool and T near Rascasse.",
  loading: "eager",
  art: { mobile: MOBILE, desktop: DESKTOP },
  markers: "overlay",
  note: "North-up area locator. Markers sit on the grandstand areas, not on individual seats. K is the Quai Albert 1er block on the harbour side of the start straight. L is at the Swimming Pool (Piscine Rainier III), not the Nouvelle Chicane. Not a seat view, shade or access map.",
  expandLabel: "Expand seating map",
  title: "Circuit de Monaco seating locator",
  dialogDescription: "Full seating locator with its key.",
  keyTitle: "Seating key",
  pins: [
    pin(
      "Grandstand A (Sainte-Dévote / Pit straight)",
      "A",
      "Sainte-Dévote",
      [30.82, 19.94],
      [31.07, 18.78]
    ),
    pin(
      "Grandstand B (Casino Square)",
      "B",
      "Casino Square",
      [70.76, 31.64],
      [70.5, 29.2]
    ),
    pin(
      "Grandstand K (Quai Albert 1er)",
      "K",
      "Quai Albert 1er, start straight",
      [24.61, 29.92],
      [24.94, 27.67],
      {
        slug: "grandstand-k-tabac-port-hercule",
        alsoNames: ["Grandstand K (Tabac / Port Hercule)"]
      }
    ),
    pin(
      "Grandstand L (Swimming Pool)",
      "L",
      "Swimming Pool",
      [16.64, 50.58],
      [17.06, 46.06],
      {
        slug: "grandstand-l-nouvelle-chicane",
        alsoNames: ["Grandstand L (Nouvelle Chicane)"]
      }
    ),
    pin(
      "Grandstand T (Pool exit / Rascasse)",
      "T",
      "Pool exit and Rascasse",
      [14.46, 64.18],
      [14.91, 58.17]
    )
  ]
}
