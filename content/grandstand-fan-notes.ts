/*
Fans say lines for the Silverstone, Montreal, Spa, Yas Marina and Lusail
grandstand pages. Keys are the circuit slug and slugify(stored stand name).

Spa Silver 1 was deliberately omitted.
*/

export const GRANDSTAND_FAN_SOURCE_LABEL = "archived Reddit copy" as const

export const GRANDSTAND_FAN_NOTE_FOOTER =
  "Fan lines are labelled with the event year and link to archived Reddit copy."

export const F1_2026_CALENDAR_HREF = "https://www.formula1.com/en/racing/2026"

export const PIT_LANE_NOTE_LABEL = "Pit Lane note, not a fan line" as const

export const ABU_DHABI_CALENDAR_NOTE =
  "The 2026 Abu Dhabi Grand Prix is on the official F1 calendar as of 11 November 2026, as Round 23, with the race on Sunday 6 December. Check formula1.com (https://www.formula1.com/en/racing/2026) before booking non-refundable travel. If you can, book refundable or flexible fares, and a hotel you can cancel for free."

export const QATAR_CALENDAR_NOTE =
  "The 2026 Qatar Grand Prix is on the official F1 calendar as of 11 November 2026, as Round 22, with the race on Sunday 29 November. Check formula1.com (https://www.formula1.com/en/racing/2026) before booking non-refundable travel. If you can, book refundable or flexible fares, and a hotel you can cancel for free."

/** Stored stands that stay without a Fans say block. */
export const GRANDSTAND_FAN_NOTE_GAPS = [
  {
    circuitSlug: "circuit-gilles-villeneuve",
    standSlug: "grandstand-34-hairpin-panoramic"
  },
  {
    circuitSlug: "circuit-gilles-villeneuve",
    standSlug: "platine-senna-s-t1-2"
  },
  {
    circuitSlug: "circuit-de-spa-francorchamps",
    standSlug: "combes-1-4"
  }
] as const

export type GrandstandFanLine = {
  text: string
  year: number
  sourceUrl: string
  sourceLabel: typeof GRANDSTAND_FAN_SOURCE_LABEL
}

export type FanNoteTextPart = string | { text: string; href: string }

export type CircuitFanNote =
  | ({ kind: "fan" } & GrandstandFanLine)
  | {
      kind: "pit-lane"
      parts: readonly FanNoteTextPart[]
      label: typeof PIT_LANE_NOTE_LABEL
    }

function fan(text: string, year: number, sourceUrl: string): GrandstandFanLine {
  return {
    text,
    year,
    sourceUrl,
    sourceLabel: GRANDSTAND_FAN_SOURCE_LABEL
  }
}

function circuitFan(line: GrandstandFanLine): CircuitFanNote {
  return { kind: "fan", ...line }
}

function calendarNote(sentence: string): CircuitFanNote {
  const start = sentence.indexOf(F1_2026_CALENDAR_HREF)
  if (start < 0) {
    throw new Error("calendar note is missing the official calendar link")
  }
  return {
    kind: "pit-lane",
    parts: [
      sentence.slice(0, start),
      { text: F1_2026_CALENDAR_HREF, href: F1_2026_CALENDAR_HREF },
      sentence.slice(start + F1_2026_CALENDAR_HREF.length)
    ],
    label: PIT_LANE_NOTE_LABEL
  }
}

const STAND_LINES: Record<
  string,
  Record<string, readonly GrandstandFanLine[]>
