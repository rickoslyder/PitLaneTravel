"use client"

import { Clock, Plane, Luggage, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TransformedFlightOffer } from "@/types/duffel"
import { formatTime, formatDate, formatDuration } from "@/lib/utils"

interface FlightDetailsProps {
  flight: TransformedFlightOffer
  onSelect: () => void
  isSelected?: boolean
}

export function FlightDetails({
  flight,
  onSelect,
  isSelected = false
}: FlightDetailsProps) {
  const hasLayovers = flight.segments.length > 1
  const totalDuration = formatDuration(flight.duration)

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Main Flight Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src={`/airlines/${flight.airline.iata_code.toLowerCase()}.png`}
                alt={flight.airline.name}
                className="size-8 object-contain"
                onError={e => {
                  e.currentTarget.src = "/airlines/default.png"
                }}
              />
              <div>
                <div className="font-medium">{flight.airline.name}</div>
                <div className="text-muted-foreground text-sm">
                  Flight {flight.segments[0].flight_number}
                </div>
              </div>
            </div>
            {flight.conditions.changeable && (
              <Badge variant="outline" className="ml-2">
                Changeable{" "}
                {flight.conditions.change_fee &&
                  `(Fee: ${flight.conditions.change_fee})`}
              </Badge>
            )}
            {flight.conditions.refundable && (
              <Badge variant="outline" className="ml-2">
                Refundable{" "}
                {flight.conditions.refund_fee &&
                  `(Fee: ${flight.conditions.refund_fee})`}
              </Badge>
            )}
          </div>
        </div>

        {/* Flight Route */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-semibold">
              {formatTime(flight.departure.time)}
            </div>
            <div className="text-muted-foreground text-sm">
              {formatDate(flight.departure.time)}
            </div>
            <div className="text-sm font-medium">
              {flight.departure.airport}
              {flight.departure.terminal &&
                ` (Terminal ${flight.departure.terminal})`}
            </div>
            <div className="text-muted-foreground text-sm">
              {flight.departure.city}
            </div>
          </div>

          <div className="flex flex-col items-center px-4">
            <div className="text-muted-foreground mb-2 flex items-center gap-1 text-sm">
              <Clock className="size-3" />
              <span>{totalDuration}</span>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dashed" />
              </div>
              <div className="relative flex justify-center">
                <Plane className="text-primary size-4 rotate-90" />
              </div>
            </div>
            <div className="text-muted-foreground mt-2 text-sm">
              {hasLayovers ? `${flight.segments.length - 1} stop(s)` : "Direct"}
            </div>
          </div>

          <div className="space-y-1 text-right">
            <div className="text-2xl font-semibold">
              {formatTime(flight.arrival.time)}
            </div>
            <div className="text-muted-foreground text-sm">
              {formatDate(flight.arrival.time)}
            </div>
            <div className="text-sm font-medium">
              {flight.arrival.airport}
              {flight.arrival.terminal &&
                ` (Terminal ${flight.arrival.terminal})`}
            </div>
            <div className="text-muted-foreground text-sm">
              {flight.arrival.city}
            </div>
          </div>
        </div>

        {/* Layover Information */}
        {hasLayovers && (
          <div className="border-t pt-4">
            <div className="mb-2 text-sm font-medium">Layover Details:</div>
            {flight.segments.map((segment, index) => {
              if (index === flight.segments.length - 1) return null
              const nextSegment = flight.segments[index + 1]
              const layoverDuration =
                new Date(nextSegment.departure.time).getTime() -
                new Date(segment.arrival.time).getTime()
              const layoverDurationFormatted = formatDuration(
                layoverDuration.toString()
              )

              return (
                <div
                  key={index}
                  className="text-muted-foreground mb-2 flex items-center gap-2 text-sm"
                >
                  <div className="flex items-center gap-1">
                    <span>{segment.arrival.airport}</span>
                    <ArrowRight className="size-3" />
                    <span>{nextSegment.departure.airport}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="size-3" />
                    <span>{layoverDurationFormatted} layover</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Aircraft and Baggage Info */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-1 text-sm font-medium">Aircraft</div>
              <div className="text-muted-foreground text-sm">
                {flight.segments[0].aircraft ||
                  "Aircraft information not available"}
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                <Luggage className="size-4" />
                <span>Baggage Allowance</span>
              </div>
              <div className="space-y-1">
                {flight.baggage.checked.length > 0 ? (
                  <div className="text-muted-foreground text-sm">
                    <span className="font-medium">Checked:</span>{" "}
                    {flight.baggage.checked.map((bag, i) => (
                      <span key={i}>
                        {bag.quantity}x {bag.weight}
                        {bag.unit}
                        {i < flight.baggage.checked.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    No checked baggage included
                  </div>
                )}
                {flight.baggage.carry_on.length > 0 ? (
                  <div className="text-muted-foreground text-sm">
                    <span className="font-medium">Carry-on:</span>{" "}
                    {flight.baggage.carry_on.map((bag, i) => (
                      <span key={i}>
                        {bag.quantity}x {bag.weight}
                        {bag.unit}
                        {i < flight.baggage.carry_on.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    No carry-on baggage information available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Price and Selection */}
        <div className="flex items-center justify-between border-t pt-4">
          <div>
            <div className="text-lg font-semibold">
              {flight.total_amount} {flight.total_currency}
            </div>
            <div className="text-muted-foreground text-sm">per passenger</div>
          </div>

          <Button
            onClick={onSelect}
            variant={isSelected ? "secondary" : "default"}
          >
            {isSelected ? "Selected" : "Select Flight"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
