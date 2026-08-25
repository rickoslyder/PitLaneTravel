import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()

describe("PLT-009 smoke locator and anonymous-boundary source contract", () => {
  it("uses exact accessible headings that exist in the tested routes", () => {
    const smoke = readFileSync(path.join(root, "tests/e2e/smoke.spec.ts"), "utf8")
    const racesPage = readFileSync(
      path.join(root, "components/races/RacesPage.tsx"),
      "utf8"
    )
    const hero = readFileSync(
      path.join(root, "components/races/HeroSection.tsx"),
      "utf8"
    )
    const upcoming = readFileSync(
      path.join(root, "components/landing/upcoming-races.tsx"),
      "utf8"
    )
    const grandstands = readFileSync(
      path.join(root, "app/circuits/grandstands/page.tsx"),
      "utf8"
    )
    const compare = readFileSync(
      path.join(root, "app/races/compare/page.tsx"),
      "utf8"
    )

    expect(hero).toMatch(/>\s*Motorsport Race Calendar\s*</)
    expect(racesPage).toMatch(/>Race Calendar</)
    expect(upcoming).toMatch(/>Upcoming Races</)
    expect(grandstands).toMatch(/>Grandstand Guides</)
    expect(compare).toMatch(/>\s*Compare Race Weekends\s*</)

    expect(smoke).toMatch(
      /getByRole\(\s*["']heading["']\s*,\s*\{\s*name:\s*["']Race Calendar["']\s*,\s*exact:\s*true/
    )
    expect(smoke).toMatch(
      /getByRole\(\s*["']heading["']\s*,\s*\{\s*name:\s*["']Upcoming Races["']\s*,\s*exact:\s*true/
    )
    expect(smoke).toMatch(
      /getByRole\(\s*["']heading["']\s*,\s*\{\s*name:\s*["']Grandstand Guides["']\s*,\s*exact:\s*true/
    )
    expect(smoke).toMatch(
      /getByRole\(\s*["']heading["']\s*,\s*\{\s*name:\s*["']Compare Race Weekends["']\s*,\s*exact:\s*true/
    )
    expect(smoke).not.toMatch(
      /getByRole\(\s*["']heading["']\s*,\s*\{\s*name:\s*["']Race Calendar["']\s*\}/
    )
    expect(smoke).not.toMatch(/getByText\(\s*["']Race Calendar["']/)
  })

  it("asserts the anonymous /trips 307 without loading Clerk UI or mocking routes", () => {
    const smoke = readFileSync(path.join(root, "tests/e2e/smoke.spec.ts"), "utf8")
    expect(smoke).toMatch(/maxRedirects\s*:\s*0/)
    expect(smoke).toMatch(/toBe\(307\)/)
    expect(smoke).toMatch(/redirect_url/)
    expect(smoke).toMatch(/Your Trips/)
    expect(smoke).not.toMatch(/page\.goto\(\s*["']\/trips["']/)
    expect(smoke).not.toMatch(/page\.route\(\s*["']\/trips/)
    expect(smoke).not.toMatch(/page\.route\(\s*["']\/login/)
    expect(smoke).not.toMatch(/userId\s*[:=]\s*["']user_/)
    expect(smoke).not.toMatch(/storageState:\s*\{[^}]*cookies:[^}]*__session/)
  })

  it("does not add a production auth bypass or extra Playwright cases", () => {
    const middleware = readFileSync(path.join(root, "middleware.ts"), "utf8")
    const playwright = readFileSync(
      path.join(root, "playwright.config.ts"),
      "utf8"
    )
    const smoke = readFileSync(path.join(root, "tests/e2e/smoke.spec.ts"), "utf8")

    expect(middleware).toMatch(/export default clerkMiddleware\s*\(/)
    expect(middleware).toMatch(/await auth\(\)/)
    expect(middleware).not.toMatch(/process\.env\.(NODE_ENV|VERCEL_ENV|CI)\b/)
    expect(middleware).not.toMatch(/PLAYWRIGHT/)
    expect(playwright).toMatch(/testMatch:\s*["']smoke\.spec\.ts["']/)
    expect(playwright).toMatch(/retries:\s*0/)
    expect(smoke.match(/test\(/g)?.length).toBe(6)
    expect(smoke).not.toMatch(/\.(only|skip|fixme|force)\(/)
  })

  it("emits race-detail view_item from a client effect keyed to race and user identity", () => {
    const source = readFileSync(
      path.join(root, "components/races/RaceDetailsPage.tsx"),
      "utf8"
    )

    expect(source).toMatch(/sendGTMEvent\s*\(/)
    expect(source).toMatch(/event:\s*["']view_item["']/)
    expect(source).toMatch(/x_fb_cd_content_ids:\s*\[\s*race\.id\s*\]/)
    expect(source).toMatch(/item_name:\s*race\.name/)
    expect(source).toMatch(
      /useEffect\(\s*\(\)\s*=>\s*\{[\s\S]*sendGTMEvent\(\{[\s\S]*event:\s*["']view_item["'][\s\S]*\}\)\s*\n\s*\},\s*\[[^\]]*race\.id[^\]]*race\.name[^\]]*userId[^\]]*\]\s*\)/
    )
    expect(source).not.toMatch(/typeof\s+window/)
    expect(source).not.toMatch(
      /process\.env\.(NODE_ENV|VERCEL_ENV|CI|PLAYWRIGHT)\b/
    )

    const renderBody = source.replace(
      /useEffect\(\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*,\s*\[[^\]]*\]\s*\)/g,
      ""
    )
    expect(renderBody).not.toMatch(/sendGTMEvent\s*\(/)
  })
})
