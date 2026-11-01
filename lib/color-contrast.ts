/**
 * WCAG 2.x relative luminance and contrast.
 * Ratios are for normal text (AA 4.5:1). Large text is not assumed.
 */

const INK = "#1c1916"
const WHITE = "#ffffff"

function channel(value: number): number {
  const srgb = value / 255
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
}

export function normalizeHex(hex: string): string {
  const raw = hex.trim().replace("#", "")
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) {
    throw new Error(`Expected a 6-digit hex colour, received "${hex}"`)
  }
  return `#${raw.toLowerCase()}`
}

export function relativeLuminance(hex: string): number {
  const normalized = normalizeHex(hex).slice(1)
  const red = parseInt(normalized.slice(0, 2), 16)
  const green = parseInt(normalized.slice(2, 4), 16)
  const blue = parseInt(normalized.slice(4, 6), 16)
  return (
    0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
  )
}

/** Contrast of `foreground` drawn on `background`. Order does not matter. */
export function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(
    relativeLuminance(foreground),
    relativeLuminance(background)
  )
  const darker = Math.min(
    relativeLuminance(foreground),
    relativeLuminance(background)
  )
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Series-badge text. White when it clears AA on the series colour, otherwise
 * the editorial ink. Formula E cyan fails with white and passes with ink.
 */
export function readableTextOn(background: string): string {
  if (contrastRatio(WHITE, background) >= 4.5) return WHITE
  return INK
}
