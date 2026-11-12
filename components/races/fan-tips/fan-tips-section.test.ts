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
import { lasVegasGrandPrix2026FanTips } from "@/content/fan-tips/las-vegas-grand-prix-2026"
import { qatarGrandPrix2026FanTips } from "@/content/fan-tips/qatar-grand-prix-2026"
import { FanTipsBoxView, FanTipsSection } from "./fan-tips-section"

const QATAR_SLUG = "qatar-grand-prix-2026-f1-2026"
const ABU_DHABI_SLUG = "abu-dhabi-grand-prix-2026-f1-2026"
const LAS_VEGAS_SLUG = "las-vegas-grand-prix-2026-f1-2026"
const F1_2026_CALENDAR_HREF = "https://www.formula1.com/en/racing/2026"
const QATAR_STATUS =
  "The 2026 Qatar Grand Prix is on the official F1 calendar as of 11 November 2026, as Round 22, with the race on Sunday 29 November. Check formula1.com before booking non-refundable travel."
const ABU_DHABI_STATUS =
  "The 2026 Abu Dhabi Grand Prix is on the official F1 calendar as of 11 November 2026, as Round 23, with the race on Sunday 6 December. Check formula1.com before booking non-refundable travel."
const LAS_VEGAS_STATUS =
  "On the official F1 calendar as of 11 November 2026. Race: Saturday 21 November, 8 PM local. The promoter's ticket terms say all sales are final. [L2]"
const FLEXIBLE_BOOKING_LEAD =
  "If you can, book refundable or flexible fares, and a hotel you can cancel for free."
const PUBLISH_DATE_PLACEHOLDER = "[" + "publish date" + "]"
const FORBIDDEN_COPY = [
  "F1 has said it is monitoring",
  "Imola",
  "Scout",
  "HOLD",
  "TODO",
  "Grawk",
  "Writer",
  "Engineering Lead",
  PUBLISH_DATE_PLACEHOLDER
]

function markup(tips: FanTipsBox) {
  return renderToStaticMarkup(createElement(FanTipsBoxView, { tips }))
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
}

function visibleText(tips: FanTipsBox) {
  return markup(tips).replace(/<[^>]+>/g, "")
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
    expect(fanTipsStatusText(tips)).toBe(
      "On the official F1 calendar as of Oct 31, 2026. Status line stays."
    )
    expect(html).toContain("On the official F1 calendar as of Oct 31, 2026.")
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
      expect(tips.calendarVerifiedOn).toBe("2026-11-11")
      expect(visibleFanTipSlots(tips.slots)).toHaveLength(7)
      const html = markup(tips)
      const text = visibleText(tips)
      expect(html).toContain(`>${tips.heading}<`)
      expect(text).toContain(fanTipsStatusText(tips))
      expect(text).toContain("11 November 2026")
      expect(text).not.toContain("Oct 31, 2026")
      expect(text).not.toContain("Nov 11, 2026")
      expect(html).toContain(`href="${F1_2026_CALENDAR_HREF}"`)
      expect(html).toContain(">formula1.com<")
      expect(html).toContain('target="_blank"')
      expect(html).toContain('rel="noopener noreferrer"')
      expect(text).toContain(FLEXIBLE_BOOKING_LEAD)
      expect(html).toContain(tips.footer)
      expect(html).not.toContain("sponsored")
      expect(html).not.toContain("/api/redirect")
      expect(text).not.toContain("F1 has said it is monitoring")
      for (const source of tips.sources) {
        expect(html).toContain(`href="${source.href}"`)
        expect(html).toContain(`>${source.label}<`)
      }
    }

    const qatarText = visibleText(qatar!)
    expect(qatarText).toContain(QATAR_STATUS)
    expect(qatarText).toContain(
      "(Lusail 2026 ticket terms plus the 2024 itemised list. Lusail hasn't published a 2026 banned-items list.)"
    )
    expect(qatarText).toContain(
      "Based on 16 fan reports from r/GrandPrixTravel, Nov 2024–Nov 2025. Fan reports last checked 31 Oct 2026. Calendar status re-checked 11 Nov 2026."
    )
    expect(qatarText).toContain(
      `${FLEXIBLE_BOOKING_LEAD} In 2025 one fan's five-star Doha hotel booking was cancelled a week before the race, and the same fan passed on reports of another hotel doing the same. (2025; fan report, r/GrandPrixTravel, Nov 2025) [15][16]`
    )
    expect(qatarText).not.toContain("Book refundable rooms if you can.")

    const abuDhabiText = visibleText(abuDhabi!)
    expect(abuDhabiText).toContain(ABU_DHABI_STATUS)
    expect(abuDhabiText).toContain("(abudhabigp.com 2026 FAQ)")
    expect(abuDhabiText).toContain(
      "Based on reports from 13 fans on r/GrandPrixTravel, Dec 2024–Feb 2026. Fan reports last checked 31 Oct 2026. Calendar status re-checked 11 Nov 2026."
    )
    expect(abuDhabiText).toContain(FLEXIBLE_BOOKING_LEAD)
  })

  it("renders the Las Vegas box with the authored 11 November 2026 status", () => {
    const lasVegas = fanTipsForRaceSlug(LAS_VEGAS_SLUG)
    expect(lasVegas).toBe(lasVegasGrandPrix2026FanTips)
    expect(lasVegas?.calendarVerifiedOn).toBe("2026-11-11")
    expect(visibleFanTipSlots(lasVegas!.slots)).toHaveLength(7)

    const html = markup(lasVegas!)
    const text = visibleText(lasVegas!)
    expect(html).toContain(`>${lasVegas!.heading}<`)
    expect(text).toContain(LAS_VEGAS_STATUS)
    expect(text).toContain(fanTipsStatusText(lasVegas!))
    expect(text).toContain("[L1]")
    expect(text).toContain("[L2]")
    expect(text).not.toContain("Nov 11, 2026")
    expect(text).not.toContain("F1 has said it is monitoring")
    expect(html).toContain("https://f1lasvegasgp.com/plan/f1-az-guide/")
    expect(html).not.toContain("/api/redirect")
    for (const source of lasVegas!.sources) {
      expect(html).toContain(`href="${source.href}"`)
      expect(html).toContain('target="_blank"')
      expect(html).toContain('rel="noopener noreferrer"')
      expect(html).toContain(`>${source.label}<`)
    }
  })

  it("does not render a bracketed placeholder", () => {
    const boxes = [
      fanTipsForRaceSlug(QATAR_SLUG),
      fanTipsForRaceSlug(ABU_DHABI_SLUG),
      fanTipsForRaceSlug(LAS_VEGAS_SLUG)
    ]
    for (const tips of boxes) {
      const text = visibleText(tips!)
      for (const marker of FORBIDDEN_COPY) {
        expect(text).not.toContain(marker)
      }
      expect(text).not.toContain(PUBLISH_DATE_PLACEHOLDER)
      expect(text).not.toMatch(/\[[^\]]*\s[^\]]*\]/)
      expect(text).not.toMatch(/\[[^\]]*[A-Za-z]{2,}[^\]]*\]/)
      expect(text).toContain("11 November 2026")
    }
  })
})
