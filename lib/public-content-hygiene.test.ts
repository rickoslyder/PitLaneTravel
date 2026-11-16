import { describe, expect, it } from "vitest"
import {
  findPublicCopyLeaks,
  formatPublicCopyLeak,
  leaksInText,
  publicCopyFiles
} from "./public-content-hygiene"

describe("public content hygiene", () => {
  it("scans the sources that feed rendered pages", () => {
    const files = publicCopyFiles()
    expect(files).toContain("content/race-hub-subpages/first-timers.ts")
    expect(files).toContain("content/race-hub-subpages/with-kids.ts")
    expect(files).toContain("content/race-hub-subpages/what-to-bring.ts")
    expect(files).toContain(
      "content/guides/abu-dhabi-grand-prix-travel-guide.mdx"
    )
    expect(files).toContain("content/fan-tips/abu-dhabi-grand-prix-2026.ts")
    expect(files.some(file => file.startsWith("content/guides/"))).toBe(true)
    expect(files).toContain("data/seeds/multi-series-2026-calendars.json")
    expect(files.some(file => file.startsWith("data/guides/"))).toBe(true)
    expect(files).toContain("config/site-copy.ts")
    expect(files).toContain("lib/guides.ts")
    expect(files).toContain("lib/site-metadata.ts")
    expect(files).toContain("app/(marketing)/faq/page.tsx")
    expect(files).not.toContain("lib/public-content-hygiene.ts")
    expect(files.some(file => file.includes(".test."))).toBe(false)
    expect(files.some(file => file.includes(".spec."))).toBe(false)
  })

  it("reports the file and line of an internal research citation", () => {
    const sample = [
      "Keep the sentence. *(Scout, 16 November 2026, AD2.)*",
      "Official page: https://www.abudhabigp.com/en/terms-and-conditions",
      "Scout fact-check, 16 November 2026: `/workspace/state/review/scout.md` (AD13.)",
      "Engineering Lead asked a sand-subagent englead-9 bc-abc12345 to re-check AD34.",
      "Passed from Writer to Grawk and Grok."
    ].join("\n")

    expect(
      leaksInText("content/example.ts", sample).map(
        leak => `${leak.file}:${leak.line}: ${leak.label}`
      )
    ).toEqual([
      "content/example.ts:1: Scout",
      "content/example.ts:1: AD fact-id",
      "content/example.ts:3: /workspace",
      "content/example.ts:3: Scout",
      "content/example.ts:3: AD fact-id",
      "content/example.ts:3: fact-check",
      "content/example.ts:4: AD fact-id",
      "content/example.ts:4: sand-subagent",
      "content/example.ts:4: bc-id",
      "content/example.ts:4: englead-",
      "content/example.ts:4: Engineering Lead",
      "content/example.ts:5: Grawk, Grok or Writer"
    ])
  })

  it("fails when public copy still cites internal research", () => {
    const leaks = findPublicCopyLeaks()
    expect(leaks.map(formatPublicCopyLeak).join("\n")).toBe("")
  })
})
