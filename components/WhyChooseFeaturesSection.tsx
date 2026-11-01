"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Calendar, GitCompare, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { siteCopy } from "@/config/site-copy"

const featureIcons = [Calendar, MapPin, GitCompare]

export default function WhyChooseFeaturesSection({
  packagesLive = false
}: {
  packagesLive?: boolean
}) {
  const section = siteCopy(packagesLive).whyChoose
  const features = section.cards.map((card, index) => ({
    ...card,
    icon: featureIcons[index] ?? Calendar
  }))
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
            {section.heading}
          </h2>
          <p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-center text-lg">
            {section.intro}
          </p>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
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
