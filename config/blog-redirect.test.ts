import { describe, expect, it } from "vitest"
import nextConfig from "../next.config.mjs"

describe("blog redirects", () => {
  it("permanently redirects /blog and nested paths to /guides", async () => {
    expect(typeof nextConfig.redirects).toBe("function")
    const redirects = await nextConfig.redirects?.()
    expect(redirects).toEqual(
      expect.arrayContaining([
        { source: "/blog", destination: "/guides", permanent: true },
        { source: "/blog/:path*", destination: "/guides", permanent: true }
      ])
    )
  })
})
