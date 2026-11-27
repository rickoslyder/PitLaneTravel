import { loadRacesStylesheetManifest } from "@/lib/races-stylesheet-manifest"

/**
 * Tailwind sheet only. The Inter sheet stays out of /races: its swap display
 * moves the calendar after first paint. The latin face is inlined instead.
 */
export function racesDeferredStylesheetHrefs(): string[] {
  const manifest = loadRacesStylesheetManifest()
  return manifest.hrefs.filter(href => href !== manifest.fontHref)
}
