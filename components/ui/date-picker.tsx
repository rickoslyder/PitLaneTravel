"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"

export interface DatePickerProps {
  date?: Date
  onDateChange: (date?: Date) => void
  className?: string
  minDate?: Date
  maxDate?: Date
  fromDate?: Date
  toDate?: Date
  defaultMonth?: Date
  highlightedDates?: Array<{
    date: Date
    highlight: string
  }>
}

export function DatePicker({
  date,
  onDateChange,
  className,
  minDate,
  maxDate,
  fromDate,
  toDate,
  defaultMonth,
  highlightedDates
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          fromDate={fromDate || minDate}
          toDate={toDate || maxDate}
          defaultMonth={defaultMonth || fromDate || minDate}
          modifiers={{
            highlighted: highlightedDates?.map(d => d.date) || []
          }}
          modifiersStyles={{
            highlighted: {
              fontWeight: "bold",
              backgroundColor: "var(--primary-50)",
              color: "var(--primary-900)"
            }
          }}
        />
        {highlightedDates && highlightedDates.length > 0 && (
          <div className="border-t p-3">
            <div className="mb-2 text-sm font-medium">Important Dates:</div>
            {highlightedDates.map((date, i) => (
              <div
                key={i}
                className="text-muted-foreground flex items-center gap-2 text-sm"
              >
                <div className="bg-primary size-2 rounded-full" />
                <span>{format(date.date, "PPP")}</span>
                <span>-</span>
                <span>{date.highlight}</span>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
