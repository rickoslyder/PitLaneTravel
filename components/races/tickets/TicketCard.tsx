"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Coffee,
  Star,
  Tv,
  Umbrella,
  Utensils,
  Wifi,
  Ticket
} from "lucide-react"
import { cn, formatTicketType } from "@/lib/utils"
import { WaitlistForm } from "./WaitlistForm"
import { SelectTicket } from "@/db/schema"
import { SUPPORTED_CURRENCIES } from "@/config/currencies"
import { convertPriceAction } from "@/actions/db/currency-actions"
import { generateMaskedUrlAction } from "@/actions/db/ticket-redirect-actions"
import { affiliatePartnerFromUrl } from "@/lib/ticket-affiliate"
import {
  TICKET_BUY_LABEL,
  resellerHost,
  ticketAvailabilityLabel,
  ticketShowsBuyButton,
  ticketShowsWaitlist
} from "./ticket-presentation"

interface TicketCardProps {
  ticket: SelectTicket & {
    features: any[]
    currentPrice: any
  }
  index: number
}

function getFeatureIcon(category: string) {
  switch (category?.toLowerCase()) {
    case "hospitality":
      return <Coffee className="size-4" />
    case "catering":
      return <Utensils className="size-4" />
    case "access":
      return <Star className="size-4" />
    case "view":
      return <Tv className="size-4" />
    case "comfort":
      return <Umbrella className="size-4" />
    case "connectivity":
      return <Wifi className="size-4" />
    default:
      return <Ticket className="size-4" />
  }
}

export function TicketCard({ ticket, index }: TicketCardProps) {
  const [selectedCurrency, setSelectedCurrency] = useState(
    ticket.currentPrice?.currency || SUPPORTED_CURRENCIES[0].code
  )
  const [convertedPrice, setConvertedPrice] = useState<number | null>(null)
  const [conversionRate, setConversionRate] = useState<number | null>(null)
  const [maskedUrl, setMaskedUrl] = useState<string | null>(null)
  const [isLoadingUrl, setIsLoadingUrl] = useState(true)

  const showBuyButton = ticketShowsBuyButton(ticket.availability)
  const showWaitlist = ticketShowsWaitlist(ticket.availability)

  useEffect(() => {
    if (!showBuyButton) {
      setMaskedUrl(null)
      setIsLoadingUrl(false)
      return
    }

    async function generateUrl() {
      try {
        setIsLoadingUrl(true)
        const result = await generateMaskedUrlAction(
          ticket.id,
          ticket.resellerUrl
        )
        if (result.isSuccess) {
          setMaskedUrl(result.data)
        } else {
          // Fallback to original URL if masking fails
          setMaskedUrl(ticket.resellerUrl)
        }
      } catch (error) {
        console.error("Error generating masked URL:", error)
        setMaskedUrl(ticket.resellerUrl)
      } finally {
        setIsLoadingUrl(false)
      }
    }
    generateUrl()
  }, [showBuyButton, ticket.id, ticket.resellerUrl])

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

  const sellerHost = resellerHost(ticket.resellerUrl)
  const affiliatePartner = affiliatePartnerFromUrl(ticket.resellerUrl)
  const buyLabel = affiliatePartner
    ? `Buy from ${affiliatePartner}`
    : TICKET_BUY_LABEL
  const linkCaption = sellerHost
    ? `Opens ${sellerHost}`
    : affiliatePartner
      ? `Opens ${affiliatePartner}`
      : "Opens the official seller's site"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-shadow hover:shadow-lg",
          ticket.isChildTicket && "border-primary/50"
        )}
      >
        {ticket.isChildTicket && (
          <div className="bg-primary absolute left-0 top-0 px-2 py-0.5 text-xs text-white">
            Child Ticket
          </div>
        )}

        <CardHeader className="space-y-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  {ticket.seatingDetails || ticket.title}
                </CardTitle>
                {ticket.seatingDetails && (
                  <p className="text-muted-foreground mt-1 text-sm">
                    {ticket.title}
                  </p>
                )}
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "shrink-0",
                  ticket.availability === "available"
                    ? "bg-green-500/10 text-green-500"
                    : ticket.availability === "limited"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-red-500/10 text-red-500"
                )}
              >
                {ticketAvailabilityLabel(ticket.availability)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {formatTicketType(ticket.ticketType)}
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">{ticket.description}</p>
        </CardHeader>

        <CardContent className="space-y-8">
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

          <div className="space-y-6">
            {ticket.features && ticket.features.length > 0 && (
              <div>
                <div className="text-muted-foreground mb-2 text-sm font-medium">
                  Features
                </div>
                <div
                  className={cn(
                    "grid gap-2",
                    ticket.features.length === 1 ? "grid-cols-1" : "grid-cols-2"
                  )}
                >
                  {ticket.features.map(feature => (
                    <div
                      key={feature.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      {getFeatureIcon(feature.category)}
                      {feature.name}
                    </div>
                  ))}
                </div>
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

                  return (
                    <Badge
                      key={day}
                      variant={isIncluded ? "secondary" : "outline"}
                      className={cn("capitalize", !isIncluded && "opacity-50")}
                    >
                      {day}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>

          {showBuyButton ? (
            <div className="mt-4 space-y-2">
              <a
                href={maskedUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  (!maskedUrl || isLoadingUrl) &&
                    "pointer-events-none opacity-50",
                  "block"
                )}
              >
                <Button className="w-full" size="lg" disabled={isLoadingUrl}>
                  {isLoadingUrl ? "Loading..." : buyLabel}
                </Button>
              </a>
              <p className="text-muted-foreground text-center text-xs">
                {linkCaption}
              </p>
            </div>
          ) : showWaitlist ? (
            <WaitlistForm
              raceId={ticket.raceId}
              ticketCategoryId={String(ticket.id)}
              ticketCategoryName={ticket.title}
              disabled={false}
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              {affiliatePartner
                ? `Sold out at ${affiliatePartner}.`
                : "Sold out at the official seller."}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
