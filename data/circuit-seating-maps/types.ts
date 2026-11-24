/**
 * Per-circuit seating maps.
 *
 * Add a circuit by adding a file in this folder and registering it in
 * `index.ts`. One file, one circuit. The grandstand page reads the registry.
 *
 * A file needs:
 * - `circuitSlug`: `slugify(circuit.name)`, the same slug as
 *   `/circuits/[slug]/grandstands`.
 * - `art`: the map image. Desktop and mobile can be the same file when the
 *   crop does not change. Pixel size is the image's own width and height.
 * - `pins`: one entry per grandstand that has a measured position.
 *
 * Pin coordinates are pixels on that artwork, origin at the top left. They
 * must be measured on the image. Do not guess them. A circuit with no measured
 * pins does not get a file: the page shows `circuits.trackMapUrl` with no pins.
 *
 * `slug` is the grandstand slug (`grandstands.slug`). Database ids differ per
 * environment, so they are not stored here. A grandstand still matches when
 * its name equals `grandstandName` or the short `label` on the map key.
 */

export type SeatingArt = {
  svg: string
  png: string
  width: number
  height: number
}

export type SeatingPinPoint = {
  x: number
  y: number
}

export type SeatingPin = {
  /** `grandstands.slug` for this stand. */
  slug: string
  /** Full grandstand name in the seating guide. */
  grandstandName: string
  /** Short name printed on the map key. */
  label: string
  /** Short note printed beside that name. */
  detail: string
  /** Circle centre, in pixels, on `art.desktop`. */
  desktop: SeatingPinPoint
  /** Circle centre, in pixels, on `art.mobile`. */
  mobile: SeatingPinPoint
}

export type CircuitSeatingMapConfig = {
  circuitSlug: string
  alt: string
  /**
   * Existing locator hook kept for the Yas Marina page. Omit on a new circuit.
   */
  locatorId?: string
  loading: "eager" | "lazy"
  art: {
    mobile: SeatingArt
    desktop: SeatingArt
  }
  /** Prepared prose. Omit to use the generated key from `pins`. */
  caption?: "yas-marina-seating"
  expandLabel?: string
  title?: string
  dialogDescription?: string
  keyTitle?: string
  pins: SeatingPin[]
}
