import { readFileSync } from "node:fs"
import path from "node:path"

type FontManifest = {
  app?: Record<string, string[]>
}

/** The latin subset next/font marks for preload ends in `.p.woff2`. */
export function latinPreloadFromManifest(
  manifest: FontManifest
): string | null {
  const file = Object.values(manifest.app ?? {})
    .flat()
    .find(entry => entry.endsWith(".p.woff2"))
  return file ? `/_next/${file}` : null
}

let cached: string | null | undefined

/**
 * Href for the layout's latin Inter file. The build manifest is the source
 * of the hashed name, so this does not hardcode a fingerprint. Missing during
 * the first compile is fine: the request is skipped rather than guessed.
 */
export function latinFontPreloadHref(): string | null {
  if (cached !== undefined) return cached
  try {
    const manifest = JSON.parse(
      readFileSync(
        path.join(process.cwd(), ".next/server/next-font-manifest.json"),
        "utf8"
      )
    ) as FontManifest
    cached = latinPreloadFromManifest(manifest)
  } catch {
    return null
  }
  return cached
}
