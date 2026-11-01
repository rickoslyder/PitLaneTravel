import { readFileSync } from "node:fs"
import path from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { maskedBuyUrl, openUrlInNewTab } from "./open-buy-link"

describe("ticket buy navigation", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("uses the masked URL when the click creates one", async () => {
    await expect(
      maskedBuyUrl("https://seller.example/race", async () => ({
        isSuccess: true,
        data: "https://pitlane.example/api/redirect/abc"
      }))
    ).resolves.toBe("https://pitlane.example/api/redirect/abc")
  })

  it("keeps the seller URL when the click cannot create a redirect", async () => {
    await expect(
      maskedBuyUrl("https://seller.example/race", async () => ({
        isSuccess: false
      }))
    ).resolves.toBe("https://seller.example/race")

    await expect(
      maskedBuyUrl("https://seller.example/race", async () => {
        throw new Error("db down")
      })
    ).resolves.toBe("https://seller.example/race")
  })

  it("opens the resolved URL in a new tab without reading the window handle", () => {
    const open = vi.fn(() => null)
    vi.stubGlobal("window", { open })

    openUrlInNewTab("https://pitlane.example/api/redirect/abc")

    expect(open).toHaveBeenCalledWith(
      "https://pitlane.example/api/redirect/abc",
      "_blank",
      "noopener,noreferrer"
    )
  })

  it("does not open a blank tab or leave the race page on click", () => {
    const source = readFileSync(
      path.join(process.cwd(), "components/races/tickets/TicketCard.tsx"),
      "utf8"
    )

    expect(source).not.toMatch(/window\.open\(\s*["']["']/)
    expect(source).not.toMatch(/location\.assign/)
    expect(source).not.toMatch(/useEffect/)
    expect(source).toMatch(/maskedBuyUrl/)
    expect(source).toMatch(/openUrlInNewTab/)
    expect(source).toMatch(/generateMaskedUrlAction/)
  })
})