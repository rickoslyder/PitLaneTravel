import React from "react"
import {
  fanTipsForRaceSlug,
  fanTipsStatusText,
  visibleFanTipSlots,
  type FanTipsBox
} from "@/content/fan-tips"

const EXTERNAL_LINK_REL = "noopener noreferrer"

export function FanTipsSection({
  raceSlug
}: {
  raceSlug: string | null | undefined
}) {
  const tips = fanTipsForRaceSlug(raceSlug)
  if (!tips) return null
  return <FanTipsBoxView tips={tips} />
}

export function FanTipsBoxView({ tips }: { tips: FanTipsBox }) {
  const slots = visibleFanTipSlots(tips.slots)
  const headingId = "what-fans-wish-theyd-known"

  return (
    <section
      data-fan-tips=""
      aria-labelledby={headingId}
      className="mx-auto w-full min-w-0 max-w-7xl px-4 pt-8 sm:px-6 lg:px-8"
    >
      <div className="bg-card rounded-lg border p-5 sm:p-6">
        <h2 id={headingId} className="text-xl font-semibold tracking-tight">
          {tips.heading}
        </h2>
        <p className="text-muted-foreground mt-3 text-sm italic leading-6">
          {fanTipsStatusText(tips)}
        </p>
        {tips.leads.map(lead => (
          <p key={lead} className="mt-3 text-sm italic leading-6">
            {lead}
          </p>
        ))}
        {slots.map(slot => (
          <div key={slot.id} className="mt-6">
            <h3 className="text-base font-semibold">
              {slot.title}
              {slot.edition ? (
                <span className="text-muted-foreground ml-2 font-normal italic">
                  {slot.edition}
                </span>
              ) : null}
            </h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6">
              {slot.bullets
                .filter(bullet => bullet.trim().length > 0)
                .map(bullet => (
                  <li key={bullet}>{bullet}</li>
                ))}
            </ul>
            {slot.note ? (
              <p className="text-muted-foreground mt-3 text-sm italic leading-6">
                {slot.note}
              </p>
            ) : null}
          </div>
        ))}
        <div className="mt-6 border-t pt-4">
          <p className="text-sm leading-6">
            <span className="italic">{tips.footer}</span> Sources:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
            {tips.sources.map(source => (
              <li key={source.href}>
                <a href={source.href} target="_blank" rel={EXTERNAL_LINK_REL}>
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
