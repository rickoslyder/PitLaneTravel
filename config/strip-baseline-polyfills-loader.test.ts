import { createRequire } from "node:module"
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const require = createRequire(import.meta.url)
const { stripShippedBaselinePolyfills } = require(
  "./strip-baseline-polyfills-loader.cjs"
) as {
  stripShippedBaselinePolyfills: (source: string) => string
}

const dist = path.resolve(__dirname, "../node_modules/posthog-js/dist")

describe("stripShippedBaselinePolyfills", () => {
  it("removes the Math.trunc polyfill from every posthog-js dist build", () => {
    const files = readdirSync(dist).filter(name => name.endsWith(".js"))
    const withPolyfill = files.filter(name =>
      readFileSync(path.join(dist, name), "utf8").includes("Math.trunc||")
    )
    expect(withPolyfill.length).toBeGreaterThan(0)

    for (const name of withPolyfill) {
      const source = readFileSync(path.join(dist, name), "utf8")
      const stripped = stripShippedBaselinePolyfills(source)
      expect(stripped).not.toContain("Math.trunc||")
      expect(stripped).not.toContain("Number.isInteger||")
      expect(stripped).toContain("Math.trunc(")
      expect(source.length - stripped.length).toBeLessThan(250)
    }
  })

  it("leaves code that only calls Math.trunc unchanged", () => {
    const source = "const n = Math.trunc(value)"
    expect(stripShippedBaselinePolyfills(source)).toBe(source)
  })
})
