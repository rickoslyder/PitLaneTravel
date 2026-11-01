import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { brand, brandCopy, brandPackagesLive } from "@/config/brand"
import { siteCopy } from "@/config/site-copy"

const fiveSeries = [/Formula 1|\bF1\b/, /Formula E/, /MotoGP/, /IndyCar/, /\bWEC\b/]
const noneBan = /VIP|hospitality|packages? (and|,)/i

describe("brandCopy", () => {
  it("keeps the tagline in both states", () => {
    expect(brand.tagline).toBe("Go like you've been before.")
    expect(brandCopy(false).tagline).toBe(brand.tagline)
    expect(brandCopy(true).tagline).toBe(brand.tagline)
  })

  it("matches the None and Live brand strings", () => {
    expect(brandCopy(false).homeTitleTerms).toBe("F1 & MotoGP Tickets and Race Guides")
    expect(brandCopy(true).homeTitleTerms).toBe(
      "F1 & MotoGP Packages, Tickets & Hospitality"
    )
    expect(brandCopy(false).positioningShort).toBe(
      "Go like you've been before. Tickets and race guides for Formula 1, MotoGP, IndyCar, WEC and Formula E."
    )
    expect(brandCopy(true).positioningShort).toBe(
      "Go like you've been before. Tickets and race guides for Formula 1, MotoGP, IndyCar, WEC and Formula E, plus F1 and MotoGP packages and VIP hospitality."
    )
    expect(brandCopy(false).description).toBe(
      "Tickets and race travel guides for F1, MotoGP, IndyCar, WEC and Formula E. Where to sit, where to stay and the quickest way home after the flag."
    )
    expect(brandCopy(true).description).toBe(
      "F1 and MotoGP race packages and VIP hospitality, plus tickets and travel guides for IndyCar, WEC and Formula E. Where to sit, stay and get home."
    )
    expect(brandCopy(false).shortDescription).toBe(
      "Go like you've been before: tickets and race guides for Formula 1, MotoGP, IndyCar, WEC and Formula E."
    )
    expect(brandCopy(true).shortDescription).toBe(
      "Go like you've been before: F1 and MotoGP packages and VIP hospitality, plus tickets and race guides for IndyCar, WEC and Formula E."
    )
    expect([...brandCopy(false).seriesKeywords]).toEqual([
      "F1 travel",
      "Formula 1 calendar",
      "MotoGP travel",
      "Formula E travel",
      "IndyCar travel",
      "WEC travel",
      "grandstand guides",
      "race calendar",
      "race weekend planning",
      "F1 tickets",
      "MotoGP tickets",
      "race travel guides"
    ])
    expect([...brandCopy(true).seriesKeywords]).toEqual([
      ...brandCopy(false).seriesKeywords,
      "F1 packages",
      "MotoGP packages",
      "F1 hospitality",
      "MotoGP hospitality"
    ])
    expect(brandPackagesLive.seriesKeywords).toEqual(brandCopy(true).seriesKeywords)
  })

  it("keeps both positioning lines long enough to name every series", () => {
    for (const live of [false, true]) {
      const copy = brandCopy(live)
      expect(copy.positioningShort.length).toBeGreaterThan(40)
      for (const pattern of fiveSeries) {
        expect(copy.positioningShort).toMatch(pattern)
      }
    }
  })

  it("keeps VIP and hospitality wording out of the None brand copy", () => {
    const none = brandCopy(false)
    const blob = [
      none.homeTitleTerms,
      none.positioningShort,
      none.description,
      none.shortDescription,
      ...none.seriesKeywords
    ].join("\n")
    expect(blob).not.toMatch(noneBan)
    expect(blob).not.toContain("See F1 & MotoGP packages")
  })
})

describe("siteCopy", () => {
  it("keeps VIP, hospitality, and the packages CTA out of the None state", () => {
    const blob = JSON.stringify(siteCopy(false))
    expect(blob).not.toMatch(noneBan)
    expect(blob).not.toContain("See F1 & MotoGP packages")
  })

  it("ships the filled Packages live lines only in the live state", () => {
    const live = siteCopy(true)
    const none = siteCopy(false)
    expect(live.aboutMission).toBe(
      "PitLane Travel brings the race weekend together for Formula 1, MotoGP, IndyCar, WEC and Formula E fans: the calendar, the circuit, the seats and the tickets. For F1 and MotoGP, you can also book a race package or VIP hospitality through PitLane. Each package names the travel company that provides it before you book."
    )
    expect(none.aboutMission).toBe(
      "PitLane Travel brings the race weekend together for Formula 1, MotoGP, IndyCar, WEC and Formula E fans: the calendar, the circuit, the seats and the tickets, plus how to get there and back."
    )
    expect(live.whyChoose.cards[2]).toEqual({
      title: "F1 and MotoGP packages and VIP hospitality",
      description:
        "Ticket, hotel and flights in one booking, or go VIP, through PitLane.",
      details: "Each package names the travel company that provides it before you book."
    })
    expect(none.whyChoose.cards[2]?.title).toBe("Get out on time")
    expect(live.homeFaqs.map(item => item.question)).toContain(
      "Can I book a race package or VIP hospitality?"
    )
    expect(none.homeFaqs.map(item => item.question)).not.toContain(
      "Can I book a race package or VIP hospitality?"
    )
    expect(
      live.homeFaqs.find(item => item.question === "Who am I buying from?")?.answer
    ).toContain(
      "F1 and MotoGP packages and VIP hospitality are booked through PitLane and provided by a specialist travel company."
    )
    expect(
      none.homeFaqs.find(item => item.question === "Who am I buying from?")?.answer
    ).toBe(
      "Tickets come from the seller named on the button, and you buy from them directly. Their refund terms apply, so check them before you pay."
    )
    expect(live.packagesLede).toBe(none.packagesLede)
    expect(none.packagesLede).toBe(
      "Race packages for F1 and MotoGP are on the way. In the meantime, find your race and get tickets."
    )
  })

  it("keeps the about lede strings in the about page source", () => {
    const about = readFileSync(
      path.join(process.cwd(), "app/(marketing)/about/page.tsx"),
      "utf8"
    )
    expect(about).toContain(siteCopy(false).aboutLede)
    expect(about).toContain(siteCopy(true).aboutLede)
  })
})
