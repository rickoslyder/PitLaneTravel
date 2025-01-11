"use server"

import { Wallet, CalendarClock } from "lucide-react"

export default async function BudgetPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-8 px-4 text-center">
      <div className="relative">
        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#B17A50] to-[#c19573] opacity-50 blur"></div>
        <div className="relative rounded-lg bg-white p-6 dark:bg-[#131211]">
          <Wallet className="mx-auto size-16 text-[#B17A50] dark:text-[#c19573]" />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-[#2e2c29] dark:text-white">
          Trip Budget Planner
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[#494641] dark:text-[#c19573]">
          Your personal F1 travel budget management tool is coming soon. Track
          expenses, split costs with friends, and manage your race weekend
          budget all in one place.
        </p>
      </div>

      <div className="flex items-center space-x-2 text-[#494641] dark:text-[#c19573]">
        <CalendarClock className="size-5" />
        <span>Expected Launch: Early 2025</span>
      </div>

      <div className="mt-8 space-y-4 text-sm text-[#494641] dark:text-[#c19573]">
        <p>Features coming to Trip Budget Planner:</p>
        <ul className="list-inside list-disc space-y-2">
          <li>Real-time expense tracking</li>
          <li>Split payments with group members</li>
          <li>Multi-currency support</li>
          <li>Budget vs actual spending analysis</li>
          <li>Export financial reports</li>
        </ul>
      </div>
    </div>
  )
}
