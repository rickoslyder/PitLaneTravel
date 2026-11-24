import Link from "next/link"
import { WHERE_TO_SIT_LABEL } from "@/lib/circuit-race-links"

export function WhereToSit({
  href,
  circuitName
}: {
  href: string
  circuitName?: string | null
}) {
  const detail = circuitName
    ? `Grandstand guide for ${circuitName}.`
    : "Grandstand guide for this circuit."

  return (
    <section className="max-w-xl" aria-label={WHERE_TO_SIT_LABEL}>
      <Link
        href={href}
        className="bg-card hover:border-brand group block rounded-lg border p-5 transition-colors"
      >
        <h2 className="text-foreground group-hover:text-brand text-lg font-semibold">
          {WHERE_TO_SIT_LABEL}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">{detail}</p>
      </Link>
    </section>
  )
}
