import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import {
  officialTicketSellerUrl,
  officialTicketSellers
} from "./official-ticket-sellers"

describe("official ticket sellers", () => {
  it("starts with no sourced series URLs", () => {
    const source = readFileSync(
      path.join(process.cwd(), "config/official-ticket-sellers.ts"),
      "utf8"
    )
    expect(officialTicketSellers).toEqual({})
    expect(officialTicketSellerUrl("f1")).toBeNull()
    expect(officialTicketSellerUrl("formula-e")).toBeNull()
    expect(source).not.toContain("tickets.formula1.com")
  })

  it("returns a URL only when that series slug is in the map", () => {
    const sellers = { f1: "https://tickets.example/f1" }
    expect(officialTicketSellerUrl("f1", sellers)).toBe(
      "https://tickets.example/f1"
    )
    expect(officialTicketSellerUrl(" F1 ", sellers)).toBe(
      "https://tickets.example/f1"
    )
    expect(officialTicketSellerUrl("wec", sellers)).toBeNull()
    expect(officialTicketSellerUrl(null, sellers)).toBeNull()
  })
})
