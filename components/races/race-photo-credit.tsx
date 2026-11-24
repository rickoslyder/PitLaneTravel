import type { RaceImageCredit } from "@/lib/race-series-image"
import { cn } from "@/lib/utils"

/**
 * Public credit for a hosted race photograph.
 * Names the photographer and the licence, and links to both the licence and
 * the file page. The parent keeps it inside the existing image frame.
 */
export function RacePhotoCredit({
  credit,
  visuallyHidden = false
}: {
  credit: RaceImageCredit
  visuallyHidden?: boolean
}) {
  return (
    <p
      className={cn(
        "race-photo-credit",
        visuallyHidden
          ? "sr-only"
          : "bg-[#1c1916] px-2 py-1 text-[11px] leading-4 text-[#f6f1ea]"
      )}
      data-race-photo-credit=""
    >
      Photo: {credit.author},{" "}
      <a
        href={credit.licenceUrl}
        className={visuallyHidden ? undefined : "underline underline-offset-2"}
        rel="license noopener noreferrer"
        target="_blank"
      >
        {credit.licence}
      </a>
      , via{" "}
      <a
        href={credit.commonsUrl}
        className={visuallyHidden ? undefined : "underline underline-offset-2"}
        rel="noopener noreferrer"
        target="_blank"
      >
        Wikimedia Commons
      </a>
    </p>
  )
}
