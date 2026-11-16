import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

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

function collect(): string[] {
  const root = path.join(process.cwd(), ".next", "static", "css")
  const files: string[] = []
  walkCss(root, files)
  const hrefs: string[] = []
  for (const file of files) {
    let css = ""
    try {
      css = readFileSync(file, "utf8")
    } catch {
      continue
    }
    if (!css.includes("--tw-border-spacing-x") || !css.includes(".text-4xl")) {
      continue
    }
    const href =
      "/_next/static/css/" + path.relative(root, file).split(path.sep).join("/")
    hrefs.push(href)
  }
  return hrefs
}

let cached: string[] | undefined

/** Tailwind sheet emitted for other routes. /races loads it without blocking paint. */
export function racesDeferredStylesheetHrefs(): string[] {
  if (
    cached !== undefined &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    return cached
  }
  const hrefs = collect()
  if (process.env.NEXT_PHASE !== "phase-production-build") cached = hrefs
  return hrefs
}
