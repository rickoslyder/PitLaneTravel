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

function FlightSegment({
  segment,
  showStopover
}: {
  segment: TransformedFlightOffer["slices"][0]["segments"][0]
  showStopover: boolean
}) {
  return (
    <div className="relative">
      <div className="grid gap-6 sm:grid-cols-[1fr,auto,1fr]">
        {/* Departure */}
        <div>
          <div className="mb-2">
            <div className="text-lg font-medium">
              {formatTime(segment.departure.time)}
            </div>
            <div className="text-muted-foreground text-sm">
              {formatDate(segment.departure.time)}
            </div>
          </div>
          <div>
            <div className="font-medium">{segment.departure.airport}</div>
            {segment.departure.city && (
              <div className="text-muted-foreground text-sm">
                {segment.departure.city}
                {segment.departure.terminal &&
                  ` • Terminal ${segment.departure.terminal}`}
              </div>
            )}
          </div>
        </div>

        {/* Duration */}
        <div className="flex flex-col items-center justify-center">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Clock className="size-4" />
            <span>{formatDuration(segment.duration)}</span>
          </div>
          <div className="relative flex w-full items-center justify-center">
            <div className="bg-border absolute inset-x-0 h-[1px]" />
            <ArrowRight className="bg-background relative size-4 rotate-0" />
          </div>
          {showStopover && (
            <div className="text-muted-foreground mt-2 text-center text-sm">
              Stopover
            </div>
          )}
        </div>

        {/* Arrival */}
        <div className="text-right">
          <div className="mb-2">
            <div className="text-lg font-medium">
              {formatTime(segment.arrival.time)}
            </div>
            <div className="text-muted-foreground text-sm">
              {formatDate(segment.arrival.time)}
            </div>
          </div>
          <div>
            <div className="font-medium">{segment.arrival.airport}</div>
            {segment.arrival.city && (
              <div className="text-muted-foreground text-sm">
                {segment.arrival.city}
                {segment.arrival.terminal &&
                  ` • Terminal ${segment.arrival.terminal}`}
              </div>
            )}
          </div>
        </div>
      </div>

      {showStopover && (
        <div className="bg-muted/50 text-muted-foreground my-4 rounded-md p-2 text-center text-sm">
          Connection time:{" "}
          {formatDuration(
            String(
              Math.floor(
                (new Date(segment.arrival.time).getTime() -
                  new Date(segment.departure.time).getTime()) /
                  1000
              )
            )
          )}
        </div>
      )}
    </div>
  )
}

function FlightSlice({
  slice,
  index
}: {
  slice: TransformedFlightOffer["slices"][0]
  index: number
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
          {index === 0 ? "Outbound" : "Return"} Flight
        </Badge>
        <div className="text-muted-foreground text-sm">
          Total duration: {formatDuration(slice.duration)}
        </div>
      </div>

      {slice.segments.map((segment, segmentIndex) => (
        <FlightSegment
          key={`${segment.flight_number}-${segmentIndex}`}
          segment={segment}
          showStopover={segmentIndex < slice.segments.length - 1}
        />
      ))}

      {slice.segments.length > 1 &&
        slice.segments.map((segment, segmentIndex) => {
          if (segmentIndex < slice.segments.length - 1) {
            const connectionTime = Math.floor(
              (new Date(
                slice.segments[segmentIndex + 1].departure.time
              ).getTime() -
                new Date(segment.arrival.time).getTime()) /
                1000
            )
            return (
              <div
                key={`connection-${segmentIndex}`}
                className="bg-muted/50 text-muted-foreground my-4 rounded-md p-2 text-center text-sm"
              >
                Connection time: {formatDuration(String(connectionTime))}
              </div>
            )
          }
          return null
        })}
    </div>
  )
}

export function FlightDetails({
  flight,
  onSelect,
  isSelected
}: FlightDetailsProps) {
  return (
    <Card
      className={`hover:bg-accent/50 relative overflow-hidden transition-colors ${
        isSelected ? "border-primary" : ""
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {flight.airline.logo_symbol_url ? (
              <img
                src={flight.airline.logo_symbol_url}
                alt={flight.airline.name}
                className="size-12 object-contain"
              />
            ) : (
              <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
                <Plane className="text-primary size-6" />
              </div>
            )}
            <div>
              <div className="font-medium">{flight.airline.name}</div>
              <div className="text-muted-foreground text-sm">
                {flight.slices
                  ?.map((slice, i) =>
                    slice.segments
                      ?.map(segment => segment.flight_number)
                      .join(", ")
                  )
                  .join(" / ") || "Flight number not available"}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="font-medium">
              {flight.total_amount} {flight.total_currency}
            </div>
            <div className="text-muted-foreground text-sm">
              {flight.tax_amount && flight.tax_currency
                ? `Including ${flight.tax_amount} ${flight.tax_currency} tax`
                : "Tax included"}
            </div>
          </div>
        </div>

        {/* Flight Slices */}
        <div className="space-y-8">
          {flight.slices?.map((slice, index) => (
            <FlightSlice key={`slice-${index}`} slice={slice} index={index} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 border-t pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Flight Details */}
            <div className="space-y-2">
              <div className="mb-1 text-sm font-medium">Flight Details</div>
              <div className="text-muted-foreground space-y-1 text-sm">
                {flight.slices?.map((slice, sliceIndex) =>
                  slice.segments?.map((segment, segmentIndex) => (
                    <div key={`${sliceIndex}-${segmentIndex}`}>
                      {segment.aircraft && (
                        <div>Aircraft: {segment.aircraft}</div>
                      )}
                      {segment.operating_carrier && (
                        <div>
                          Operated by: {segment.operating_carrier.name} (
                          {segment.operating_carrier.iata_code})
                        </div>
                      )}
                      {segment.marketing_carrier &&
                        segment.marketing_carrier.iata_code !==
                          segment.operating_carrier?.iata_code && (
                          <div>
                            Marketed by: {segment.marketing_carrier.name} (
                            {segment.marketing_carrier.iata_code})
                          </div>
                        )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Baggage */}
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                <Luggage className="size-4" />
                <span>Baggage Allowance</span>
              </div>
              <div className="space-y-1">
                {flight.baggage.checked.length > 0 && (
                  <div className="text-muted-foreground text-sm">
                    <span className="font-medium">Checked:</span>{" "}
                    {flight.baggage.checked.map((bag, i) => (
                      <span key={i}>
                        {bag.quantity}x bag
                        {i < flight.baggage.checked.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                )}
                {flight.baggage.carry_on.length > 0 && (
                  <div className="text-muted-foreground text-sm">
                    <span className="font-medium">Carry-on:</span>{" "}
                    {flight.baggage.carry_on.map((bag, i) => (
                      <span key={i}>
                        {bag.quantity}x bag
                        {i < flight.baggage.carry_on.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {!flight.conditions.changeable && (
              <Badge variant="secondary">No changes allowed</Badge>
            )}
            {!flight.conditions.refundable && (
              <Badge variant="secondary">Non-refundable</Badge>
            )}
          </div>

          {/* Select Button */}
          <div className="mt-4 flex justify-end">
            <Button onClick={onSelect} disabled={isSelected}>
              {isSelected ? "Selected" : "Select"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
