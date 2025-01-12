"use server"

import { Car, CalendarClock, MapPin } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "F1 Circuit Transport Guide | Local Travel Tips | PitLane Travel",
  description:
    "Navigate your way to and from F1 circuits with ease. Get detailed transport information, parking tips, and local travel advice for race weekends."
}

export default async function TransportPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-8 px-4 text-center">
      <div className="relative">
        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#B17A50] to-[#c19573] opacity-50 blur"></div>
        <div className="relative rounded-lg bg-white p-6 dark:bg-[#131211]">
          <Car className="mx-auto size-16 text-[#B17A50] dark:text-[#c19573]" />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-[#2e2c29] dark:text-white">
          Circuit Transport
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[#494641] dark:text-[#c19573]">
          Plan your journey to and from the circuit with ease. We're building a
          comprehensive transport guide covering every F1 venue, from shuttle
          services to private transfers.
        </p>
      </div>

      <div className="flex items-center space-x-2 text-[#494641] dark:text-[#c19573]">
        <CalendarClock className="size-5" />
        <span>Expected Launch: Early 2025</span>
      </div>

      <div className="mt-8 space-y-4 text-sm text-[#494641] dark:text-[#c19573]">
        <p>Features coming to Circuit Transport:</p>
        <ul className="list-inside list-disc space-y-2">
          <li>Real-time shuttle tracking</li>
          <li>Private transfer booking</li>
          <li>Walking route guides</li>
          <li>Parking spot reservations</li>
          <li>Local transport timetables</li>
          <li>Group transport coordination</li>
        </ul>
      </div>
    </div>
  )
}
