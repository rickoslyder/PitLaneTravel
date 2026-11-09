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

/** Same partition as the 3 Nov count: a row that names both labels counts as Reported. */
function statusBucket(
  status: string
): "Confirmed" | "Reported" | "Not announced" {
  if (status.includes("Not announced")) return "Not announced"
  if (status.includes("Reported")) return "Reported"
  if (status.includes("Confirmed")) return "Confirmed"
  throw new Error(`Unclassified ticket status: ${status}`)
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
    expect(guide!.body).toContain("Our only affiliate link here is to Airalo")
    expect(guide!.body).toContain("https://airalo.pxf.io/PzEM6e")
    expect(guide!.updatedAt).toBe("2026-11-09")

    const buckets = {
      Confirmed: 0,
      Reported: 0,
      "Not announced": 0
    }
    for (const row of f1TicketSales2027) {
      buckets[statusBucket(row.status)] += 1
    }
    expect(buckets).toEqual({
      Confirmed: 16,
      Reported: 3,
      "Not announced": 5
    })
    expect(
      f1TicketSales2027
        .filter(row => statusBucket(row.status) === "Reported")
        .map(row => row.race)
    ).toEqual([
      "Portugal (18–20 Jun)",
      "Hungary (30 Jul–1 Aug)",
      "São Paulo (5–7 Nov, sprint)"
    ])
    expect(
      f1TicketSales2027
        .filter(row => statusBucket(row.status) === "Not announced")
        .map(row => row.race.split(" (")[0])
    ).toEqual(["China", "Türkiye", "Las Vegas", "Qatar", "Abu Dhabi"])
    expect(guide!.body).toContain(
      "**Count on 9 Nov 2026:** 16 Confirmed, 3 Reported (Portugal, Hungary's opening date, and São Paulo's phase dates) and 5 Not announced."
    )
    const nextSales = guide!.body.split("## Next sales to watch")[1] ?? ""
    expect(nextSales.indexOf("**Suzuka:")).toBeLessThan(
      nextSales.indexOf("**Azerbaijan")
    )
    expect(nextSales.indexOf("**Mexico City:")).toBeLessThan(
      nextSales.indexOf("**São Paulo Amex:")
    )
    expect(nextSales.indexOf("**São Paulo Amex:")).toBeLessThan(
      nextSales.indexOf("**São Paulo general sale:")
    )
    expect(nextSales.indexOf("**São Paulo general sale:")).toBeLessThan(
      nextSales.indexOf("**Singapore:")
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

    const saoPaulo = f1TicketSales2027.find(row =>
      row.race.startsWith("São Paulo")
    )
    expect(saoPaulo?.status).toBe(
      "On sale: **Confirmed**. Phase dates: **Reported**"
    )
    expect(saoPaulo?.onSaleDate).toContain(
      "Porto Bank cardholders from Mon 9 Nov 2026, 12:00 BRT / 15:00 UK (reported)"
    )
    expect(saoPaulo?.onSaleDate).toContain(
      "Amex Thu 12 Nov 2026, 12:00 BRT / 15:00 UK (reported)"
    )
    expect(saoPaulo?.onSaleDate).toContain(
      "General sale Mon 16 Nov 2026, 12:00 BRT / 15:00 UK (reported)"
    )
    expect(saoPaulo?.onSaleDate).toContain("Limit 4 per CPF (reported)")
    expect(saoPaulo?.onSaleDate).toContain("Eventim")
    expect(saoPaulo?.seller).toContain("Eventim")
    expect(saoPaulo?.source).toContain("https://www.eventim.com.br/f1saopaulo")

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
