import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import {
  SERIES_CARD_IMAGE_QUALITY,
  SERIES_CARD_LCP_PRELOAD_MEDIA,
  SERIES_CARD_MOBILE_WIDTH,
  SERIES_CARD_SIZES,
  seriesCardMobileImageHref,
  seriesCardSelectedWidth
} from "@/lib/series-card-image"

describe("series card mobile image", () => {
  it("builds the next/image URL the priority card and the preload both use", () => {
    const src =
      "https://vsszkzazjhvlecyryzon.supabase.co/storage/v1/object/public/circuit_images/photo.webp"
    expect(seriesCardMobileImageHref(src)).toBe(
      `/_next/image?url=${encodeURIComponent(src)}&w=${SERIES_CARD_MOBILE_WIDTH}&q=${SERIES_CARD_IMAGE_QUALITY}`
    )
    expect(SERIES_CARD_MOBILE_WIDTH).toBe(640)
    expect(SERIES_CARD_IMAGE_QUALITY).toBe(65)
  })

  it("selects the 640 candidate for the Lighthouse mobile frame", () => {
    // 412 CSS px, DPR 1.75, page p-4 + card header p-6.
    const slot = 412 - 16 * 2 - 24 * 2
    const devicePixels = slot * 1.75
    expect(devicePixels).toBeGreaterThan(384)
    expect(devicePixels).toBeLessThanOrEqual(SERIES_CARD_MOBILE_WIDTH)
    expect(SERIES_CARD_SIZES).toContain("calc(100vw - 5rem)")
    expect(seriesCardSelectedWidth(412, 1.75)).toBe(640)
    expect(seriesCardSelectedWidth(400, 1.5)).toBe(640)
    expect(seriesCardSelectedWidth(430, 1.75)).toBe(640)
    expect(seriesCardSelectedWidth(412, 2)).toBe(750)
    expect(seriesCardSelectedWidth(412, 3)).toBe(1080)
    expect(SERIES_CARD_LCP_PRELOAD_MEDIA).not.toContain("639px")
  })

  it("preloads that URL from the series page with a real href", () => {
    const page = readFileSync(
      path.join(process.cwd(), "app/series/[slug]/page.tsx"),
      "utf8"
    )
    expect(page).toContain("seriesCardMobileImageHref")
    expect(page).toContain('rel="preload"')
    expect(page).toContain('as="image"')
    expect(page).toContain('fetchPriority="high"')
    expect(page).toContain("SERIES_CARD_LCP_PRELOAD_MEDIA")
    expect(page).toContain("SERIES_CARD_SIZES")
    expect(page).not.toContain("getRacesAction")
    expect(page).not.toContain("listRaceIdsWithTicketListingsAction")
  })
})
