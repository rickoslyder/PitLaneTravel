"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Info, Clock, ThumbsUp } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    title: "Reliable Information",
    description:
      "Access trustworthy, up-to-date advice on grandstand views, transportation, and local logistics.",
    icon: Info,
    details:
      "Our team of F1 experts constantly updates our database with the latest information about each circuit, ensuring you have access to the most accurate and reliable data for your trip planning."
  },
  {
    title: "Time-Saving Planning",
    description:
      "Coordinate flights, accommodations, and circuit details all in one place, saving you time and effort.",
    icon: Clock,
    details:
      "Our smart planning tools allow you to seamlessly integrate flight bookings, accommodation options, and circuit-specific information, cutting down your planning time from days to hours."
  },
  {
    title: "Confident Decision-Making",
    description:
      "Make informed choices about travel routes, budget options, and potential costs with our expert guidance.",
    icon: ThumbsUp,
    details:
      "With our comprehensive cost breakdowns, user reviews, and expert recommendations, you can make decisions with confidence, knowing you're getting the best value for your F1 experience."
  }
]

export default function WhyChooseFeaturesSection() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  return (
    <section className="mt-20 bg-gradient-to-b from-gray-50 to-white py-20 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="mb-4 text-center text-4xl font-bold">
            Why Choose PitLane Travel?
          </h2>
          <p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-center text-lg">
            Experience Formula 1 travel planning done right, with expert
            guidance every step of the way.
          </p>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card
                  className="group h-full cursor-pointer transition-shadow duration-200 hover:shadow-lg"
                  onClick={() =>
                    setActiveFeature(activeFeature === index ? null : index)
                  }
                >
                  <CardHeader>
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#E10600]">
                      <feature.icon className="size-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-lg">
                      {feature.description}
                      <div
                        className={`mt-4 overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                          activeFeature === index ? "max-h-96" : "max-h-0"
                        }`}
                      >
                        {feature.details}
                      </div>
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
