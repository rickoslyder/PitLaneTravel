"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { toast } from "sonner"
import {
  getAllExchangeRatesAction,
  manuallyUpdateExchangeRatesAction
} from "@/actions/db/currency-actions"
import { SelectCurrencyRate } from "@/db/schema/currency-rates-schema"

export function ExchangeRatesTable() {
  const [rates, setRates] = useState<SelectCurrencyRate[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const fetchRates = useCallback(async () => {
    const result = await getAllExchangeRatesAction()
    if (result.isSuccess) {
      setRates(result.data)
    } else {
      toast.error(result.message)
    }
  }, [])

  useEffect(() => {
    fetchRates()
  }, [fetchRates])

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const result = await manuallyUpdateExchangeRatesAction()

      if (result.isSuccess) {
        toast.success(result.message)
        await fetchRates()
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to update exchange rates")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleRefresh} disabled={loading} className="gap-2">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Rates
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.map(rate => (
              <TableRow key={rate.id}>
                <TableCell className="font-medium">
                  {rate.fromCurrency}
                </TableCell>
                <TableCell>{rate.toCurrency}</TableCell>
                <TableCell>{Number(rate.rate).toFixed(6)}</TableCell>
                <TableCell>
                  {format(new Date(rate.lastUpdated), "PPp")}
                </TableCell>
                <TableCell>
                  {rate.lastFetchError ? (
                    <Badge variant="destructive">Error</Badge>
                  ) : (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {rates.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No exchange rates found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
