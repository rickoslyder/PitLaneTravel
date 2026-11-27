import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import {
  racesCriticalClassMarkup,
  racesCriticalClassSources
} from "@/lib/races-critical-classes"
import { racesCriticalCss } from "@/lib/races-critical-css"
import { buildRacesCriticalCss } from "@/lib/races-critical-css-build"
import { racesCriticalUnblockScript } from "@/lib/races-critical-unblock"

const root = process.cwd()

function read(relativePath: string): string {
  return readFileSync(path.join(root, relativePath), "utf8")
}

function classTokens(source: string): string[] {
  const tokens = new Set<string>()
  for (const match of source.matchAll(/className="([^"]+)"/g)) {
    for (const token of match[1].split(/\s+/)) {
      if (token && !token.includes("{")) tokens.add(token)
    }
  }
  return [...tokens]
}

describe("races critical css", () => {
  it("stays under 15KB and matches the Tailwind subset", async () => {
    expect(Buffer.byteLength(racesCriticalCss)).toBeLessThan(15 * 1024)
    expect(racesCriticalCss).toBe(await buildRacesCriticalCss())
    expect(racesCriticalCss).toContain(".text-4xl{")
    expect(racesCriticalCss).toContain(".border-brand{")
    expect(racesCriticalCss).toContain(".overflow-x-clip{")
    expect(racesCriticalCss).not.toContain(".h-14{")
    expect(racesCriticalCss).toContain(".left-1\\/2{")
    expect(racesCriticalCss).toContain(".-translate-x-1\\/2{")
    expect(racesCriticalCss).toContain(".p-2{")
    expect(racesCriticalCss).toContain(".lg\\:hidden{")
    expect(racesCriticalCss).toContain(".sr-only{")
    expect(racesCriticalCss).toContain(".fixed{position:fixed}")
    expect(racesCriticalCss).toContain("data-races-listing-hero")
    expect(racesCriticalCss).toContain("-webkit-line-clamp:2")
    expect(racesCriticalCss).toContain(
      "padding-bottom:var(--consent-bar-height,7.5rem)"
    )
    expect(racesCriticalCss).toContain("max-height:740px")
    expect(racesCriticalCss).toContain("@layer utilities")
    expect(racesCriticalCss).not.toContain("</")
  })

  it("includes every static class on the hero and races header", () => {
    for (const file of racesCriticalClassSources) {
      for (const token of classTokens(read(file))) {
        expect(racesCriticalClassMarkup, `${file} ${token}`).toContain(token)
      }
    }
    expect(racesCriticalClassMarkup).toContain("flex-1 space-y-4 p-4 pt-0")
    expect(racesCriticalClassMarkup).toContain("z-[60]")
  })

  it("defers stylesheets on /races only and does not turn inlineCss back on", () => {
    const unblock = racesCriticalUnblockScript("/_next/static/css/font.css")
    expect(unblock).toContain('path!=="/races"')
    expect(unblock).toContain('link.media="all"')
    expect(unblock).toContain("setTimeout(enable,0)")
    expect(unblock).toContain("DOMContentLoaded")
    expect(unblock).toContain('"/_next/static/css/font.css"')
    expect(unblock).toContain("href===fontHref")
    expect(read("next.config.mjs")).not.toContain("inlineCss: true")
    expect(read("app/layout.tsx")).toContain("races-critical-css-unblock")
    expect(read("app/layout.tsx")).not.toContain("globals.css")
    expect(read("app/layout.tsx")).not.toContain("global-styles")
    expect(read("app/(marketing)/layout.tsx")).toContain("global-styles")
    expect(read("app/series/layout.tsx")).toContain("global-styles")
    expect(read("app/races/layout.tsx")).not.toContain("global-styles")
    expect(read("app/races/page.tsx")).toContain("RacesCriticalCss")
    expect(read("app/races/page.tsx")).not.toContain("global-styles")
    expect(read("components/races/races-critical-css.tsx")).toContain(
      'media="print"'
    )
    expect(read("components/races/races-critical-css.tsx")).toContain(
      "<noscript>"
    )
    expect(read("components/races/races-critical-css.tsx")).toContain(
      "dangerouslySetInnerHTML"
    )
    expect(read("app/(marketing)/page.tsx")).not.toContain("RacesCriticalCss")
    expect(read("app/series/[slug]/page.tsx")).not.toContain("RacesCriticalCss")
    expect(read("app/globals.css")).toContain("@apply border-border")
    expect(read("app/globals.css")).toContain(
      "@apply bg-background text-foreground"
    )
  })
})
