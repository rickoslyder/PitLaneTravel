import type { ReactNode } from "react"
import {
  IllustrationCredit,
  MapCredit,
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
const CC_BY_3 = "https://creativecommons.org/licenses/by/3.0"
const CC_BY_SA = "https://creativecommons.org/licenses/by-sa/4.0"
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

function mapCredit() {
  return <MapCredit />
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
  ],
  "abu-dhabi-grand-prix-travel-guide": [
    define({
      id: "hero-yas-sunset",
      folder: "abu-dhabi-grand-prix-travel-guide",
      alt: "Empty Yas Marina Circuit track at dusk, with a painted kerb and grass in the foreground and a row of floodlight masts under a blue and pink sky.",
      caption: "Yas Marina Circuit at dusk on a non-race evening, July 2014.",
      credit: (
        <PhotoCredit
          author="Cesar I. Martins"
          license="CC BY 2.0"
          licenseHref={CC_BY_2}
          fileHref="https://commons.wikimedia.org/wiki/File:Por_do_sol_no_circuito_Yas_Marina_-_Sunset_at_Yas_Marina_circuit_-_Abu_Dhabi_(17173577080).jpg"
        />
      ),
      mobile: [800, 600],
      desktop: [1600, 900],
      anchor: {
        kind: "before-heading",
        id: "abu-dhabi-gp-dates-and-race-times"
      },
      priority: true
    }),
    define({
      id: "b1-session-times",
      folder: "abu-dhabi-grand-prix-travel-guide",
      alt: "Abu Dhabi Grand Prix 2026 schedule in local time (UTC+4): Friday 4 December, Practice 1 at 13:30 and Practice 2 at 17:00; Saturday 5 December, Practice 3 at 14:30 and Qualifying at 18:00; Sunday 6 December, the 58-lap race at 17:00. Thursday 3 December is a ticket-holder day with no F1 sessions.",
      caption:
        "2026 session start times, local (UTC+4) with UTC. Source: formula1.com, as cited in this guide; re-check before you travel.",
      credit: illustration(),
      mobile: [800, 1306],
      desktop: [1600, 1170],
      anchor: { kind: "after-heading", id: "abu-dhabi-gp-dates-and-race-times" }
    }),
    define({
      id: "b3-exit-plan",
      folder: "abu-dhabi-grand-prix-travel-guide",
      alt: "Three ways to plan your exit after the Abu Dhabi race: stay for the concert at Etihad Live, eat on the island while queues ease, or agree a pick-up point away from the main gates. Fans reported long post-race waits at Yas Mall in 2024 and 2025.",
      caption:
        "Pick one before the race starts. Our judgement, based on the 2024–2025 fan reports cited in this guide; 2026 arrangements may differ.",
      credit: illustration(),
      mobile: [800, 1398],
      desktop: [1600, 1258],
      anchor: {
        kind: "after-text",
        text: "plan your exit before the race starts"
      }
    }),
    define({
      id: "b4-concert-nights",
      folder: "abu-dhabi-grand-prix-travel-guide",
      alt: "After-race concerts at Etihad Live, 2026: Thursday 3 December, Kings of Leon and Lewis Capaldi; Friday 4, Jennifer Lopez and Alex Warren; Saturday 5, Imagine Dragons; Sunday 6, The Chainsmokers and The Script.",
      caption:
        "2026 after-race concert line-up, as announced by the promoter. Entry is included for Grand Prix ticket holders; check the entry rules before you go.",
      credit: illustration(),
      mobile: [800, 1066],
      desktop: [1600, 1363],
      anchor: { kind: "after-list", id: "what-the-weekend-is-like" }
    })
  ],
  // The price-ladder graphic is omitted. Its pixels say a 20% early bird
  // runs until 23 November 2026, so the picture would go stale immediately.
  "azerbaijan-grand-prix-2027-tickets-travel": [
    define({
      id: "hero-maiden-tower",
      folder: "azerbaijan-grand-prix-2027-tickets-travel",
      alt: "The Maiden Tower and Old City walls in Baku at dusk, lit up against a deep blue sky, with domed stone roofs and trees in front.",
      caption:
        "The Maiden Tower (Giz Galasi) in Baku’s Old City, September 2016. Not a race-weekend photo.",
      credit: (
        <PhotoCredit
          author="Diego Delso"
          license="CC BY-SA 4.0"
          licenseHref={CC_BY_SA}
          fileHref="https://commons.wikimedia.org/wiki/File:Torre_de_la_Doncella,_Baku,_Azerbaiy%C3%A1n,_2016-09-26,_DD_212-214_HDR.jpg"
        />
      ),
      mobile: [800, 600],
      desktop: [1600, 900],
      anchor: { kind: "before-heading", id: "baku-2027-at-a-glance" }
    }),
    define({
      id: "b2-baku-locator",
      folder: "azerbaijan-grand-prix-2027-tickets-travel",
      alt: "Two-part map of Baku. Left: Heydar Aliyev International Airport (GYD) northeast of the city centre, about 30 km by road. Right: the Baku City Circuit outline running along the seafront boulevard and around the Old City, with the Maiden Tower marked.",
      caption:
        "Locator only, not a route. About 30 km by road, per the F1 ticket store. Circuit: OpenStreetMap relation 11266687. © OpenStreetMap contributors (ODbL) · Made with Natural Earth.",
      credit: mapCredit(),
      mobile: [800, 1676],
      desktop: [1600, 1345],
      anchor: { kind: "after-heading", id: "airport-to-the-city" }
    }),
    define({
      id: "b3-bulvar-night",
      folder: "azerbaijan-grand-prix-2027-tickets-travel",
      alt: "Baku’s seafront promenade at night, with lamps lighting the paving, a few people walking and the Caspian Sea to the right.",
      caption:
        "The Bulvar seafront promenade at night, May 2010. The circuit runs along it.",
      credit: (
        <PhotoCredit
          author="kikiwis"
          license="CC BY 3.0"
          licenseHref={CC_BY_3}
          fileHref="https://commons.wikimedia.org/wiki/File:Seaside_promenad._Baku._Azerbaijan._%D0%9D%D0%B0%D0%B1%D0%B5%D1%80%D0%B5%D0%B6%D0%BD%D0%B0%D1%8F._%D0%91%D0%B0%D0%BA%D1%83._%D0%90%D0%B7%D0%B5%D1%80%D0%B1%D0%B0%D0%B9%D0%B4%D0%B6%D0%B0%D0%BD_-_panoramio.jpg"
        />
      ),
      mobile: [800, 600],
      desktop: [1600, 1067],
      anchor: { kind: "after-list", id: "where-to-stay" }
    })
  ],
  "f1-2027-ticket-on-sale-dates": [
    define({
      id: "hero-status-board",
      folder: "f1-2027-ticket-on-sale-dates",
      alt: "2027 F1 ticket status for all 24 races as of 9 November 2026. On sale: Bahrain, Saudi Arabia, Australia, Miami, Monaco, Britain, Austria, Belgium, Hungary, Italy, Madrid, Azerbaijan, Austin and São Paulo. Sale date set: Japan 15 November, Singapore 11 November, Mexico City 11 November. Portugal phase 2 to be confirmed. Not announced: China, Türkiye, Las Vegas, Qatar and Abu Dhabi. Canada’s public sale postponed.",
      caption:
        "2027 ticket status for every race, as of 9 Nov 2026. Some dates have since passed; check each promoter. Portugal, Hungary’s opening date and São Paulo’s phases are reported, not confirmed.",
      credit: illustration(),
      mobile: [800, 1880],
      desktop: [1600, 2235],
      anchor: { kind: "before-heading", id: "next-sales-to-watch" }
    }),
    define({
      id: "b1-sale-day-checklist",
      folder: "f1-2027-ticket-on-sale-dates",
      alt: "Sale-day checklist: pick a race and a back-up; make your seller account before sale day; know the ticket limit; set your alarm in UK time; use one account, one device and one browser without refreshing; buy only from the official seller.",
      caption:
        "How to get ready for an F1 ticket sale. Queue advice is Ticketmaster’s for Melbourne and works for most sales.",
      credit: illustration(),
      mobile: [800, 1776],
      desktop: [1600, 1538],
      anchor: { kind: "after-heading", id: "how-to-get-ready-for-a-sale" }
    }),
    define({
      id: "b2-who-sells-what",
      folder: "f1-2027-ticket-on-sale-dates",
      alt: "Three places F1 tickets come from: the race promoter, the main seller, which sets dates and prices and is usually first; Formula 1’s official ticket store, where prices can differ; and package sellers such as F1 Experiences, where a deposit isn’t a ticket.",
      caption:
        "Who sells what. Compare the promoter and the F1 store on the day you buy.",
      credit: illustration(),
      mobile: [800, 1364],
      desktop: [1600, 1140],
      anchor: {
        kind: "after-heading",
        id: "who-sells-what-promoter-f1-store-or-package"
      }
    })
  ],
  "two-races-one-trip-2027": [
    define({
      id: "hero-europe-route-map",
      folder: "two-races-one-trip-2027",
      alt: "Map of western Europe showing the 2027 three-series run: Formula E at Brands Hatch (29–30 May, provisional) or MotoGP at Mugello (28–30 May, provisional), then F1 in Monaco (4–6 June), then the 24 Hours of Le Mans (race 12–13 June), joined in order by straight lines.",
      caption:
        "Late May to mid-June 2027. Lines show the order, not routes. MotoGP and Formula E dates are provisional. © OpenStreetMap contributors (ODbL) · Made with Natural Earth.",
      credit: mapCredit(),
      mobile: [800, 1546],
      desktop: [1600, 1820],
      anchor: {
        kind: "before-heading",
        id: "the-quick-answer-the-best-two-race-trips-in-2027"
      }
    }),
    define({
      id: "b1-pairings-timeline",
      folder: "two-races-one-trip-2027",
      alt: "Timeline from April to September 2027 of the eight best two-race pairings, with free days between events: 1 Monaco F1 then Le Mans; 2 MotoGP Mugello then Monaco; 3 Formula E Brands Hatch then Monaco; 4 Monza then Misano; 5 Zandvoort then Assen; 6 Canada, the Indy 500 and Detroit; 7 Long Beach, MotoGP Austin and Miami; 8 Silverstone then Sachsenring or Austria. Provisional dates are hatched.",
      caption:
        "The eight pairings on one 2027 timeline. Hatched bars are provisional dates. Sources: official series calendars, checked 31 Oct 2026.",
      credit: illustration(),
      mobile: [800, 1664],
      desktop: [1600, 1913],
      anchor: {
        kind: "after-table",
        id: "the-quick-answer-the-best-two-race-trips-in-2027"
      }
    }),
    define({
      id: "b2-clash-weekends",
      folder: "two-races-one-trip-2027",
      alt: "Seven 2027 clash weekends: 30 April to 2 May, F1 Miami and Formula E Monaco; 13 to 16 May, WEC Spa and MotoGP France; 28 to 30 May, the biggest clash, the Indy 500, MotoGP Mugello and Formula E Brands Hatch; 9 to 13 June, Le Mans and MotoGP Catalunya; 9 to 11 July, F1 Austria, MotoGP Sachsenring and WEC São Paulo; 10 to 12 September, F1 Madrid, MotoGP Misano and WEC COTA; 22 to 24 October, F1 Austin and MotoGP Malaysia.",
      caption:
        "Weekends where you can only pick one. MotoGP and Formula E dates are provisional.",
      credit: illustration(),
      mobile: [800, 1932],
      desktop: [1600, 1720],
      anchor: {
        kind: "after-heading",
        id: "weekends-that-clash-in-2027-so-you-can-only-pick-one"
      }
    }),
    define({
      id: "b3-north-america-map",
      folder: "two-races-one-trip-2027",
      alt: "Map of the Great Lakes region showing F1 in Montréal (21–23 May 2027), the Indy 500 at Indianapolis (30 May) and IndyCar in Detroit (4–6 June), joined in order by straight lines.",
      caption:
        "Three series in under three weeks. Lines show the order, not routes. © OpenStreetMap contributors (ODbL) · Made with Natural Earth.",
      credit: mapCredit(),
      mobile: [800, 1316],
      desktop: [1600, 1520],
      anchor: {
        kind: "after-list",
        id: "north-america-canada-the-indy-500-and-detroit"
      }
    })
  ],
  "wec-2027-launch-week": [
    define({
      id: "hero-silverstone-wing",
      folder: "wec-2027-launch-week",
      alt: "The Silverstone Wing pit building seen across the circuit’s grass and tarmac under a dusky blue sky.",
      caption:
        "The Silverstone Wing, October 2011. The 6 Hours of Silverstone returns on 23–25 April 2027.",
      credit: (
        <PhotoCredit
          author="Supermac1961"
          license="CC BY 2.0"
          licenseHref={CC_BY_2}
          fileHref="https://commons.wikimedia.org/wiki/File:The_Silverstone_%27Wing%27_as_seen_from_the_Porsche_Experience_Centre_-_Flickr_-_Supermac1961.jpg"
        />
      ),
      mobile: [800, 600],
      desktop: [1600, 900],
      anchor: {
        kind: "before-heading",
        id: "wec-launch-week-2027-at-a-glance"
      },
      priority: true
    }),
    define({
      id: "b1-season-calendar",
      folder: "wec-2027-launch-week",
      alt: "The 2027 WEC calendar: Qatar 25–27 March; Imola 9–11 April, from €55; Silverstone 23–25 April, from £95; Spa 13–15 May, from €65; Le Mans 9–13 June, week pass €126; São Paulo 9–11 July; COTA 10–12 September; Fuji 24–26 September, ¥12,000 for a three-day general admission pass; and Bahrain 4–6 November. Imola, Silverstone, Spa and Le Mans are marked as reachable from the UK without a long-haul flight.",
      caption:
        "2027 WEC rounds. Prices are official from-prices (June 2026 for Imola, Silverstone and Spa); check the seller for today’s price.",
      credit: illustration(),
      mobile: [800, 2014],
      desktop: [1600, 1728],
      anchor: { kind: "after-heading", id: "all-nine-2027-rounds-compared" }
    }),
    define({
      id: "b2-uk-reach-map",
      folder: "wec-2027-launch-week",
      alt: "Map of the UK and western Europe marking London as a reference point and four 2027 WEC rounds: Silverstone (drive or train), Spa (Eurostar and train, or drive), Le Mans (ferry or Eurostar) and Imola (short-haul flight).",
      caption:
        "Getting to the European rounds from the UK, as summarised in this guide. Locator only, not routes. © OpenStreetMap contributors (ODbL) · Made with Natural Earth.",
      credit: mapCredit(),
      mobile: [800, 1354],
      desktop: [1600, 1630],
      anchor: { kind: "after-heading", id: "getting-there-from-the-uk" }
    })
  ],
  "which-race-first-2027": [
    define({
      id: "hero-five-weekends",
      folder: "which-race-first-2027",
      alt: "Five kinds of first race: Formula 1 for the biggest spectacle (British GP, 2–4 July 2027); MotoGP for the closest racing (Mugello, 28–30 May, provisional); Le Mans for a 24-hour festival (race 12–13 June); Formula E for an easy race day (Brands Hatch, 29–30 May, provisional); and the Indy 500 for scale and tradition (30 May).",
      caption:
        "Pick the series by the weekend you want. Our editorial summary; MotoGP and Formula E dates are provisional.",
      credit: illustration(),
      mobile: [800, 1486],
      desktop: [1600, 1820],
      anchor: {
        kind: "before-heading",
        id: "the-quick-answer-match-the-series-to-the-weekend-you-want"
      }
    }),
    define({
      id: "b1-fan-type-cards",
      folder: "which-race-first-2027",
      alt: "Which first race suits you? On a budget: MotoGP at Silverstone or Formula E at Brands Hatch. With kids: Formula E. With a partner who isn’t a fan: Monaco. A group of mates: Le Mans or the British Grand Prix. MotoGP-curious F1 fan: Mugello. One bucket-list trip: the Indy 500 or Le Mans.",
      caption: "Fan-type picks: our editorial judgement.",
      credit: illustration(),
      mobile: [800, 1524],
      desktop: [1600, 1348],
      anchor: { kind: "after-heading", id: "which-first-race-suits-you" }
    }),
    define({
      id: "b2-weekend-shape",
      folder: "which-race-first-2027",
      alt: "Comparison of the five series as a trip. Formula 1 and MotoGP: three days, loud, long days. Le Mans: a week-long event with a 24-hour race, never quiet, hard work with small children. Formula E: one day per race, quiet, the easiest with kids. Indy 500: one race day plus build-up days, loud, with a huge crowd.",
      caption:
        "Editorial judgement, not measured data, from the comparison table above.",
      credit: illustration(),
      mobile: [800, 1470],
      desktop: [1600, 1493],
      anchor: {
        kind: "after-table",
        id: "how-the-five-series-compare-as-a-trip"
      }
    }),
    define({
      id: "b3-first-race-calendar",
      folder: "which-race-first-2027",
      alt: "Calendar from April to August 2027 of good first races: Long Beach 16–18 April; Monaco E-Prix 1–2 May (provisional); Mugello 28–30 May (provisional); Brands Hatch 29–30 May (provisional); Indy 500 30 May; Monaco Grand Prix 4–6 June; Le Mans 9–13 June; British Grand Prix 2–4 July; MotoGP British Grand Prix 13–15 August (provisional). The 28–30 May clash is highlighted.",
      caption:
        "Good first events in 2027. MotoGP and Formula E dates are provisional.",
      credit: illustration(),
      mobile: [800, 1232],
      desktop: [1600, 1420],
      anchor: { kind: "after-heading", id: "two-series-one-trip-in-2027" }
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
