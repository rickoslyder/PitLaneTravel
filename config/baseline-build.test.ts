import { createRequire } from "node:module"
import { describe, expect, it } from "vitest"
import nextConfig from "../next.config.mjs"

const require = createRequire(import.meta.url)
const polyfillModule = require.resolve(
  "next/dist/build/polyfills/polyfill-module.js"
)

describe("baseline browser build", () => {
  it("drops Next's polyfill module and strips the PostHog dist polyfill", () => {
    const configure = nextConfig.webpack
    expect(typeof configure).toBe("function")
    if (!configure) {
      throw new Error("webpack hook missing")
    }
    const result = configure(
      {
        resolve: { alias: { react: "react-alias" } },
        module: { rules: [{ test: /existing/ }] }
      },
      {} as Parameters<NonNullable<typeof nextConfig.webpack>>[1]
    )

    expect(result.resolve.alias.react).toBe("react-alias")
    expect(result.resolve.alias[polyfillModule]).toBe(false)
    expect(result.resolve.alias["../build/polyfills/polyfill-module"]).toBe(
      false
    )
    expect(
      result.resolve.alias["next/dist/build/polyfills/polyfill-module"]
    ).toBe(false)

    expect(result.module.rules).toHaveLength(2)
    const rule = result.module.rules[1] as {
      enforce?: string
      loader?: string
    }
    expect(rule.enforce).toBe("pre")
    expect(rule.loader).toContain("strip-baseline-polyfills-loader.cjs")
  })
})
