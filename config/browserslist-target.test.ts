import { createRequire } from "node:module"
import path from "node:path"
import { describe, expect, it } from "vitest"

const require = createRequire(import.meta.url)
const browserslist = require("next/dist/compiled/browserslist") as {
  (query: string | string[]): string[]
  loadConfig: (options: {
    path: string
    env?: string
  }) => string[] | null | undefined
}

const root = path.resolve(__dirname, "..")

function minimumMajor(resolved: string[], name: string): number {
  const versions = resolved
    .filter(entry => entry.startsWith(`${name} `))
    .map(entry => Number.parseFloat(entry.slice(name.length + 1)))
  expect(versions.length).toBeGreaterThan(0)
  return Math.min(...versions)
}

describe("browserslist compile target", () => {
  const queries = browserslist.loadConfig({ path: root, env: "production" })
  const resolved = browserslist(queries ?? [])

  it("uses an explicit list Next's compiled browserslist can resolve", () => {
    expect(queries?.join("\n") ?? "").not.toMatch(/baseline/i)
    expect(resolved.length).toBeGreaterThan(0)
    expect(() => browserslist("baseline widely available")).toThrow(
      /Unknown browser query/
    )
  })

  it("keeps iOS Safari 16 and the Chrome 111 generation, and nothing older", () => {
    expect(minimumMajor(resolved, "chrome")).toBe(111)
    expect(minimumMajor(resolved, "edge")).toBe(111)
    expect(minimumMajor(resolved, "firefox")).toBe(111)
    expect(minimumMajor(resolved, "safari")).toBe(16)
    expect(minimumMajor(resolved, "ios_saf")).toBe(16)
    expect(minimumMajor(resolved, "opera")).toBe(97)
    expect(resolved.some(entry => entry.startsWith("safari 16"))).toBe(true)
    expect(resolved.some(entry => entry.startsWith("ios_saf 16"))).toBe(true)
    expect(resolved).not.toContain("chrome 64")
    expect(resolved).not.toContain("safari 12")
  })
})
