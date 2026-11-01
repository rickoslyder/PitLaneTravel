import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

describe("ticket redirect robots header", () => {
  it("sends X-Robots-Tag noindex, nofollow on every response", () => {
    const source = readFileSync(
      path.join(process.cwd(), "app/api/redirect/[slug]/route.ts"),
      "utf8"
    )
    expect(source).toMatch(/X-Robots-Tag/)
    expect(source).toMatch(/noindex, nofollow/)
    expect(source.match(/withRobotsTag\(/g)?.length).toBeGreaterThanOrEqual(3)
  })
})
