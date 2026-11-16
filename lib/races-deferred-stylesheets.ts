import { loadRacesStylesheetManifest } from "@/lib/races-stylesheet-manifest"

/** Tailwind sheet URL recorded at build time. The file itself is a static asset. */
export function racesDeferredStylesheetHrefs(): string[] {
  return loadRacesStylesheetManifest().hrefs
}
