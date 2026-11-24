import Image from "next/image"
import { Card } from "@/components/ui/card"
import { SelectGrandstand } from "@/db/schema/grandstands-schema"
import {
  GRANDSTAND_PRICE_LEGEND,
  formatBestFor,
  formatCoverSun,
  formatPriceTier,
  formatViewRating
} from "@/lib/grandstand-copy"
import { Check, X } from "lucide-react"

export function GrandstandPriceLegend() {
  return (
    <p className="bg-muted/40 text-muted-foreground max-w-3xl rounded-md border px-3 py-2 text-sm">
      {GRANDSTAND_PRICE_LEGEND}
    </p>
  )
}

function Fact({
  label,
  value,
  fact,
  valueLabel
}: {
  label: string
  value: string
  fact: string
  valueLabel?: string
}) {
  return (
    <>
      <dt
        data-fact={fact}
        className="text-muted-foreground text-[0.6875rem] font-medium uppercase tracking-[0.08em]"
      >
        {label}
      </dt>
      <dd className="text-foreground min-w-0 text-sm font-medium leading-snug">
        {value ? <span aria-label={valueLabel}>{value}</span> : "—"}
      </dd>
    </>
  )
}

function standPhoto(imageUrl: string | null | undefined): string {
  return (imageUrl ?? "").trim()
}

export function GrandstandCard({
  grandstand
}: {
  grandstand: SelectGrandstand
}) {
  const bestFor = formatBestFor(grandstand.bestFor)
  const cover = formatCoverSun(grandstand.covered, grandstand.sunExposure)
  const view = formatViewRating(grandstand.viewRating)
  const priceTier = formatPriceTier(grandstand.priceTier)
  const photo = standPhoto(grandstand.imageUrl)
  const views = (grandstand.viewsOf ?? [])
    .map(viewOf => viewOf.trim())
    .filter(Boolean)
  const pros = grandstand.pros ?? []
  const cons = grandstand.cons ?? []

  return (
    <Card
      data-grandstand-card={grandstand.slug}
      className="flex h-full flex-col overflow-hidden"
    >
      <div className="flex flex-1 flex-col gap-4 p-5">
        <h3 className="text-foreground text-lg font-semibold leading-snug tracking-tight">
          {grandstand.name}
        </h3>

        <dl
          data-grandstand-facts="true"
          className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 border-y py-3"
        >
          <Fact label="Cover" value={cover} fact="cover" />
          <Fact
            label="View"
            value={view}
            fact="view"
            valueLabel={view ? `${view.replace("/5", "")} out of 5` : undefined}
          />
          <Fact label="Price" value={priceTier} fact="price" />
          <Fact
            label="Screen"
            value={grandstand.hasBigScreen ? "Big screen" : "No big screen"}
            fact="screen"
          />
          <Fact label="Best for" value={bestFor} fact="best-for" />
        </dl>

        {photo ? (
          <div
            data-grandstand-photo
            className="bg-background relative aspect-[16/9] w-full overflow-hidden rounded-md"
          >
            <Image
              src={photo}
              alt={grandstand.name}
              fill
              sizes="(max-width: 768px) 100vw, 24rem"
              className="object-cover"
            />
          </div>
        ) : null}

        {grandstand.description ? (
          <p className="text-foreground text-sm leading-relaxed">
            {grandstand.description}
          </p>
        ) : null}

        {views.length > 0 ? (
          <p className="text-muted-foreground text-sm leading-relaxed">
            <span className="text-foreground font-medium">Looks onto </span>
            {views.join(", ")}
          </p>
        ) : null}

        {pros.length > 0 || cons.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm">
            <div className="min-w-0">
              {pros.length > 0 ? (
                <>
                  <p className="text-muted-foreground text-[0.6875rem] font-medium uppercase tracking-[0.08em]">
                    Pros
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {pros.map(pro => (
                      <li key={pro} className="flex items-start gap-1.5">
                        <Check
                          className="mt-0.5 size-3.5 shrink-0 text-green-700"
                          aria-hidden="true"
                        />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
            <div className="min-w-0">
              {cons.length > 0 ? (
                <>
                  <p className="text-muted-foreground text-[0.6875rem] font-medium uppercase tracking-[0.08em]">
                    Cons
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {cons.map(con => (
                      <li key={con} className="flex items-start gap-1.5">
                        <X
                          className="mt-0.5 size-3.5 shrink-0 text-[#991b1b]"
                          aria-hidden="true"
                        />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
