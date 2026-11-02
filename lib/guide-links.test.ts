import { describe, expect, it } from "vitest"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { GuideMarkdown } from "@/components/guides/guide-markdown"
import { guideAffiliateRel, isImpactAffiliateHref } from "./guide-links"

describe("guide affiliate links", () => {
  it("treats Impact hosts as affiliate links and leaves ordinary URLs alone", () => {
    expect(isImpactAffiliateHref("https://airalo.pxf.io/PzEM6e")).toBe(true)
    expect(isImpactAffiliateHref("https://f1.pxf.io/5kEv72")).toBe(true)
    expect(isImpactAffiliateHref("https://omio.sjv.io/jR09OP")).toBe(true)
    expect(
      isImpactAffiliateHref("https://www.formula1.com/en/racing/2027")
    ).toBe(false)
    expect(isImpactAffiliateHref("/races")).toBe(false)
  })

  it("uses the ticket affiliate rel and opens affiliate links in a new tab", () => {
    expect(guideAffiliateRel("https://airalo.pxf.io/PzEM6e")).toBe(
      "sponsored nofollow noopener noreferrer"
    )
    const html = renderToStaticMarkup(
      createElement(GuideMarkdown, {
        source:
          "Compare [Omio](https://omio.sjv.io/jR09OP) and [formula1.com](https://www.formula1.com/en/racing/2027)."
      })
    )
    expect(html).toContain(
      'href="https://omio.sjv.io/jR09OP" target="_blank" rel="sponsored nofollow noopener noreferrer"'
    )
    expect(html).toContain('href="https://www.formula1.com/en/racing/2027"')
    expect(html).not.toContain(
      'href="https://www.formula1.com/en/racing/2027" target="_blank" rel="sponsored'
    )
  })
})
