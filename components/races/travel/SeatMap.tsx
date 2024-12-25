"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface SeatMapProps {
  seatMap: {
    cabins: {
      rows: {
        elements: {
          designator: string
          type: "seat" | "exit" | "aisle" | "other"
          available: boolean
          price?: {
            amount: string
            currency: string
          }
        }[]
      }[]
    }[]
  }
  selectedSeats: string[]
  onSeatSelect: (seatId: string) => void
  passengerCount: number
}

export function SeatMap({
  seatMap,
  selectedSeats,
  onSeatSelect,
  passengerCount
}: SeatMapProps) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 font-medium">Select Your Seats</h3>
      <p className="text-muted-foreground mb-4 text-sm">
        Please select {passengerCount} seat{passengerCount > 1 ? "s" : ""}
      </p>

      <div className="space-y-8">
        {seatMap.cabins.map((cabin, cabinIndex) => (
          <div key={cabinIndex} className="space-y-2">
            <div className="grid gap-2">
              {cabin.rows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-2">
                  {row.elements.map((element, elementIndex) => {
                    if (element.type === "aisle") {
                      return (
                        <div
                          key={elementIndex}
                          className="size-8"
                          aria-hidden="true"
                        />
                      )
                    }

                    if (element.type !== "seat") {
                      return (
                        <div
                          key={elementIndex}
                          className="bg-muted size-8"
                          aria-hidden="true"
                        />
                      )
                    }

                    const isSelected = selectedSeats.includes(
                      element.designator
                    )
                    const canSelect =
                      element.available &&
                      (isSelected || selectedSeats.length < passengerCount)

                    return (
                      <Button
                        key={elementIndex}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "size-8 p-0",
                          !element.available && "cursor-not-allowed opacity-50",
                          element.price && "border-primary"
                        )}
                        onClick={() =>
                          canSelect && onSeatSelect(element.designator)
                        }
                        disabled={!canSelect}
                        title={
                          element.price
                            ? `${element.price.amount} ${element.price.currency}`
                            : undefined
                        }
                      >
                        {element.designator}
                      </Button>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="size-4 rounded border" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="border-primary size-4 rounded border" />
                <span>Premium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-primary size-4 rounded" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-muted size-4 rounded" />
                <span>Unavailable</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
