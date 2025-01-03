"use client"

import { RaceWithDetails } from "@/types/race"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Ticket,
  Star,
  Package,
  Umbrella,
  Tv,
  Coffee,
  Utensils,
  Wifi,
  Percent
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { WaitlistForm } from "./WaitlistForm"
import { Suspense, useEffect, useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { SelectTicket, SelectTicketPackage } from "@/db/schema"
import { convertPriceAction } from "@/actions/db/currency-actions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { SUPPORTED_CURRENCIES, formatCurrency } from "@/config/currencies"

export function TicketCardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <Skeleton className="h-6 w-[100px]" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-8 w-[150px]" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-[100px]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export function PackageCardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-[100px]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export function TicketSection({ race }: { race: RaceWithDetails }) {
  const [data, setData] = useState<{
    tickets: (SelectTicket & { features: any[]; currentPrice: any })[]
    packages: (SelectTicketPackage & { tickets: any[] })[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/races/${race.id}/tickets`)
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Error fetching tickets:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [race.id])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>Race Tickets</h2>
          <p>Loading tickets...</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <TicketCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (!data?.tickets?.length && !data?.packages?.length) {
    return (
      <div className="space-y-8">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>Race Tickets</h2>
          <p>No tickets are currently available for {race.name}.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2>Race Tickets</h2>
        <p>
          Choose from our selection of tickets for the {race.name}. All tickets
          include access to the circuit for the entire race weekend.
        </p>
      </div>

      <Tabs defaultValue="individual">
        <TabsList>
          <TabsTrigger value="individual">Individual Tickets</TabsTrigger>
          <TabsTrigger value="packages">Ticket Packages</TabsTrigger>
        </TabsList>

        <TabsContent value="individual">
          <div className="grid gap-6 lg:grid-cols-3">
            {data?.tickets?.map((ticket, index) => (
              <TicketCard key={ticket.id} ticket={ticket} index={index} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="packages">
          <div className="grid gap-6 lg:grid-cols-2">
            {data?.packages?.map((package_, index) => (
              <PackageCard
                key={package_.id}
                package_={package_}
                index={index}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TicketCard({
  ticket,
  index
}: {
  ticket: SelectTicket & {
    features: any[]
    currentPrice: any
  }
  index: number
}) {
  const [selectedCurrency, setSelectedCurrency] = useState(
    ticket.currentPrice?.currency || SUPPORTED_CURRENCIES[0].code
  )
  const [convertedPrice, setConvertedPrice] = useState<number | null>(null)
  const [conversionRate, setConversionRate] = useState<number | null>(null)

  const handleCurrencyChange = useCallback(
    async (currency: string) => {
      if (!ticket.currentPrice) return

      if (currency === ticket.currentPrice.currency) {
        setSelectedCurrency(currency)
        setConvertedPrice(null)
        setConversionRate(null)
        return
      }

      try {
        const result = await convertPriceAction(
          Number(ticket.currentPrice.price),
          ticket.currentPrice.currency,
          currency
        )

        if (result.isSuccess) {
          setSelectedCurrency(currency)
          setConvertedPrice(result.data.price)
          setConversionRate(result.data.rate)
        }
      } catch (error) {
        console.error("Error converting price:", error)
      }
    },
    [ticket.currentPrice]
  )

  const formatPrice = (price: string | number) => {
    const numericPrice = typeof price === "string" ? parseFloat(price) : price
    return numericPrice.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const formatTicketType = (type: string) => {
    switch (type) {
      case "grandstand":
        return "Grandstand"
      case "general":
        return "General Admission"
      case "vip":
        return "VIP"
      default:
        return type
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-shadow hover:shadow-lg"
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {ticket.title}
                <Badge variant="outline">
                  {formatTicketType(ticket.ticketType)}
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                {ticket.description}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                ticket.availability === "available"
                  ? "bg-green-500/10 text-green-500"
                  : ticket.availability === "limited"
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-red-500/10 text-red-500"
              )}
            >
              {ticket.availability.charAt(0).toUpperCase() +
                ticket.availability.slice(1)}{" "}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {ticket.currentPrice && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {selectedCurrency}{" "}
                    {formatPrice(convertedPrice ?? ticket.currentPrice.price)}
                  </div>
                  {conversionRate && (
                    <div className="text-muted-foreground text-sm">
                      1 {ticket.currentPrice.currency} ={" "}
                      {formatPrice(conversionRate)} {selectedCurrency}
                    </div>
                  )}
                </div>
                <Select
                  value={selectedCurrency}
                  onValueChange={handleCurrencyChange}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CURRENCIES.map(currency => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {ticket.features && ticket.features.length > 0 && (
              <div>
                <div className="text-muted-foreground mb-2 text-sm font-medium">
                  Features
                </div>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  {ticket.features.map(feature => (
                    <li key={feature.id} className="flex items-center gap-2">
                      <Ticket className="size-4" />
                      {feature.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <div className="text-muted-foreground mb-2 text-sm font-medium">
                Days Included
              </div>
              <div className="flex flex-wrap gap-2">
                {["thursday", "friday", "saturday", "sunday"].map(day => {
                  const isIncluded =
                    ticket.daysIncluded &&
                    typeof ticket.daysIncluded === "object"
                      ? (ticket.daysIncluded as Record<string, boolean>)[day]
                      : Array.isArray(ticket.daysIncluded) &&
                        ticket.daysIncluded.includes(day)

                  return isIncluded ? (
                    <Badge key={day} variant="secondary" className="capitalize">
                      {day}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
          </div>

          {ticket.availability === "available" ? (
            <a
              href={ticket.resellerUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full" size="lg">
                Purchase Tickets
              </Button>
            </a>
          ) : (
            <WaitlistForm
              raceId={ticket.raceId}
              ticketCategoryId={String(ticket.id)}
              ticketCategoryName={ticket.title}
              disabled={ticket.availability === "available"}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function PackageCard({
  package_,
  index
}: {
  package_: SelectTicketPackage & {
    tickets: any[]
  }
  index: number
}) {
  // Calculate total savings
  const totalSavings =
    package_.tickets.reduce((acc, ticket) => {
      const discountPercentage = ticket.discountPercentage
        ? parseFloat(ticket.discountPercentage)
        : 0
      return acc + discountPercentage
    }, 0) || 0

  const formatDiscount = (discount: string | number | null | undefined) => {
    if (!discount) return "0"
    const numericDiscount =
      typeof discount === "string" ? parseFloat(discount) : discount
    return numericDiscount.toFixed(0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="relative overflow-hidden transition-shadow hover:shadow-lg">
        {totalSavings > 0 && (
          <div className="bg-primary absolute right-0 top-0 px-2 py-0.5 text-xs text-white">
            Save up to {totalSavings}%
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5" />
                {package_.name}
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                {package_.description}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="text-muted-foreground mb-2 text-sm font-medium">
                Included Tickets
              </div>
              <ul className="text-muted-foreground space-y-2 text-sm">
                {package_.tickets?.map(ticket => (
                  <li
                    key={ticket.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Ticket className="size-4" />
                      {ticket.title} × {ticket.quantity}
                    </div>
                    {ticket.discountPercentage && (
                      <Badge
                        variant="secondary"
                        className="bg-green-500/10 text-green-500"
                      >
                        <Percent className="mr-1 size-3" />
                        {formatDiscount(ticket.discountPercentage)}% off
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Button className="w-full" size="lg">
            View Package Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
