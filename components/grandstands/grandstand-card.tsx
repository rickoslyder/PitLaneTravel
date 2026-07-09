import { SelectGrandstand } from "@/db/schema/grandstands-schema"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Sun, Umbrella, Tv, Check, X } from "lucide-react"

const PRICE_TIER_LABEL: Record<string, string> = {
  budget: "£",
  mid: "££",
  premium: "£££"
}

export function GrandstandCard({
  grandstand
}: {
  grandstand: SelectGrandstand
}) {
  const rating = grandstand.viewRating ?? 0
  return (
    <Card className="flex h-full flex-col">
      {grandstand.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={grandstand.imageUrl}
          alt={grandstand.name}
          className="h-40 w-full rounded-t-lg object-cover"
        />
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{grandstand.name}</h3>
          {grandstand.priceTier && (
            <Badge variant="secondary" className="shrink-0">
              {PRICE_TIER_LABEL[grandstand.priceTier] ?? grandstand.priceTier}
            </Badge>
          )}
        </div>
        {rating > 0 && (
          <div className="flex items-center gap-0.5" aria-label={`${rating} of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={
                  i < rating
                    ? "size-4 fill-yellow-400 text-yellow-400"
                    : "size-4 text-muted-foreground/30"
                }
              />
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 text-sm">
        {grandstand.bestFor && (
          <p className="font-medium text-primary">Best for {grandstand.bestFor}</p>
        )}
        {grandstand.description && (
          <p className="text-muted-foreground">{grandstand.description}</p>
        )}

        {grandstand.viewsOf && grandstand.viewsOf.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {grandstand.viewsOf.map(v => (
              <Badge key={v} variant="outline" className="text-xs">
                {v}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            {grandstand.covered ? (
              <Umbrella className="size-3.5" />
            ) : (
              <Sun className="size-3.5" />
            )}
            {grandstand.covered ? "Covered" : "Uncovered"}
          </span>
          {grandstand.sunExposure && (
            <span className="inline-flex items-center gap-1">
              <Sun className="size-3.5" />
              {grandstand.sunExposure} sun
            </span>
          )}
          {grandstand.hasBigScreen && (
            <span className="inline-flex items-center gap-1">
              <Tv className="size-3.5" /> Big screen
            </span>
          )}
        </div>

        {(grandstand.pros?.length || grandstand.cons?.length) && (
          <div className="mt-auto grid grid-cols-2 gap-2 border-t pt-3 text-xs">
            <ul className="space-y-1">
              {grandstand.pros?.map(p => (
                <li key={p} className="flex items-start gap-1">
                  <Check className="mt-0.5 size-3 shrink-0 text-green-600" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <ul className="space-y-1">
              {grandstand.cons?.map(c => (
                <li key={c} className="flex items-start gap-1">
                  <X className="mt-0.5 size-3 shrink-0 text-red-500" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
