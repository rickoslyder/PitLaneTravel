"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, GitCompare, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const affordances = [
  {
    title: "Five-series calendar",
    icon: Calendar,
    href: "/races",
    text: "Browse Formula 1, Formula E, MotoGP, IndyCar and WEC events on the public race calendar."
  },
  {
    title: "Race and circuit pages",
    icon: MapPin,
    href: "/circuits/grandstands",
    text: "Open race and circuit pages where coverage exists, including grandstand notes when they are published."
  },
  {
    title: "Compare and plan",
    icon: GitCompare,
    href: "/races/compare",
    text: "Compare events, then use planning tools and labelled external search for flights and stays."
  }
]

export default function TestimonialSection() {
  return (
    <section className="mt-20 bg-gradient-to-b from-gray-50 to-white py-20 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="mb-4 text-center text-4xl font-bold">
            From calendar to plan
          </h2>
          <p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-center text-lg">
            PitLane Travel is a decision layer for self-directed travellers.
            Open the live tools, then assemble the trip yourself.
          </p>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
            {affordances.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Link href={item.href} className="block h-full">
                  <Card className="group h-full transition-shadow duration-200 hover:shadow-lg">
                    <CardHeader className="flex flex-col items-center">
                      <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-[#E10600]">
                        <item.icon className="size-8 text-white" />
                      </div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-center">
                        {item.text}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
