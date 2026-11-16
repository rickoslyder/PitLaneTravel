import { Fragment } from "react"
import {
  GRANDSTAND_FAN_NOTE_FOOTER,
  type CircuitFanNote,
  type GrandstandFanLine
} from "@/content/grandstand-fan-notes"

const EXTERNAL_LINK_REL = "noopener noreferrer"

export function FanSayAttribution({ line }: { line: GrandstandFanLine }) {
  return (
    <p className="text-muted-foreground mt-1">
      F1 fans, {line.year};{" "}
      <a href={line.sourceUrl} target="_blank" rel={EXTERNAL_LINK_REL}>
        {line.sourceLabel}
      </a>
    </p>
  )
}

export function FanSayLines({
  lines
}: {
  lines: readonly GrandstandFanLine[]
}) {
  if (lines.length === 0) return null
  return (
    <div data-fans-say="" className="border-t pt-3">
      <p className="font-medium">Fans say</p>
      <ul className="mt-2 space-y-3">
        {lines.map(line => (
          <li key={`${line.year}:${line.sourceUrl}:${line.text}`}>
            <p>{line.text}</p>
            <FanSayAttribution line={line} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CircuitFansSay({
  notes
}: {
  notes: readonly CircuitFanNote[]
}) {
  if (notes.length === 0) return null
  const headingId = "fans-say"

  return (
    <section
      data-fans-say-circuit=""
      aria-labelledby={headingId}
      className="bg-card rounded-lg border p-5 sm:p-6"
    >
      <h2 id={headingId} className="text-xl font-semibold tracking-tight">
        Fans say
      </h2>
      <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6">
        {notes.map(note =>
          note.kind === "fan" ? (
            <li key={`${note.year}:${note.sourceUrl}:${note.text}`}>
              <p>{note.text}</p>
              <FanSayAttribution line={note} />
            </li>
          ) : (
            <li key="pit-lane-calendar">
              <p>
                {note.parts.map((part, index) =>
                  typeof part === "string" ? (
                    <Fragment key={index}>{part}</Fragment>
                  ) : (
                    <a
                      key={index}
                      href={part.href}
                      target="_blank"
                      rel={EXTERNAL_LINK_REL}
                    >
                      {part.text}
                    </a>
                  )
                )}{" "}
                ({note.label})
              </p>
            </li>
          )
        )}
      </ul>
      <p className="text-muted-foreground mt-4 border-t pt-4 text-sm italic leading-6">
        {GRANDSTAND_FAN_NOTE_FOOTER}
      </p>
    </section>
  )
}
