import { readFileSync } from "node:fs"
import path from "node:path"

export type RacesStylesheetManifest = {
  hrefs: string[]
  fallbackFontCss: string
}

const emptyManifest: RacesStylesheetManifest = {
  hrefs: [],
  fallbackFontCss: ""
}

export function racesStylesheetManifestPath(): string {
  return path.join(process.cwd(), ".next", "races-stylesheet-manifest.json")
}

export function parseRacesStylesheetManifest(
  raw: string
): RacesStylesheetManifest {
  const parsed: unknown = JSON.parse(raw)
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return emptyManifest
  }
  const record = parsed as { hrefs?: unknown; fallbackFontCss?: unknown }
  const hrefs = Array.isArray(record.hrefs)
    ? record.hrefs.filter(
        (href): href is string =>
          typeof href === "string" && href.startsWith("/_next/static/css/")
      )
    : []
  const fallbackFontCss =
    typeof record.fallbackFontCss === "string" ? record.fallbackFontCss : ""
  return { hrefs, fallbackFontCss }
}

let cached: RacesStylesheetManifest | undefined

/** Build-time hrefs. An empty miss is not cached: the manifest is written after compile starts. */
export function loadRacesStylesheetManifest(
  filePath = racesStylesheetManifestPath()
): RacesStylesheetManifest {
  if (
    cached &&
    cached.hrefs.length > 0 &&
    filePath === racesStylesheetManifestPath()
  ) {
    return cached
  }
  let manifest = emptyManifest
  try {
    manifest = parseRacesStylesheetManifest(readFileSync(filePath, "utf8"))
  } catch {
    manifest = emptyManifest
  }
  if (manifest.hrefs.length > 0 && filePath === racesStylesheetManifestPath()) {
    cached = manifest
  }
  return manifest
}
