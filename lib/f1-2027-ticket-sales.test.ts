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
    expect(guide!.updatedAt).toBe("2026-11-03")
    expect(guide!.body).toContain(
      "**Count on 3 Nov 2026:** 16 Confirmed, 2 Reported (Portugal, and Hungary's opening date) and 6 Not announced."
    )
    const nextSales = guide!.body.split("## Next sales to watch")[1] ?? ""
    expect(nextSales.indexOf("**Suzuka:")).toBeLessThan(
      nextSales.indexOf("**Azerbaijan")
    )
    expect(nextSales.indexOf("**Mexico City:")).toBeLessThan(
      nextSales.indexOf("**Suzuka:")
    )

    const mexico = f1TicketSales2027.find(row =>
      row.race.startsWith("Mexico City")
    )
    expect(mexico?.status).toBe("**Confirmed**")
    expect(mexico?.onSaleDate).toContain("5–Fri 6 Nov")
    expect(mexico?.onSaleDate).toContain("9–Tue 10 Nov")
    expect(mexico?.onSaleDate).toContain("11 Nov 2026")
    expect(mexico?.onSaleDate).toContain("Limit 8 per transaction")
    expect(mexico?.seller).toContain("Ticketmaster")

    const published = [
      guide!.body,
      ...f1TicketSales2027.flatMap(row => Object.values(row))
    ].join("\n")
    for (const word of ["Scout", "Writer", "Grawk", "HOLD", "TODO", "P1"]) {
      expect(published).not.toMatch(new RegExp(`\\b${word}\\b`))
    }
    expect(published).not.toMatch(/\bvia (Scout|Writer|Grawk)\b/)

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