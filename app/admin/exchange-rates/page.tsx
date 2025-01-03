"use server"

import { Suspense } from "react"
import { ExchangeRatesTable } from "./_components/exchange-rates-table"
import { ExchangeRatesTableSkeleton } from "./_components/exchange-rates-table-skeleton"

export default async function ExchangeRatesPage() {
  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Exchange Rates</h2>
          <p className="text-muted-foreground">
            View and manage currency exchange rates
          </p>
        </div>
      </div>

      <Suspense fallback={<ExchangeRatesTableSkeleton />}>
        <ExchangeRatesTable />
      </Suspense>
    </div>
  )
}
