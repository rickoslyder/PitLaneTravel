import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

function channel(hex: string): [number, number, number] {
  const value = hex.replace("#", "")
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16)
  ]
}

function linearize(channelValue: number): number {
  const srgb = channelValue / 255
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  const [r, g, b] = channel(hex).map(linearize)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(foreground: string, background: string): number {
  const lighter = Math.max(luminance(foreground), luminance(background))
  const darker = Math.min(luminance(foreground), luminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

/** black/70 over a worst-case white photo, then the visible text color. */
function scrimmed(opacity: number, under: string): string {
  const [r, g, b] = channel(under)
  const mix = (channelValue: number) => Math.round(channelValue * (1 - opacity))
  const toHex = (channelValue: number) =>
    mix(channelValue).toString(16).padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function over(foreground: string, alpha: number, background: string): string {
  const [fr, fg, fb] = channel(foreground)
  const [br, bg, bb] = channel(background)
  const mix = (text: number, base: number) =>
    Math.round(text * alpha + base * (1 - alpha))
  const toHex = (channelValue: number) =>
    channelValue.toString(16).padStart(2, "0")
  return `#${toHex(mix(fr, br))}${toHex(mix(fg, bg))}${toHex(mix(fb, bb))}`
}

describe("race hero fallback contrast", () => {
  it("keeps white hero text at or above 4.5:1 on the dark scrim", () => {
    const worstBackground = scrimmed(0.7, "#ffffff")
    const tileBackground = scrimmed(0.7, "#14161a")

    for (const background of [worstBackground, tileBackground]) {
      expect(contrast("#ffffff", background)).toBeGreaterThanOrEqual(4.5)
      expect(
        contrast(over("#ffffff", 0.9, background), background)
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        contrast(over("#ffffff", 0.8, background), background)
      ).toBeGreaterThanOrEqual(4.5)
    }
  })

  it("uses the illustrated track tile and a black/70 scrim when the hero has no photo", () => {
    const root = process.cwd()
    const hero = readFileSync(
      path.join(root, "components/races/hero/RaceHero.tsx"),
      "utf8"
    )
    const notice = readFileSync(
      path.join(root, "components/races/finished-race-notice.tsx"),
      "utf8"
    )
    const page = readFileSync(
      path.join(root, "app/races/[id]/page.tsx"),
      "utf8"
    )
    const sitemap = readFileSync(path.join(root, "app/sitemap.ts"), "utf8")

    expect(hero).toContain('src="/assets/placeholder.jpg"')
    expect(hero).toContain("bg-black/70")
    expect(hero).toContain("data-race-hero-scrim")
    expect(hero).toContain("raceHasFinished")
    expect(notice).toContain("This race has finished.")
    expect(notice).toContain("See upcoming {seriesName} races.")
    expect(page).toContain("index: false")
    expect(page).toContain("follow: true")
    expect(sitemap).toContain("raceHasFinished")
  })
})
