import { racesCriticalCss } from "@/lib/races-critical-css"
import { racesDeferredStylesheetHrefs } from "@/lib/races-deferred-stylesheets"
import { racesInlineFontCss } from "@/lib/races-critical-font"

/**
 * Raw markup, not a React `<link>`. React 19 hoists stylesheet links and the
 * hoisted node was dropped on the preview, so the full sheet never reached
 * the DOM. A string inside the HTML is parsed by the browser as a real link.
 */
function deferredStylesheetMarkup(hrefs: string[]): string {
  return hrefs
    .map(href => {
      return (
        `<link rel="stylesheet" href="${href}" media="print" data-races-defer="">` +
        `<noscript><link rel="stylesheet" href="${href}"></noscript>`
      )
    })
    .join("")
}

/** Above-the-fold rules for /races, plus the full sheet as a non-blocking link. */
export function RacesCriticalCss() {
  const css = `${racesInlineFontCss()}${racesCriticalCss}`
  const markup = deferredStylesheetMarkup(racesDeferredStylesheetHrefs())
  return (
    <>
      <style data-races-critical="" dangerouslySetInnerHTML={{ __html: css }} />
      {markup ? (
        <div
          data-races-stylesheets=""
          style={{ display: "contents" }}
          dangerouslySetInnerHTML={{ __html: markup }}
        />
      ) : null}
    </>
  )
}
