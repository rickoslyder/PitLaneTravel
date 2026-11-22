import type { ReactNode } from "react"
import {
  IllustrationCredit,
  PhotoCredit,
  type GuideArt,
  type GuideFigureModel
} from "@/components/guides/guide-figure"

export type GuideAnchor =
  | { kind: "before-heading"; id: string }
  | { kind: "after-heading"; id: string }
  | { kind: "end-of-section"; id: string }
  | { kind: "after-table"; id: string }
  | { kind: "after-list"; id: string }
  | { kind: "before-text"; text: string }
  | { kind: "after-text"; text: string }

type GuideFigureDef = GuideFigureModel & { anchor: GuideAnchor }

export type GuideSegment =
  | { kind: "markdown"; text: string; answerFirst: boolean }
  | { kind: "figure"; figure: GuideFigureModel }

const CC_BY_2 = "https://creativecommons.org/licenses/by/2.0"
const ABU_DHABI = "abu-dhabi-grand-prix-travel-guide"
const AFFILIATE_NOTE = "Some links on this page are affiliate links"

function art(
  folder: string,
  file: string,
  width: number,
  height: number
): GuideArt {
  return {
    webp: `/images/guides/${folder}/${file}.webp`,
    jpg: `/images/guides/${folder}/${file}.jpg`,
    width,
    height
  }
}

function define(input: {
  id: string
  folder: string
  alt: string
  caption: string
  credit: ReactNode
  mobile: [number, number]
  desktop: [number, number]
  anchor: GuideAnchor
  priority?: boolean
}): GuideFigureDef {
  return {
    id: input.id,
    alt: input.alt,
    caption: input.caption,
    credit: input.credit,
    mobile: art(
      input.folder,
      `${input.id}-mobile-800`,
      input.mobile[0],
      input.mobile[1]
    ),
    desktop: art(
      input.folder,
      `${input.id}-desktop-1600`,
      input.desktop[0],
      input.desktop[1]
    ),
    priority: input.priority ?? false,
    anchor: input.anchor
  }
}

function illustration() {
  return <IllustrationCredit />
}

const FIRST_TIMERS = `${ABU_DHABI}-first-timers`
const WHAT_TO_BRING = `${ABU_DHABI}-what-to-bring`
const WITH_KIDS = `${ABU_DHABI}-with-kids`

