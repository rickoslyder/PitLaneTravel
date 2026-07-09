"use client"

import { useMemo, useState } from "react"
import {
  estimateBudget,
  type BudgetInput,
  type TicketTier,
  type HotelTier
} from "@/lib/budget"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const TICKET_TIERS: { value: TicketTier; label: string }[] = [
  { value: "general", label: "General admission" },
  { value: "grandstand", label: "Grandstand" },
  { value: "premium", label: "Premium / hospitality" }
]

const HOTEL_TIERS: { value: HotelTier; label: string }[] = [
  { value: "hostel", label: "Budget / hostel" },
  { value: "standard", label: "Standard hotel" },
  { value: "luxury", label: "Luxury" }
]

const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
  }).format(n)

export function BudgetEstimator() {
  const [input, setInput] = useState<BudgetInput>({
    nights: 3,
    partySize: 2,
    ticketTier: "grandstand",
    hotelTier: "standard",
    flightPerPerson: 200
  })

  const result = useMemo(() => estimateBudget(input), [input])

  const set = <K extends keyof BudgetInput>(key: K, value: BudgetInput[K]) =>
    setInput(prev => ({ ...prev, [key]: value }))

  const rows: { label: string; value: number }[] = [
    { label: "Tickets", value: result.tickets },
    { label: "Flights", value: result.flights },
    { label: "Accommodation", value: result.accommodation },
    { label: "Food & spending", value: result.spending }
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Your trip</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="party">Travellers</Label>
              <Input
                id="party"
                type="number"
                min={1}
                value={input.partySize}
                onChange={e => set("partySize", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nights">Nights</Label>
              <Input
                id="nights"
                type="number"
                min={0}
                value={input.nights}
                onChange={e => set("nights", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ticket">Ticket type</Label>
            <select
              id="ticket"
              className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
              value={input.ticketTier}
              onChange={e => set("ticketTier", e.target.value as TicketTier)}
            >
              {TICKET_TIERS.map(t => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hotel">Accommodation</Label>
            <select
              id="hotel"
              className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
              value={input.hotelTier}
              onChange={e => set("hotelTier", e.target.value as HotelTier)}
            >
              {HOTEL_TIERS.map(t => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="flight">Return flight per person (GBP)</Label>
            <Input
              id="flight"
              type="number"
              min={0}
              value={input.flightPerPerson}
              onChange={e => set("flightPerPerson", Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <h2 className="font-semibold">Estimated cost</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map(r => (
            <div key={r.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-medium">{gbp(r.value)}</span>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between border-t pt-3">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold">{gbp(result.total)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Per person</span>
            <span>{gbp(result.perPerson)}</span>
          </div>
          <p className="pt-2 text-xs text-muted-foreground">
            Estimates are indicative. Ticket and flight prices vary by circuit,
            demand and how early you book.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
