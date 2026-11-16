import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { metadata, racesPageDescription, racesPageTitle } from "./metadata"

const root = process.cwd()

function readSource(relativePath: string): string {
  return readFileSync(path.join(root, relativePath), "utf8")
}

describe("races page metadata", () => {
  const source = readSource("app/races/page.tsx")

  it("publishes the metadata object from ./metadata", () => {
    expect(source).toMatch(
      /import\s*\{[^}]*metadata as racesMetadata[^}]*\}\s*from\s*["']\.\/metadata["']/
    )
    expect(source).toMatch(/export async function generateMetadata\(/)
    expect(source).toMatch(/return racesMetadata/)
    expect(racesPageTitle).toBe("Motorsport Race Calendar | PitLane Travel")
    expect(racesPageDescription).toMatch(/full race calendar/)
    expect(metadata.title).toBe(racesPageTitle)
    expect(metadata.description).toBe(racesPageDescription)
    expect(metadata.alternates?.canonical).toBe(
      "https://www.pitlanetravel.com/races"
    )
    expect(metadata.openGraph?.title).toBe(racesPageTitle)
  })

  it("keeps one calendar h1 and demotes the second heading", () => {
    const hero = readSource("components/races/HeroSection.tsx")
    const racesPage = readSource("components/races/RacesPage.tsx")
    expect(hero).toMatch(/<h1[^>]*>\s*Motorsport Race Calendar\s*<\/h1>/)
    expect(racesPage).toMatch(
      /<h2 className="mb-6 text-center text-2xl font-bold">Race Calendar<\/h2>/
    )
    expect(racesPage).not.toMatch(/<h1[^>]*>Race Calendar<\/h1>/)
  })

  it("renders the h1 shell before the race query", () => {
    const start = source.indexOf(
      "export default async function RacesServerPage"
    )
    const listing = source.indexOf("async function RacesListing")
    const shell = source.slice(start, listing)
    expect(shell).toContain("<HeroSection")
    expect(shell).toContain(
      '<meta name="description" content={racesPageDescription} />'
    )
    expect(shell).toContain("<Suspense")
    expect(shell).toContain('data-races-listing=""')
    expect(shell).toContain('data-races-listing-hero=""')
    expect(shell).not.toContain("getRacesAction")
    expect(source.slice(listing)).toContain("getRacesAction")
  })

  it("places the home feature titles at h2 with the same classes", () => {
    const hero = readSource("components/landing/hero.tsx")
    for (const title of [
      "Every race, one calendar",
      "Know your seat",
      "Get out on time"
    ]) {
      expect(hero).toContain(
        `<h2 className="text-lg font-semibold">${title}</h2>`
      )
      expect(hero).not.toContain(
        `<h3 className="text-lg font-semibold">${title}</h3>`
      )
    }
  })
})
