import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { minifyCss } from "@/lib/minify-css"

const fontFace = /@font-face\s*\{[^}]*\}/g
const fontRule = /[^{}@]*__[^{]*\{[^}]*font-family:[^}]*\}/g

function walkCss(dir: string, out: string[]) {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return
  }
  for (const entry of entries) {
    const full = path.join(dir, entry)
    let info
    try {
      info = statSync(full)
    } catch {
      continue
    }
    if (info.isDirectory()) walkCss(full, out)
    else if (entry.endsWith(".css")) out.push(full)
  }
}

function keepFontRule(match: string): boolean {
  // Only the size-adjusted local fallback. A webfont request becomes the LCP
  // chain once the Tailwind sheet no longer blocks rendering.
  return match.includes("@font-face") && /fallback/i.test(match)
}

function collectFontCss(): string {
  const files: string[] = []
  walkCss(path.join(process.cwd(), ".next", "static", "css"), files)
  const parts: string[] = []
  const seen = new Set<string>()
  for (const file of files) {
    let css = ""
    try {
      css = readFileSync(file, "utf8")
    } catch {
      continue
    }
    const matches = [
      ...(css.match(fontFace) ?? []),
      ...(css.match(fontRule) ?? [])
    ]
    for (const match of matches) {
      if (match.length > 2000 || seen.has(match) || !keepFontRule(match)) {
        continue
      }
      seen.add(match)
      parts.push(match)
    }
  }
  return minifyCss(parts.join(""))
}

let cached: string | undefined

/** next/font rules live in the built CSS. Inline them so deferring that file does not swap the h1 font. */
export function racesInlineFontCss(): string {
  if (
    cached !== undefined &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    return cached
  }
  const css = collectFontCss()
  if (process.env.NEXT_PHASE !== "phase-production-build") cached = css
  return css
}
