import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import {
  fanTipsForRaceSlug,
  fanTipsStatusText,
  visibleFanTipSlots,
  type FanTipsBox
} from "@/content/fan-tips"
import { abuDhabiGrandPrix2026FanTips } from "@/content/fan-tips/abu-dhabi-grand-prix-2026"
import { qatarGrandPrix2026FanTips } from "@/content/fan-tips/qatar-grand-prix-2026"
import { FanTipsBoxView, FanTipsSection } from "./fan-tips-section"

const QATAR_SLUG = "qatar-grand-prix-2026-f1-2026"
const ABU_DHABI_SLUG = "abu-dhabi-grand-prix-2026-f1-2026"

function markup(tips: FanTipsBox) {
  return renderToStaticMarkup(createElement(FanTipsBoxView, { tips }))
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
}

describe("fan tips slots", () => {
  it("leaves out a slot that has no bullets, including its edition and note", () => {
    const tips: FanTipsBox = {
      raceSlug: "example-grand-prix",
      heading: "What fans wish they'd known: Example Grand Prix",
      calendarVerifiedOn: "2026-10-31",
      statusLine: "Status line stays.",
      leads: [],
      slots: [
        {
          id: "getting-out",
          title: "Getting out",
          bullets: ["Leave before the podium. (2025)"]
        },
        {
          id: "queues",
          title: "Queues to expect",
          edition: "(should not render)",
          bullets: [],
          note: "This empty-slot note must not render."
        },
        {
          id: "what-you-can-bring",
          title: "What you can bring",
          bullets: ["   "]
        }
      ],
      footer: "Based on 1 fan report. Last checked 31 Oct 2026.",
      sources: [{ label: "Example thread", href: "https://redd.it/example" }]
    }

    expect(visibleFanTipSlots(tips.slots).map(slot => slot.title)).toEqual([
      "Getting out"
    ])

    const html = markup(tips)
    expect(html).toContain("Getting out")
    expect(html).toContain("Leave before the podium. (2025)")
    expect(html).not.toContain("Queues to expect")
    expect(html).not.toContain("What you can bring")
    expect(html).not.toContain("should not render")
    expect(html).not.toContain("This empty-slot note must not render.")
  })
})

describe("fan tips on race pages", () => {
  it("returns nothing for a race with no fan-tips data", () => {
    expect(fanTipsForRaceSlug(null)).toBeNull()
    expect(fanTipsForRaceSlug("plt-e2e-synthetic-grand-prix")).toBeNull()
    const html = renderToStaticMarkup(
      createElement(FanTipsSection, {
        raceSlug: "plt-e2e-synthetic-grand-prix"
      })
    )
    expect(html).toBe("")
  })

  it("renders the Qatar and Abu Dhabi copy with plain external source links", () => {
    const qatar = fanTipsForRaceSlug(QATAR_SLUG)
    const abuDhabi = fanTipsForRaceSlug(ABU_DHABI_SLUG)
    expect(qatar).toBe(qatarGrandPrix2026FanTips)
    expect(abuDhabi).toBe(abuDhabiGrandPrix2026FanTips)

    for (const tips of [qatar!, abuDhabi!]) {
      expect(visibleFanTipSlots(tips.slots)).toHaveLength(7)
      const html = markup(tips)
      expect(html).toContain(`>${tips.heading}<`)
      expect(html).toContain(fanTipsStatusText(tips))
      expect(html).toContain("On the official F1 calendar as of Oct 31, 2026.")
      expect(html).toContain(tips.footer)
      expect(html).not.toContain("sponsored")
      expect(html).not.toContain("/api/redirect")
      for (const source of tips.sources) {
        expect(html).toContain(`href="${source.href}"`)
        expect(html).toContain('target="_blank"')
        expect(html).toContain('rel="noopener noreferrer"')
        expect(html).toContain(`>${source.label}<`)
      }
    }

    const qatarHtml = markup(qatar!)
    expect(qatarHtml).toContain(
      "(Lusail 2026 ticket terms plus the 2024 itemised list. Lusail hasn't published a 2026 banned-items list.)"
    )
    expect(qatarHtml).toContain(
      "Based on 16 fan reports from r/GrandPrixTravel, Nov 2024–Nov 2025. Last checked 31 Oct 2026."
    )
    expect(qatarHtml).toContain("Book refundable rooms if you can.")

    const abuDhabiHtml = markup(abuDhabi!)
    expect(abuDhabiHtml).toContain("(abudhabigp.com 2026 FAQ)")
    expect(abuDhabiHtml).toContain(
      "Based on reports from 13 fans on r/GrandPrixTravel, Dec 2024–Feb 2026. Last checked 31 Oct 2026."
    )
    expect(abuDhabiHtml).not.toContain("Book refundable rooms if you can.")
  })

  it("does not render a bracketed placeholder", () => {
    const publishDate = "[" + "publish date" + "]"
    const boxes = [
      fanTipsForRaceSlug(QATAR_SLUG),
      fanTipsForRaceSlug(ABU_DHABI_SLUG)
    ]
    for (const tips of boxes) {
      const text = markup(tips!).replace(/<[^>]+>/g, " ")
      expect(text).not.toContain(publishDate)
      expect(text).not.toMatch(/\[[^\]]*[A-Za-z][^\]]*\]/)
      expect(text).toContain("Oct 31, 2026")
    }
  })
})