> = {
  "silverstone-circuit": {
    "landostand-stowe": [
      fan(
        "One fan called it one of the best seats at the circuit for about £600, and said its price wasn't dynamic. The downside: it's on the opposite side from the coaches.",
        2026,
        "https://www.reddit.com/comments/1waka4w/_/p8iohh1/"
      )
    ],
    "club-corner-b-c": [
      fan(
        "One fan had a reserved seat at Club Corner, now a premium grandstand, and found extra toilet blocks with shorter queues tucked behind a mesh fence.",
        2025,
        "https://www.reddit.com/comments/1lt4z6r/_/n1se58l/"
      ),
      fan(
        "One fan saw the Club Corner three-day price rise from £629 when announced to £809 before general sale.",
        2026,
        "https://redd.it/1nkxw1m"
      )
    ],
    "abbey-a-b": [
      fan(
        "One fan used Abbey B on Friday, the only day it was available, for an overview of Hamilton Straight and the pit lane.",
        2025,
        "https://www.reddit.com/comments/1lt4z6r/_/n1q23ne/"
      )
    ],
    becketts: [
      fan(
        "One fan said Becketts had the most expansive view of all the stands they tried, across the Esses to Luffield and Wellington Straight.",
        2025,
        "https://www.reddit.com/comments/1lt4z6r/_/n1q23ne/"
      ),
      fan(
        "The same fan, who has an ankle issue, took about 45 minutes to walk there from Entrance 19 and the park-and-ride drop-off.",
        2025,
        "https://www.reddit.com/comments/1lt4z6r/_/n1q23ne/"
      )
    ],
    "copse-a-b-c": [
      fan(
        "One fan called Copse A a great place to watch the cars at speed, with the screens closer.",
        2025,
        "https://www.reddit.com/comments/1lt4z6r/_/n1q23ne/"
      )
    ]
  },
  "circuit-gilles-villeneuve": {
    "grandstand-24-lance-stroll-grandstand-hairpin-exit": [
      fan(
        "One fan posted the view from the Lance Stroll grandstand and called them great seats for this race.",
        2026,
        "https://redd.it/1tnmai8"
      ),
      fan(
        "One fan who has tracked their three-day ticket price since 2022 reported another 20% rise for 2027.",
        2026,
        "https://redd.it/1tnjurv"
      )
    ],
    "grandstand-1-start-finish-straight": [
      fan(
        "One fan said double-letter rows (AA, BB) are closest to the track, and single-letter rows sit higher, with a view over the grille and onto the track.",
        2025,
        "https://redd.it/1le3l4w"
      ),
      fan(
        "One renewing fan said their ticket went from CAD 1,015 for 2026 to CAD 1,667 for 2027, a 64% rise.",
        2026,
        "https://redd.it/1wjralr"
      )
    ],
    "grandstand-11-senna-s-t1-2": [
      fan(
        "One local fan said the blue gate from the south shore, added the year before, gives a shorter route to GS11 and GS12.",
        2026,
        "https://www.reddit.com/comments/1tmu891/_/onpjfcg/"
      )
    ],
    "grandstand-12-senna-s-climb-to-t3": [
      fan(
        "One local fan said the blue gate from the south shore, added the year before, gives a shorter route to GS11 and GS12.",
        2026,
        "https://www.reddit.com/comments/1tmu891/_/onpjfcg/"
      )
    ],
    "family-grandstand-t6-7-chicane": [
      fan(
        "One fan paid about CAD 450–470 for the turn 6/7 family grandstand and called it reasonable, but it was very hot with no shade, so they'll bring bigger water bottles.",
        2025,
        "https://www.reddit.com/comments/1ld66lz/_/mybnlll/"
      )
    ]
  },
  "circuit-de-spa-francorchamps": {
    "gold-3-eau-rouge-raidillon": [
      fan(
        "One fan saw little overtaking but loved watching cars blast up the hill. A screen opposite made the race easy to follow.",
        2026,
        "https://redd.it/1v1qazi"
      ),
      fan(
        "The same fan's only gripe was a loud DJ on the stage opposite in the mornings; they used earplugs.",
        2026,
        "https://redd.it/1v1qazi"
      )
    ],
    "gold-1-pit-straight": [
      fan(
        "One fan said the area had its own proper toilets, food and drink, and water stations.",
        2025,
        "https://www.reddit.com/comments/1maqxss/_/n5h6fx4/"
      ),
      fan(
        "The same fan took 45 minutes on Saturday to get to the fan zone because of the narrow Eau Rouge tunnel.",
        2025,
        "https://www.reddit.com/comments/1maqxss/_/n5h6fx4/"
      )
    ],
    "gold-8-la-source-turn-1": [
      fan(
        "One fan said Gold 8 is the closest stand to the exit for the shuttle buses, though it was still a 30-minute walk to the Verviers shuttle.",
        2025,
        "https://www.reddit.com/comments/1maqxss/_/n5hg4f5/"
      ),
      fan(
        "The same fan found the track speakers quiet and suggested sitting near the front or bringing an FM radio.",
        2025,
        "https://www.reddit.com/comments/1maqxss/_/n5hg4f5/"
      )
    ],
    "silver-3-pouhon": [
      fan(
        "One tour organiser said guests in Silver 3, 5 and 6 took 1.5 hours to reach their bus because of the tunnel bottleneck.",
        2025,
        "https://www.reddit.com/comments/1maqxss/_/n5s207h/"
      )
    ]
  },
  "yas-marina-circuit": {
    "west-grandstand-turn-6": [
      fan(
        "One fan said picking the West or South grandstand lets you see racing and overtaking.",
        2025,
        "https://www.reddit.com/comments/1pgkmfc/_/nsw90wr/"
      )
    ],
    "south-grandstand-turn-9": [
      fan(
        "One fan said picking the West or South grandstand lets you see racing and overtaking.",
        2025,
        "https://www.reddit.com/comments/1pgkmfc/_/nsw90wr/"
      ),
      fan(
        "One fan in the upper centre of the stand had great views and saw plenty of overtakes. It was hot, but breezy up there.",
        2024,
        "https://www.reddit.com/comments/1h9sfco/_/m1agpup/"
      )
    ],
    "marina-grandstand-turns-8-9-marina-section": [
      fan(
        "One first-timer enjoyed a separate orange fan zone and a jovial crowd.",
        2025,
        "https://redd.it/1phm3ss"
      )
    ],
    "north-grandstand-turn-5-hairpin": [
      fan(
        "One fan in the North Grandstand Yas suites had a great view of turns 3–5 but saw little on-track action in front of them.",
        2024,
        "https://www.reddit.com/comments/1h9sfco/_/m15i7x4/"
      )
    ],
    "abu-dhabi-hill-general-admission": [
      fan(
        "One Horizon Terrace hospitality guest thought fans on the general admission hill had a better view than they did.",
        2025,
        "https://www.reddit.com/comments/1pgkmfc/_/nstzu9t/"
      )
    ],
    "main-grandstand-start-finish-pits-podium": [
      fan(
        "One fan who bought Main Grandstand premium seats in the pre-sale was moved to a section nearer Turn 1, after the original section was given to hospitality.",
        2025,
        "https://redd.it/1p13rt1"
      )
    ]
  },
  "lusail-international-circuit": {
    "main-grandstand-zones-a-f-main-straight": [
      fan(
        "One fan in E block by the start line called the view incredible.",
        2024,
        "https://www.reddit.com/comments/1h4b6e8/_/m00lwt9/"
      ),
      fan(
        "Another fan said Main Grandstand tickets were numbered, but in practice you could sit anywhere.",
        2024,
        "https://www.reddit.com/comments/1h4b6e8/_/m0pnds0/"
      )
    ],
    "north-grandstand-grandstand-nord-turn-1": [
      fan(
        "One fan said the North Grandstand had good visibility if you sat high enough.",
        2025,
        "https://www.reddit.com/comments/1pas7t8/_/nrlorb7/"
      ),
      fan(
        "A returning fan found the view of the action not as good as T2, but the seats more comfortable.",
        2024,
        "https://www.reddit.com/comments/1h4b6e8/_/m004jwe/"
      )
    ],
    "t16-grandstand-turn-16": [
      fan(
        "One fan recommended every viewing area except T16, which they found a little far.",
        2024,
        "https://www.reddit.com/comments/1h4b6e8/_/m0pnds0/"
      )
    ],
    "lusail-hill-general-admission-turn-1": [
      fan(
        "One fan called Losail Hill superb value and a nice place to watch and relax between sessions.",
        2025,
        "https://www.reddit.com/comments/1pas7t8/_/nrqbybb/"
      ),
      fan(
        "One fan with T3 seats spent the whole weekend at T1 general admission, calling its views among the best at any circuit.",
        2024,
        "https://www.reddit.com/comments/1h4b6e8/_/lzy548s/"
      )
    ],
    "t2-grandstand-turn-2": [
      fan(
        "One first-timer praised the close-up view, but wished for shorter walks and dedicated shuttles to and from the stand.",
        2025,
        "https://www.reddit.com/comments/1pas7t8/_/nrlf3hx/"
      ),
      fan(
        "For photos, one fan recommended sitting on the Gate A side, as close to the end of the stand as possible.",
        2024,
        "https://redd.it/1h5mhc3"
      )
    ],
    "t3-grandstand-turn-3": [
      fan(
        "One fan with T3 seats preferred the T1 general admission area and watched from there all weekend.",
        2024,
        "https://www.reddit.com/comments/1h4b6e8/_/lzy548s/"
      )
    ]
  }
}

