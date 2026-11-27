export const RACE_TAB_EVENT = "plt-race-tab"

type StoredRaceTab = { pathname: string; tab: string }

type RaceTabWindow = Window & { __pltRaceTab?: StoredRaceTab }

function tabWindow(): RaceTabWindow | undefined {
  if (typeof window === "undefined") return undefined
  return window as RaceTabWindow
}

/** The hero paints before the tab panel. A click updates the URL and the panel. */
export function publishRaceTab(tab: string) {
  const view = tabWindow()
  if (!view) return
  const url = new URL(view.location.href)
  view.__pltRaceTab = { pathname: url.pathname, tab }
  url.searchParams.set("tab", tab)
  const query = url.searchParams.toString()
  view.history.replaceState(
    view.history.state,
    "",
    `${url.pathname}${query ? `?${query}` : ""}`
  )
  view.dispatchEvent(new CustomEvent(RACE_TAB_EVENT, { detail: tab }))
}

export function clearPendingRaceTab() {
  const view = tabWindow()
  if (!view) return
  delete view.__pltRaceTab
}

/**
 * Tab chosen on this race before the panel mounted. A value stored for
 * another pathname is dropped. The stored tab is cleared as it is read.
 */
export function takePendingRaceTab(pathname: string): string | undefined {
  const view = tabWindow()
  if (!view) return undefined
  const stored = view.__pltRaceTab
  delete view.__pltRaceTab
  if (!stored || stored.pathname !== pathname) return undefined
  return stored.tab
}
