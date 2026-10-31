import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { contrastRatio, readableTextOn } from "@/lib/color-contrast"

const root = process.cwd()

function readSource(relativePath: string): string {
  return readFileSync(path.join(root, relativePath), "utf8")
}

/** Mix `hex` at `alpha` over `background`. Matches CSS colour with alpha on a solid fill. */
function blend(hex: string, background: string, alpha: number): string {
  const channel = (source: string, index: number) =>
    parseInt(source.slice(index, index + 2), 16)
  const fg = hex.replace("#", "")
  const bg = background.replace("#", "")
  const mix = (index: number) =>
    Math.round(alpha * channel(fg, index) + (1 - alpha) * channel(bg, index))
  return `#${[0, 2, 4]
    .map(index => mix(index).toString(16).padStart(2, "0"))
    .join("")}`
}

function hslToHex(h: number, s: number, l: number): string {
  const saturation = s / 100
  const lightness = l / 100
  const a = saturation * Math.min(lightness, 1 - lightness)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0")
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function token(css: string, name: string): string {
  const match = css.match(new RegExp(`--${name}:\\s*([^;]+);`))
  if (!match) throw new Error(`Missing --${name}`)
  return match[1].trim()
}

function tokenHex(css: string, name: string): string {
  const value = token(css, name)
  if (value.startsWith("#")) return value.toLowerCase()
  const [h, s, l] = value.split(/\s+/)
  return hslToHex(parseFloat(h), parseFloat(s), parseFloat(l))
}

describe("editorial contrast", () => {
  const css = readSource("app/globals.css")
  const light = css.slice(css.indexOf(":root"), css.indexOf(".dark"))

  it("records the Studio baseline pairs below 4.5:1", () => {
    expect(contrastRatio("#fafafa", "#3b82f6")).toBeCloseTo(3.52, 1)
    expect(contrastRatio("#b17a50", "#fafafa")).toBeCloseTo(3.49, 1)
    expect(contrastRatio("#77777c", "#fafafa")).toBeCloseTo(4.26, 1)
    expect(contrastRatio("#737373", "#f5f5f5")).toBeCloseTo(4.35, 1)
    expect(contrastRatio("#ffffff", "#00b1eb")).toBeCloseTo(2.47, 1)
  })

  it("clears AA for the named pairs after the palette change", () => {
    const paper = tokenHex(light, "background")
    const ink = tokenHex(light, "foreground")
    const muted = tokenHex(light, "muted")
    const mutedForeground = tokenHex(light, "muted-foreground")
    const sidebar = tokenHex(light, "sidebar-background")
    const sidebarForeground = tokenHex(light, "sidebar-foreground")
    const groupLabel = blend(sidebarForeground, sidebar, 0.7)

    expect(paper).toBe("#faf8f4")
    expect(ink).toBe("#1c1916")

    // Sign Up is ink on paper, not #fafafa on #3b82f6.
    expect(contrastRatio(paper, ink)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(paper, ink)).toBeCloseTo(16.5, 1)

    // Sidebar accent text uses the same ink instead of #b17a50.
    expect(contrastRatio(ink, sidebar)).toBeGreaterThanOrEqual(4.5)

    // Group labels are sidebar-foreground at 70% opacity.
    expect(contrastRatio(groupLabel, sidebar)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(groupLabel, sidebar)).toBeCloseTo(6.15, 1)

    // Inactive tabs are muted-foreground on muted.
    expect(contrastRatio(mutedForeground, muted)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(mutedForeground, muted)).toBeCloseTo(6.25, 1)
    expect(contrastRatio(mutedForeground, paper)).toBeGreaterThanOrEqual(4.5)

    // Formula E keeps #00b1eb and switches the label to ink.
    expect(readableTextOn("#00b1eb")).toBe("#1c1916")
    expect(contrastRatio("#1c1916", "#00b1eb")).toBeCloseTo(7.07, 1)
    expect(readableTextOn("#e10600")).toBe("#ffffff")
    expect(contrastRatio("#ffffff", "#e10600")).toBeCloseTo(4.97, 1)
    expect(contrastRatio("#ffffff", "#cc0000")).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio("#ffffff", "#0033a0")).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio("#ffffff", "#00843d")).toBeGreaterThanOrEqual(4.5)
  })

  it("keeps #e10600 on the primary button token with a darker hover", () => {
    expect(token(light, "brand")).toBe("#e10600")
    expect(token(light, "brand-foreground")).toBe("#ffffff")
    expect(token(light, "brand-hover")).toBe("#b50500")
    expect(contrastRatio("#ffffff", "#e10600")).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio("#ffffff", "#b50500")).toBeGreaterThanOrEqual(4.5)
    expect(readSource("components/ui/button.tsx")).toContain(
      "bg-brand text-brand-foreground hover:bg-brand-hover"
    )
  })

  it("uses the flag mark and one tagline, and drops the failing chrome colours", () => {
    const header = readSource("components/header.tsx")
    const sidebar = readSource("components/sidebar/app-sidebar.tsx")
    const series = readSource("app/series/[slug]/page.tsx")

    expect(header).toContain("<Flag")
    expect(header).toContain("{brand.tagline}")
    expect(header).not.toContain("bg-blue-500")
    expect(header).not.toContain("grid-cols-2")
    expect(header).not.toContain("Your F1 Travel Companion")
    expect(sidebar).toContain("BrandMark")
    expect(sidebar).not.toContain("PitLaneTravelLogo")
    expect(readSource("components/sidebar/nav-main.tsx")).not.toContain(
      "#B17A50"
    )
    expect(readSource("components/sidebar/nav-projects.tsx")).not.toContain(
      "#B17A50"
    )
    expect(series).not.toContain("linear-gradient")
    expect(series).toContain("SeriesBadge")
  })
})
