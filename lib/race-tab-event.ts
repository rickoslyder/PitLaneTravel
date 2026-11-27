export const RACE_TAB_EVENT = "plt-race-tab"

type RaceTabWindow = Window & { __pltRaceTab?: string }

/** The hero paints before the tab panel. A click updates the URL and the panel. */
export function publishRaceTab(tab: string) {
  const view = window as RaceTabWindow
  view.__pltRaceTab = tab
  const url = new URL(window.location.href)
  url.searchParams.set("tab", tab)
  const query = url.searchParams.toString()
  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${query ? `?${query}` : ""}`
  )
  window.dispatchEvent(new CustomEvent(RACE_TAB_EVENT, { detail: tab }))
}

export function pendingRaceTab(): string | undefined {
  if (typeof window === "undefined") return undefined
  return (window as RaceTabWindow).__pltRaceTab
}
