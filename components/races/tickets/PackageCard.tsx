"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Ticket, Percent } from "lucide-react"
import { SelectTicketPackage } from "@/db/schema"

interface PackageCardProps {
  package_: SelectTicketPackage & {
    tickets: any[]
  }
  index: number
}

export function PackageCard({ package_, index }: PackageCardProps) {
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
