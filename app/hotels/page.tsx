"use server"

import { Hotel, CalendarClock, Building2 } from "lucide-react"

export default async function HotelsPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-8 px-4 text-center">
      <div className="relative">
        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#B17A50] to-[#c19573] opacity-50 blur"></div>
        <div className="relative rounded-lg bg-white p-6 dark:bg-[#131211]">
          <Building2 className="mx-auto size-16 text-[#B17A50] dark:text-[#c19573]" />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-[#2e2c29] dark:text-white">
          F1 Hotel Finder
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[#494641] dark:text-[#c19573]">
          Find and book the perfect accommodation for your F1 race weekend.
          We're curating a selection of hotels, apartments, and unique stays
          near every circuit on the calendar.
        </p>
      </div>

      <div className="flex items-center space-x-2 text-[#494641] dark:text-[#c19573]">
        <CalendarClock className="size-5" />
        <span>Expected Launch: Early 2025</span>
      </div>

      <div className="mt-8 space-y-4 text-sm text-[#494641] dark:text-[#c19573]">
        <p>Features coming to F1 Hotel Finder:</p>
        <ul className="list-inside list-disc space-y-2">
          <li>Circuit proximity scoring</li>
          <li>Race weekend availability alerts</li>
          <li>Group booking coordination</li>
          <li>Local area insights</li>
          <li>Price tracking and alerts</li>
          <li>Verified F1 fan reviews</li>
        </ul>
      </div>
    </div>
  )
}
