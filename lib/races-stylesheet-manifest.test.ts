import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { manifestFromAssets } from "../config/races-stylesheet-manifest.cjs"
import {
  loadRacesStylesheetManifest,
  parseRacesStylesheetManifest
} from "@/lib/races-stylesheet-manifest"

describe("races stylesheet manifest", () => {
  it("records the Tailwind href and the local fallback face only", () => {
    const manifest = manifestFromAssets([
      {
        name: "static/css/font.css",
        css: '@font-face{font-family:Inter;src:url(/_next/static/media/inter.woff2) format("woff2")}@font-face{font-family:Inter Fallback;src:local("Arial");size-adjust:107.12%}'
      },
      {
        name: "static/css/tailwind.css",
        css: "*,::before{--tw-border-spacing-x:0}.text-4xl{font-size:2.25rem}"
      },
      {
        name: "static/css/map.css",
        css: ".mapboxgl-map{position:relative}"
      }
    ])
    expect(manifest.hrefs).toEqual(["/_next/static/css/tailwind.css"])
    expect(manifest.fallbackFontCss).toContain("Inter Fallback")
    expect(manifest.fallbackFontCss).not.toContain("woff2")
  })

  it("rejects hrefs that are not built stylesheets", () => {
    expect(
      parseRacesStylesheetManifest(
        JSON.stringify({
          hrefs: ["/_next/static/css/ok.css", "https://evil.example/a.css", 1],
          fallbackFontCss: "@font-face{font-family:Inter Fallback}"
        })
      )
    ).toEqual({
      hrefs: ["/_next/static/css/ok.css"],
      fallbackFontCss: "@font-face{font-family:Inter Fallback}"
    })
  })

  it("does not cache a missing manifest or read .next/static", () => {
    const missing = loadRacesStylesheetManifest(
      path.join(process.cwd(), "lib/does-not-exist-races-manifest.json")
    )
    expect(missing.hrefs).toEqual([])
    const again = loadRacesStylesheetManifest(
      path.join(process.cwd(), "lib/does-not-exist-races-manifest.json")
    )
    expect(again.hrefs).toEqual([])
    const source = readFileSync(
      path.join(process.cwd(), "lib/races-stylesheet-manifest.ts"),
      "utf8"
    )
    expect(source).toContain("hrefs.length > 0")
    expect(source).not.toContain('.next", "static"')
    expect(
      readFileSync(
        path.join(process.cwd(), "lib/races-deferred-stylesheets.ts"),
        "utf8"
      )
    ).not.toContain("readdirSync")
    expect(
      readFileSync(path.join(process.cwd(), "next.config.mjs"), "utf8")
    ).toContain("./.next/races-stylesheet-manifest.json")
  })
})
