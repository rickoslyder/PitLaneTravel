import { pointFromPercent } from "@/data/circuit-seating-maps/percent"
import type {
  CircuitSeatingMapConfig,
  SeatingArt,
  SeatingPin,
  SeatingPinPoint
} from "@/data/circuit-seating-maps/types"
import { slugify } from "@/lib/series"

/**
 * Monza seating locator.
 *
 * Centres are measured percentages of the pin-free artwork. Grandstands 18
 * and 20 are separate stands on the 2026 plan and are not marked.
 */

const DESKTOP: SeatingArt = {
  svg: "/images/maps/monza-seating-desktop.svg",
  png: "/images/maps/monza-seating-desktop.png",
  webp: "/images/maps/monza-seating-desktop.webp",
  width: 1200,
  height: 848
}

const MOBILE: SeatingArt = {
  svg: "/images/maps/monza-seating-375.svg",
  png: "/images/maps/monza-seating-375.png",
  webp: "/images/maps/monza-seating-375.webp",
  width: 375,
  height: 286
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

export const monzaSeatingMap: CircuitSeatingMapConfig = {
  circuitSlug: "autodromo-nazionale-monza",
  alt: "Autodromo Nazionale Monza locator with area markers for grandstands 26, 6, 8 and 22. Grandstands 18 and 20 are separate and are not marked.",
  loading: "eager",
  art: { mobile: MOBILE, desktop: DESKTOP },
  markers: "overlay",
  note: "Area locator for four grandstands. 18 (Uscita Ascari A) and 20 (Rettilineo Parabolica Esterna) are separate stands on opposite sides of the track. The 2026 plan does not show a grandstand 19. 18 and 20 are not marked here. Not a seat view, shade or access map.",
  credit: {
    before: "Areas follow the ",
    href: "https://www.monzanet.it/wp-content/uploads/2026/06/GP_F1_2026_LISTINO_PREZZI_6_17.pdf",
    label: "Autodromo Nazionale Monza 2026 grandstand map",
    after: "."
  },
  expandLabel: "Expand seating map",
  title: "Monza seating locator",
  dialogDescription: "Full seating locator with its key and source.",
  keyTitle: "Seating key",
  pins: [
    pin(
      "Grandstand 26 (Laterale Destra)",
      "26",
      "Laterale Destra",
      [67.65, 84.98],
      [67.45, 78.62]
    ),
    pin(
      "Grandstand 6 (Alta Velocità)",
      "6",
      "Alta Velocità",
      [40.4, 69.26],
      [40.51, 64.23]
    ),
    pin(
      "Grandstand 8 (Prima Variante)",
      "8",
      "Prima Variante",
      [32.91, 78.35],
      [33.11, 72.55]
    ),
    pin(
      "Grandstand 22 (Parabolica)",
      "22",
      "Parabolica",
      [90.07, 63.5],
      [89.6, 58.95]
    )
  ]
}
