import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { TrackMap } from "@/components/races/track-map"

const ABU_DHABI_MAP =
  "https://vsszkzazjhvlecyryzon.supabase.co/storage/v1/object/public/circuit_maps/abu_dhabi_circuit.png"

describe("TrackMap", () => {
  it("renders nothing without a map url", () => {
    expect(
      renderToStaticMarkup(
        createElement(TrackMap, { trackMapUrl: null, name: "Yas Marina" })
      )
    ).toBe("")
  })

  it("serves the circuit map through next/image, lazy, inside the 16:9 frame", () => {
    const html = renderToStaticMarkup(
      createElement(TrackMap, {
        trackMapUrl: ABU_DHABI_MAP,
        name: "Yas Marina Circuit"
      })
    )

    expect(html).toContain("aspect-[16/9]")
    expect(html).toContain('alt="Yas Marina Circuit track map"')
    expect(html).toContain("data-nimg")
    expect(html).toContain('loading="lazy"')
    expect(html.toLowerCase()).not.toContain("fetchpriority")
    expect(html).not.toContain('priority="true"')
    expect(html).not.toMatch(
      /<img[^>]*src="https:\/\/vsszkzazjhvlecyryzon\.supabase\.co/
    )
    expect(html).toContain(encodeURIComponent(ABU_DHABI_MAP))
  })
})
