"use server"

import { Binoculars, CalendarClock } from "lucide-react"

export default async function GrandstandsPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-8 px-4 text-center">
      <div className="relative">
        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#B17A50] to-[#c19573] opacity-50 blur"></div>
        <div className="relative rounded-lg bg-white p-6 dark:bg-[#131211]">
          <Binoculars className="mx-auto size-16 text-[#B17A50] dark:text-[#c19573]" />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-[#2e2c29] dark:text-white">
          Grandstand Guide
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[#494641] dark:text-[#c19573]">
          Find your perfect viewing spot at every F1 circuit. Our comprehensive
          grandstand guide will help you choose the best seats with detailed
          comparisons, photos, and fan reviews.
        </p>
      </div>

      <div className="flex items-center space-x-2 text-[#494641] dark:text-[#c19573]">
        <CalendarClock className="size-5" />
        <span>Expected Launch: Early 2025</span>
      </div>

      <div className="mt-8 space-y-4 text-sm text-[#494641] dark:text-[#c19573]">
        <p>Features coming to Grandstand Guide:</p>
        <ul className="list-inside list-disc space-y-2">
          <li>360° virtual seat previews</li>
          <li>Price vs. view quality analysis</li>
          <li>Shade coverage timing maps</li>
          <li>Fan photo submissions</li>
          <li>Amenity proximity scoring</li>
          <li>Best moments by seating area</li>
        </ul>
      </div>
    </div>
  )
}
