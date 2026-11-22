import { readFileSync } from "node:fs"
import path from "node:path"
import postcss from "postcss"
import tailwindcss from "tailwindcss"
import type { Config } from "tailwindcss"
import { racesCriticalClassMarkup } from "@/lib/races-critical-classes"
import { minifyCss } from "@/lib/minify-css"
import tailwindConfig from "../tailwind.config"
import cascadeLayers from "../config/cascade-layers.cjs"

const root = process.cwd()

const minimalReset = `
*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:hsl(var(--border))}
html{line-height:1.5;-webkit-text-size-adjust:100%;tab-size:4}
body{margin:0;line-height:inherit;background-color:hsl(var(--background));color:hsl(var(--foreground))}
h1,h2,h3,h4,p,figure,blockquote,dl,dd{margin:0;font-size:inherit;font-weight:inherit}
ul,ol{margin:0;padding:0;list-style:none}
button,input,textarea{font:inherit;color:inherit;margin:0;padding:0;background-color:transparent}
button{cursor:pointer}
a{color:inherit;text-decoration:inherit}
img,svg,video{display:block;max-width:100%;height:auto}
*,::before,::after{--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1}
`

function balancedBlock(source: string, openBrace: number): string {
  let depth = 0
  for (let i = openBrace; i < source.length; i++) {
    const char = source[i]
    if (char === "{") depth++
    else if (char === "}") {
      depth--
      if (depth === 0) return source.slice(openBrace, i + 1)
    }
  }
  throw new Error("Unbalanced CSS block")
}

function blockAfterSelector(source: string, selector: string): string {
  const at = source.indexOf(selector)
  if (at === -1) return ""
  const open = source.indexOf("{", at)
  return source.slice(at, open) + balancedBlock(source, open)
}

/**
 * On a short phone the full sheet's space-y margin keeps Upcoming/Past below
 * the fold. Repeat it as a real rule so the critical sheet matches even when
 * the sibling combinator has not seen the JSON-LD script yet.
 */
const shortPhoneHeroMargin = `
@media (max-width: 639px) and (max-height: 740px) {
  html:has([data-analytics-consent-bar]) [data-races-listing] > [data-races-listing-hero] {
    margin-top: 1rem;
  }
}
`

/** Light tokens plus the races consent rules. Dark theme and series-page rules stay out. */
export function racesCriticalGlobals(css: string): {
  root: string
  consent: string
} {
  const rootRule = blockAfterSelector(css, ":root")
  const bodyPad = blockAfterSelector(
    css,
    "html:has([data-analytics-consent-bar]) body"
  )
  const mediaAt = css.indexOf(
    "@media (max-width: 639px) and (min-height: 800px)"
  )
  if (mediaAt === -1) {
    throw new Error("Races consent media query is missing from globals.css")
  }
  const mediaOpen = css.indexOf("{", mediaAt)
  const media = css.slice(mediaAt, mediaOpen) + balancedBlock(css, mediaOpen)
  return {
    root: rootRule,
    consent: `${bodyPad}\n${media}\n${shortPhoneHeroMargin}`
  }
}

export async function buildRacesCriticalCss(): Promise<string> {
  const globalsPath = path.join(root, "app/globals.css")
  const globals = readFileSync(globalsPath, "utf8")
  const { root: rootRule, consent } = racesCriticalGlobals(globals)
  const config = tailwindConfig as Config
  // Consent rules follow the utilities so the same cascade-layers pass that
  // wraps the public sheet puts them in the utilities layer. Unlayered
  // critical CSS would beat the layered public sheet and leave borders unset.
  const input = `${rootRule}\n${minimalReset}\n@tailwind utilities;\n${consent}\n`
  const processed = await postcss([
    tailwindcss({
      ...config,
      content: [{ raw: racesCriticalClassMarkup, extension: "html" }]
    }),
    cascadeLayers()
  ]).process(input, { from: undefined })

  const css = minifyCss(processed.css)
  if (css.includes("</")) {
    throw new Error("Critical CSS cannot contain a closing tag")
  }
  return css
}
