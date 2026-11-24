import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { WhereToSit } from "./where-to-sit"

describe("where to sit", () => {
  it("links the circuit grandstand guide", () => {
    const href = "/circuits/yas-marina-circuit/grandstands"
    const html = renderToStaticMarkup(
      createElement(WhereToSit, {
        href,
        circuitName: "Yas Marina Circuit"
      })
    )

    expect(html).toContain("Where to sit")
    expect(html).toContain("Grandstand guide for Yas Marina Circuit.")
    expect(html).toContain(`href="${href}"`)
    expect(html).toContain("bg-card")
    expect(html).not.toContain("/go/")
    expect(html).not.toContain("/api/redirect/")
  })
})
