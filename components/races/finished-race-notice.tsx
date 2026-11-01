import Link from "next/link"
import { seriesDisplayName, type SeriesDisplayInput } from "@/lib/series"
import { cn } from "@/lib/utils"

export function finishedSeriesLabel(
  series: SeriesDisplayInput | null | undefined
): string {
  return seriesDisplayName(series) ?? (series?.name?.trim() || "motorsport")
}

export function FinishedRaceNotice({
  series,
  className
}: {
  series: SeriesDisplayInput | null | undefined
  className?: string
}) {
  const seriesName = finishedSeriesLabel(series)
  const href = series?.slug ? `/series/${series.slug}` : "/races"

  return (
    <p className={cn("text-sm", className)}>
      This race has finished.{" "}
      <Link href={href} className="underline underline-offset-4">
        See upcoming {seriesName} races.
      </Link>
    </p>
  )
}