const figuresByRoute: Record<string, readonly GuideFigureDef[]> = {
  [`${ABU_DHABI}/first-timers`]: [
    define({
      id: "hero-floodlights",
      folder: FIRST_TIMERS,
      alt: "Floodlight masts glowing above an empty Yas Marina Circuit straight against a fiery orange and red sunset.",
      caption:
        "Floodlights at Yas Marina Circuit on a non-race evening, July 2014. The race starts at 17:00 local time and finishes under lights.",
      credit: (
        <PhotoCredit
          author="Cesar I. Martins"
          license="CC BY 2.0"
          licenseHref={CC_BY_2}
          fileHref="https://commons.wikimedia.org/wiki/File:Sunset_at_Yas_Marina_circuit_-_Abu_Dhabi_2014.jpg"
        />
      ),
      mobile: [800, 600],
      desktop: [1600, 900],
      anchor: { kind: "before-text", text: AFFILIATE_NOTE },
      priority: true
    }),
    define({
      id: "b1-three-things",
      folder: FIRST_TIMERS,
      alt: "Three things for a first Abu Dhabi Grand Prix: your ticket is only in the official Abu Dhabi GP app, with no screenshots; it includes Fanzones and general admission to the after-race concerts; and the race starts at 17:00 local time and ends under floodlights.",
      caption:
        "The three things that matter most on a first visit. Checked against the organiser\u2019s FAQ, 16 Nov 2026.",
      credit: illustration(),
      mobile: [800, 1334],
      desktop: [1600, 1438],
      anchor: { kind: "after-heading", id: "at-a-glance" }
    }),
    define({
      id: "b2-weekend-rhythm",
      folder: FIRST_TIMERS,
      alt: "Abu Dhabi race weekend rhythm, local time: Thursday 3 December, Fanzones at Main and West Oasis and no F1 sessions; Friday, Practice 1 at 13:30 and Practice 2 at 17:00; Saturday, Practice 3 at 14:30 and Qualifying at 18:00; Sunday, the race at 17:00. Concert gates at Etihad Live open at 18:00 each night.",
      caption:
        "Race weekend rhythm, local time (UTC+4). Circuit gate times are not published officially. Sources: formula1.com; Abu Dhabi GP FAQ; checked 16 Nov 2026.",
      credit: illustration(),
      mobile: [800, 1412],
      desktop: [1600, 1618],
      anchor: { kind: "after-heading", id: "race-weekend-rhythm" }
    }),
    define({
      id: "b3-ticket-includes",
      folder: FIRST_TIMERS,
      alt: "What an Abu Dhabi GP ticket includes. Every ticket: your seat or area, Fanzones and Oasis areas, and general admission to the after-race concerts. Three- and four-day tickets add one Yas Island theme-park or teamLab Phenomena day and museum entry, valid 2 to 7 December. Single-day and W Hotel or Yas Marina hospitality tickets get no extras.",
      caption:
        "What your ticket includes, 2026. Source: abudhabigp.com ticket inclusions, checked 16 Nov 2026.",
      credit: illustration(),
      mobile: [800, 1332],
      desktop: [1600, 1253],
      anchor: {
        kind: "after-text",
        text: "**What does my ticket include?**"
      }
    })
  ],
  [`${ABU_DHABI}/what-to-bring`]: [
    define({
      id: "hero-packing-list",
      folder: WHAT_TO_BRING,
      alt: "Illustrated packing list for Yas Marina: a small bag that fits under a seat, an empty refillable bottle, sunscreen, a hat and sunglasses, ear protection, a light layer for after sunset, comfortable shoes, a charged phone with the Abu Dhabi GP app, and photo ID if buying alcohol. Leave behind outside food and drink, umbrellas, chairs, large backpacks, GoPros and drones.",
      caption:
        "What to pack for a December race day at Yas Marina. Based on the organiser\u2019s 2026 FAQ, checked 16 Nov 2026.",
      credit: illustration(),
      mobile: [800, 1834],
      desktop: [1600, 1830],
      anchor: { kind: "before-text", text: AFFILIATE_NOTE }
    }),
    define({
      id: "b1-yes-no-board",
      folder: WHAT_TO_BRING,
      alt: "Can I bring it to Yas Marina? Yes: a small under-seat bag, an empty refillable bottle, a phone, a stills camera 30 cm or shorter with lens, a flag with a handle of 1 m or less, and baby or medical food. No: large backpacks and coolers, outside food and drink, alcohol, chairs, umbrellas bought outside, video cameras, GoPros and drones. Not published: pushchairs, aerosol sunscreen and power banks.",
      caption:
        "Quick answers from the organiser\u2019s 2026 FAQ, 16 Nov 2026. Gate staff have the final say.",
      credit: illustration(),
      mobile: [800, 1866],
      desktop: [1600, 1468],
      anchor: { kind: "after-heading", id: "can-i-bring" }
    }),
    define({
      id: "b2-camera-rule",
      folder: WHAT_TO_BRING,
      alt: "Camera rule at Yas Marina: a stills camera is allowed if the body and lens together are 30 cm or shorter. Phones are allowed for personal photos. Video cameras and GoPro-type devices are banned, and professional kit needs prior consent.",
      caption:
        "The 30 cm limit includes the lens. Source: Abu Dhabi GP FAQ and conditions of entry, checked 16 Nov 2026.",
      credit: illustration(),
      mobile: [800, 1232],
      desktop: [1600, 1468],
      anchor: {
        kind: "after-text",
        text: "Phones are allowed as personal devices"
      }
    }),
    define({
      id: "b3-day-to-night",
      folder: WHAT_TO_BRING,
      alt: "December at Yas Marina: a mean daily high of 26.5°C for the afternoon sessions and a mean daily low of 15.7°C after sunset, so pack sun protection and a light layer.",
      caption:
        "December climate normals for Abu Dhabi International Airport, 1991–2020 (WMO via NOAA).",
      credit: illustration(),
      mobile: [800, 912],
      desktop: [1600, 1010],
      anchor: {
        kind: "after-heading",
        id: "packing-list-for-a-december-race-day"
      }
    })
  ],
  [`${ABU_DHABI}/with-kids`]: [
    define({
      id: "hero-kids-go-free",
      folder: WITH_KIDS,
      alt: "Kids Go Free Friday, 4 December 2026: one 4-day ticket holder aged 21 or over can bring up to four children aged 3 to 12 free. Under-3s go free with no ticket, and ear protection is highly recommended.",
      caption:
        "Kids Go Free Friday, 4 Dec 2026. Terms apply, and covered zones are not published. Source: abudhabigp.com ticket inclusions, checked 16 Nov 2026.",
      credit: illustration(),
      mobile: [800, 1116],
      desktop: [1600, 1278],
      anchor: { kind: "before-text", text: AFFILIATE_NOTE }
    }),
    define({
      id: "b1-age-ladder",
      folder: WITH_KIDS,
      alt: "Age rules at the Abu Dhabi Grand Prix: ages 0 to 2 free with no ticket; 3 and over need a ticket; some venues are 12+; after-parties and buying alcohol are 21+ with photo ID. No age rule is published for the concerts.",
      caption:
        "Age rules from the organiser\u2019s FAQ, 16 Nov 2026. No concert age rule is published.",
      credit: illustration(),
      mobile: [800, 1126],
      desktop: [1600, 1155],
      anchor: { kind: "after-heading", id: "age-limits-and-evenings" }
    }),
    define({
      id: "b2-family-kit",
      folder: WITH_KIDS,
      alt: "Family kit for Yas Marina: ear defenders for each child, baby food (allowed), a refillable water bottle, hats and sun protection, a charged phone, and an agreed meeting spot. Pushchair and power-bank rules are not published.",
      caption:
        "The organiser highly recommends headphones for kids. Pushchair and power-bank rules aren\u2019t published; check the app or an AskYAS point.",
      credit: illustration(),
      mobile: [800, 1526],
      desktop: [1600, 1455],
      anchor: { kind: "end-of-section", id: "food-noise-and-comfort" }
    }),
    define({
      id: "b3-which-day",
      folder: WITH_KIDS,
      alt: "Which day with kids: Thursday 3 December is quieter, with Fanzones and no F1 sessions; Friday 4 is best for families, with the official family programme and Kids Go Free; Saturday 5 runs later, with qualifying at 18:00; Sunday 6 is latest, with the race at 17:00.",
      caption:
        "Our view, not an official ranking. Session times: formula1.com.",
      credit: illustration(),
      mobile: [800, 1040],
      desktop: [1600, 1020],
      anchor: { kind: "end-of-section", id: "on-the-day-with-children" }
    })
  ]
}