const CIRCUIT_NOTES: Record<string, readonly CircuitFanNote[]> = {
  "silverstone-circuit": [
    circuitFan(
      fan(
        "General admission: one fan said GA areas were packed, with long queues for drinking water in the heat and some toilet blocks out of action.",
        2026,
        "https://redd.it/1uobmi2"
      )
    ),
    circuitFan(
      fan(
        "Vale: one first-timer said their husband loved their Vale grandstand tickets, which included podium access.",
        2026,
        "https://redd.it/1up0mqj"
      )
    ),
    circuitFan(
      fan(
        "Vale: one Landostand GA+ fan, at the old Vale entrance, found it uncrowded but felt there wasn't much action at Vale.",
        2026,
        "https://redd.it/1uxfli3"
      )
    ),
    circuitFan(
      fan(
        "Luffield: one fan found the stand very windy on a cold Saturday.",
        2025,
        "https://www.reddit.com/comments/1lt4z6r/_/n1q23ne/"
      )
    ),
    circuitFan(
      fan(
        "Woodcote: one fan in Woodcote A had a head-on view of Wellington Straight, round Luffield and up National Pit Straight.",
        2025,
        "https://www.reddit.com/comments/1lt4z6r/_/n1rxplf/"
      )
    ),
    circuitFan(
      fan(
        "National Pits Straight: one fan said the covered stand was handy as the weather swung from hot to rain.",
        2025,
        "https://redd.it/1v85rsr"
      )
    ),
    circuitFan(
      fan(
        "Club Corner A: one fan had a fantastic view, including the podium, but the uncovered stand was warm and they took shade breaks.",
        2026,
        "https://redd.it/1v85rsr"
      )
    )
  ],
  "circuit-gilles-villeneuve": [
    circuitFan(
      fan(
        "General admission: one fan said they couldn't get a meaningful view of the cars however early they arrived, and bought grandstand seats instead.",
        2025,
        "https://redd.it/1le1d0c"
      )
    ),
    circuitFan(
      fan(
        "General admission: another first-timer found a big grassy patch near GS34 with a clear view at the fence.",
        2025,
        "https://redd.it/1lcpjt9"
      )
    )
  ],
  "circuit-de-spa-francorchamps": [
    circuitFan(
      fan(
        "17-27: a stand for fans aged 17–27 with unassigned seating. One group arriving 30 minutes before the sprint found it full, and half of them watched from the grass outside.",
        2025,
        "https://redd.it/1m9rko6"
      )
    ),
    circuitFan(
      fan(
        '17-27: one fan noted that 2026 tickets call it "Area 17-27", a general admission area for that age group.',
        2025,
        "https://www.reddit.com/comments/1m9rko6/_/n5azkl3/"
      )
    ),
    circuitFan(
      fan(
        "Bronze GA: one solo fan said most bronze areas are on steep slopes, so wear hiking shoes, bring a small chair and arrive early.",
        2025,
        "https://redd.it/1mbagqx"
      )
    ),
    circuitFan(
      fan(
        "Gold 4: one family rated it 10/10 and found it easy to reach from the bus parking.",
        2026,
        "https://redd.it/1v1240h"
      )
    ),
    circuitFan(
      fan(
        "Silver 4: one fan said the roof helped in the rain, but the view had little action and the screen was far away.",
        2025,
        "https://redd.it/1mbcyno"
      )
    ),
    circuitFan(
      fan(
        "Gold 6: one fan was glad of the cover but felt the view wasn't worth a gold price.",
        2025,
        "https://www.reddit.com/comments/1maqxss/_/n61jbop/"
      )
    )
  ],
  "yas-marina-circuit": [
    calendarNote(ABU_DHABI_CALENDAR_NOTE),
    circuitFan(
      fan(
        "Hospitality: one 360 at Sixteen guest found the views fantastic, but fewer than half of guests got a track-facing seat.",
        2025,
        "https://redd.it/1pi2fsf"
      )
    ),
    circuitFan(
      fan(
        "Hospitality: one Horizon Terrace guest, who paid about €2,400 for two, called the race view poor and relied on a single big screen.",
        2025,
        "https://www.reddit.com/comments/1pgkmfc/_/nstzu9t/"
      )
    ),
    circuitFan(
      fan(
        "Hospitality: one fan said Garden on Yas wasn't worth it once its single row of seats by the railings filled.",
        2024,
        "https://www.reddit.com/comments/1h9sfco/_/m157wck/"
      )
    ),
    circuitFan(
      fan(
        "West Straight Premium: one fan in section 3 found the larger West Grandstand blocked the corner, and recommends section 4 or higher.",
        2025,
        "https://www.reddit.com/comments/1pgkmfc/_/nt3kuay/"
      )
    ),
    circuitFan(
      fan(
        "North Straight: one fan in the front row could see most of the action in the north sector and the hairpin.",
        2024,
        "https://www.reddit.com/comments/1h9sfco/_/m184w2b/"
      )
    )
  ],
  "lusail-international-circuit": [calendarNote(QATAR_CALENDAR_NOTE)]
}

export function standLevelFanNotes(): ReadonlyArray<{
  circuitSlug: string
  standSlug: string
  lines: readonly GrandstandFanLine[]
}> {
  return Object.entries(STAND_LINES).flatMap(([circuitSlug, stands]) =>
    Object.entries(stands).map(([standSlug, lines]) => ({
      circuitSlug,
      standSlug,
      lines
    }))
  )
}

export function fanLinesForStand(
  circuitSlug: string,
  standSlug: string
): readonly GrandstandFanLine[] {
  return STAND_LINES[circuitSlug]?.[standSlug] ?? []
}

export function circuitFanNotes(
  circuitSlug: string
): readonly CircuitFanNote[] | null {
  const notes = CIRCUIT_NOTES[circuitSlug]
  if (!notes || notes.length === 0) return null
  return notes
}

export function circuitFanNoteText(note: CircuitFanNote): string {
  if (note.kind === "fan") return note.text
  return note.parts
    .map(part => (typeof part === "string" ? part : part.text))
    .join("")
}
