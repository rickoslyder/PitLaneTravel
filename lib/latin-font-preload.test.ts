import { describe, expect, it } from "vitest"
import { latinPreloadFromManifest } from "./latin-font-preload"

describe("latin font preload", () => {
  it("picks the preloaded latin subset", () => {
    expect(
      latinPreloadFromManifest({
        app: {
          "app/layout": [
            "static/media/other-s.woff2",
            "static/media/e4af272ccee01ff0-s.p.woff2"
          ]
        }
      })
    ).toBe("/_next/static/media/e4af272ccee01ff0-s.p.woff2")
  })

  it("returns null when the manifest has no latin subset", () => {
    expect(latinPreloadFromManifest({ app: {} })).toBeNull()
  })
})