export function guideHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

function headingLineIndex(source: string, id: string): number {
  let offset = 0
  for (const line of source.split("\n")) {
    const match = /^(#{2,3}) (.+)$/.exec(line)
    if (match && guideHeadingId(match[2]) === id) return offset
    offset += line.length + 1
  }
  return -1
}

function nextHeadingIndex(source: string, from: number): number {
  const rel = source.slice(from).search(/\n#{2,3} /)
  if (rel < 0) return -1
  return from + rel + 1
}

function locate(source: string, anchor: GuideAnchor): number {
  if (anchor.kind === "before-heading")
    return headingLineIndex(source, anchor.id)
  if (anchor.kind === "after-heading") {
    const start = headingLineIndex(source, anchor.id)
    if (start < 0) return -1
    const lineEnd = source.indexOf("\n", start)
    return lineEnd < 0 ? source.length : lineEnd + 1
  }
  if (anchor.kind === "end-of-section") {
    const start = headingLineIndex(source, anchor.id)
    if (start < 0) return -1
    const lineEnd = source.indexOf("\n", start)
    const next = nextHeadingIndex(source, lineEnd + 1)
    return next < 0 ? source.length : next
  }
  if (anchor.kind === "after-table" || anchor.kind === "after-list") {
    const start = headingLineIndex(source, anchor.id)
    if (start < 0) return -1
    const lineEnd = source.indexOf("\n", start)
    const next = nextHeadingIndex(source, lineEnd + 1)
    const regionEnd = next < 0 ? source.length : next
    if (anchor.kind === "after-table") {
      const region = source.slice(lineEnd + 1, regionEnd)
      const tableRel = region.search(/^\|/m)
      if (tableRel < 0) return -1
      let index = lineEnd + 1 + tableRel
      while (index < regionEnd) {
        const end = source.indexOf("\n", index)
        const line = source.slice(index, end < 0 ? source.length : end)
        if (!line.startsWith("|")) break
        if (end < 0) return source.length
        index = end + 1
      }
      return index
    }
    let index = lineEnd + 1
    let lastListEnd = -1
    while (index < regionEnd) {
      const end = source.indexOf("\n", index)
      const lineEndAt = end < 0 ? source.length : end
      const line = source.slice(index, lineEndAt)
      if (/^(?:- |\d+\. )/.test(line)) {
        lastListEnd = end < 0 ? source.length : end + 1
      }
      if (end < 0) break
      index = end + 1
    }
    return lastListEnd
  }
  const at = source.indexOf(anchor.text)
  if (at < 0) return -1
  if (anchor.kind === "before-text") {
    const prev = source.lastIndexOf("\n\n", at)
    return prev < 0 ? 0 : prev + 2
  }
  const next = source.indexOf("\n\n", at)
  return next < 0 ? source.length : next + 2
}

export function segmentGuide(routeKey: string, source: string): GuideSegment[] {
  const figures = figuresByRoute[routeKey] ?? []
  const cuts = figures.map(figure => {
    const index = locate(source, figure.anchor)
    if (index < 0) {
      throw new Error(
        `Guide figure ${routeKey} ${figure.id} anchor was not found`
      )
    }
    return { figure, index }
  })
  cuts.sort((left, right) => left.index - right.index)
  const segments: GuideSegment[] = []
  let cursor = 0
  let markdownCount = 0
  for (const cut of cuts) {
    if (cut.index < cursor) {
      throw new Error(
        `Guide figure ${routeKey} ${cut.figure.id} overlaps an earlier figure`
      )
    }
    const text = source.slice(cursor, cut.index)
    if (text.trim().length > 0) {
      segments.push({
        kind: "markdown",
        text,
        answerFirst: markdownCount === 0
      })
      markdownCount += 1
    }
    const { anchor: _anchor, ...figure } = cut.figure
    segments.push({ kind: "figure", figure })
    cursor = cut.index
  }
  const rest = source.slice(cursor)
  if (rest.trim().length > 0) {
    segments.push({
      kind: "markdown",
      text: rest,
      answerFirst: markdownCount === 0
    })
  }
  return segments
}

export function guideFigureAssetPaths(): string[] {
  return Object.values(figuresByRoute).flatMap(figures =>
    figures.flatMap(figure => [
      figure.mobile.webp,
      figure.mobile.jpg,
      figure.desktop.webp,
      figure.desktop.jpg
    ])
  )
}

export function guideFigureCopy(): Array<{
  routeKey: string
  id: string
  alt: string
  caption: string
}> {
  return Object.entries(figuresByRoute).flatMap(([routeKey, figures]) =>
    figures.map(figure => ({
      routeKey,
      id: figure.id,
      alt: figure.alt,
      caption: figure.caption
    }))
  )
}
