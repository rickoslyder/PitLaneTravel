import { loadRacesStylesheetManifest } from "@/lib/races-stylesheet-manifest"

/** Size-adjusted local fallback copied out of the next/font sheet at build time. */
export function racesInlineFontCss(): string {
  return loadRacesStylesheetManifest().fallbackFontCss
}
