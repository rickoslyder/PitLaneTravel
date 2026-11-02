import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { f1TicketSaleFaq } from "@/data/guides/f1-2027-ticket-on-sale-faq"
import { f1TicketSales2027 } from "@/data/guides/f1-2027-ticket-sales"
import { getGuide } from "./guides"

function visibleFaq(body: string): Array<{ name: string; text: string }> {
  const faq = body.split("## FAQ")[1]?.split("## Change log")[0] ?? ""
  const blocks = faq
    .split(/\n\*\*/)
    .map(block => block.trim())
    .filter(Boolean)
  return blocks.map(block => {
    const [nameLine, ...rest] = block.split("\n")
    return {
      name: nameLine.replace(/\*\*$/, "").trim(),
      text: rest.join("\n").trim()
    }
  })
}

describe("2027 F1 ticket on-sale guide", () => {
  it("keeps 24 typed rows, including F1 store links", () => {
    expect(f1TicketSales2027).toHaveLength(24)
    const china = f1TicketSales2027.find(row => row.race.startsWith("China"))
    expect(china?.source).toContain("https://ticketing.formula1.com/china/")
    expect(
      f1TicketSales2027.some(row =>
        row.source.includes("https://ticketing.formula1.com/abu-dhabi/")
      )
    ).toBe(true)
  })

  it("matches the visible FAQ word for word and does not emit VideoObject", () => {
    const guide = getGuide("f1-2027-ticket-on-sale-dates")
    expect(guide).not.toBeNull()
    expect(guide!.body).toContain("{{f1-2027-ticket-sales}}")
    expect(guide!.body).not.toContain("| Race (2027) |")
    expect(guide!.body).not.toContain("VideoObject")
    expect(guide!.body).not.toContain("buying-f1-tickets-safely")
    expect(guide!.body).toContain(
      "Our only affiliate link here is to Airalo"
    )
    expect(guide!.body).toContain("https://airalo.pxf.io/PzEM6e")

    const visible = visibleFaq(guide!.body)
    expect(f1TicketSaleFaq["@type"]).toBe("FAQPage")
    expect(f1TicketSaleFaq.mainEntity).toHaveLength(visible.length)
    f1TicketSaleFaq.mainEntity.forEach((entity, index) => {
      expect(entity.name).toBe(visible[index].name)
      expect(entity.acceptedAnswer.text).toBe(visible[index].text)
    })

    const source = readFileSync(
      path.join(
        process.cwd(),
        "content/guides/f1-2027-ticket-on-sale-dates.mdx"
      ),
      "utf8"
    )
    expect(source).not.toContain("<!--")
  })
})