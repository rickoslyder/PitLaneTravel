import { afterEach, describe, expect, it } from "vitest"
import {
  clearPendingRaceTab,
  publishRaceTab,
  takePendingRaceTab
} from "./race-tab-event"

type FakeWindow = {
  location: URL
  history: {
    state: unknown
    replaceState: (state: unknown, title: string, url: string) => void
  }
  dispatchEvent: (event: Event) => boolean
  __pltRaceTab?: { pathname: string; tab: string }
}

function installWindow(pathname: string, search = "") {
  const win: FakeWindow = {
    location: new URL(`https://www.pitlanetravel.com${pathname}${search}`),
    history: {
      state: null,
      replaceState(_state, _title, url) {
        win.location = new URL(url, "https://www.pitlanetravel.com")
      }
    },
    dispatchEvent: () => true
  }
  ;(globalThis as { window?: FakeWindow }).window = win
  return win
}

describe("race tab memory", () => {
  afterEach(() => {
    delete (globalThis as { window?: FakeWindow }).window
  })

  it("returns a tab only for the race that stored it, then forgets it", () => {
    installWindow("/races/abu-dhabi-grand-prix-2026-f1-2026")
    publishRaceTab("tickets")
    expect(takePendingRaceTab("/races/abu-dhabi-grand-prix-2026-f1-2026")).toBe(
      "tickets"
    )
    expect(
      takePendingRaceTab("/races/abu-dhabi-grand-prix-2026-f1-2026")
    ).toBeUndefined()
  })

  it("drops a tab stored for a different race", () => {
    installWindow("/races/abu-dhabi-grand-prix-2026-f1-2026")
    publishRaceTab("travel")
    expect(
      takePendingRaceTab("/races/bahrain-grand-prix-2027-f1-2027")
    ).toBeUndefined()
    expect(
      takePendingRaceTab("/races/abu-dhabi-grand-prix-2026-f1-2026")
    ).toBeUndefined()
  })

  it("can be cleared when an explicit query tab wins", () => {
    const win = installWindow("/races/abu-dhabi-grand-prix-2026-f1-2026")
    publishRaceTab("tickets")
    expect(win.location.search).toBe("?tab=tickets")
    clearPendingRaceTab()
    expect(
      takePendingRaceTab("/races/abu-dhabi-grand-prix-2026-f1-2026")
    ).toBeUndefined()
  })
})
