import { racesCriticalCss } from "@/lib/races-critical-css"
import { racesDeferredStylesheetHrefs } from "@/lib/races-deferred-stylesheets"
import { racesInlineFontCss } from "@/lib/races-critical-font"

/** Above-the-fold rules for /races, plus the full sheet as a non-blocking link. */
export function RacesCriticalCss() {
  const css = `${racesInlineFontCss()}${racesCriticalCss}`
  const hrefs = racesDeferredStylesheetHrefs()
  return (
    <>
      <style data-races-critical="" dangerouslySetInnerHTML={{ __html: css }} />
      {hrefs.map(href => (
        <link
          key={href}
          rel="stylesheet"
          href={href}
          media="print"
          data-races-defer=""
        />
      ))}
      {hrefs.map(href => (
        <noscript key={`${href}-noscript`}>
          <link rel="stylesheet" href={href} />
        </noscript>
      ))}
    </>
  )
}
