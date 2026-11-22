import { Fragment, type ReactNode } from "react"
import { GuideFigure } from "@/components/guides/guide-figure"
import { segmentGuide } from "@/components/guides/guide-figures"

export function GuideWithFigures({
  routeKey,
  source,
  renderMarkdown
}: {
  routeKey: string
  source: string
  renderMarkdown: (markdown: string, answerFirst: boolean) => ReactNode
}) {
  const segments = segmentGuide(routeKey, source)
  return (
    <>
      {segments.map((segment, index) =>
        segment.kind === "figure" ? (
          <GuideFigure key={segment.figure.id} figure={segment.figure} />
        ) : (
          <Fragment key={`${routeKey}-md-${index}`}>
            {renderMarkdown(segment.text, segment.answerFirst)}
          </Fragment>
        )
      )}
    </>
  )
}
