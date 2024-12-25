/*
<ai_context>
This client component provides the features section for the landing page.
</ai_context>
*/

"use client"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { motion } from "framer-motion"
import {
  Calendar,
  Flag,
  Info,
  LucideIcon,
  MapPin,
  Route,
  Search,
  Users
} from "lucide-react"

interface FeatureProps {
  title: string
  description: string
  icon: LucideIcon
}

const features: FeatureProps[] = [
  {
    title: "Race Discovery",
    description:
      "Find and compare F1 races worldwide with our comprehensive search tools",
    icon: Search
  },
  {
    title: "Travel Planning",
    description:
      "Get detailed travel information and transportation options for each circuit",
    icon: Route
  },
  {
    title: "Circuit Information",
    description:
      "Access detailed track maps, grandstand locations, and facilities info",
    icon: Info
  },
  {
    title: "Community Reviews",
    description:
      "Read and share experiences from fellow F1 fans who've attended races",
    icon: Users
  },
  {
    title: "Race Guides",
    description:
      "Essential tips and local information for each Grand Prix weekend",
    icon: Flag
  },
  {
    title: "Event Details",
    description: "Up-to-date race schedules and weekend activity information",
    icon: Calendar
  },
  {
    title: "Local Tips",
    description:
      "Insider knowledge about each race location and surrounding areas",
    icon: MapPin
  },
  {
    title: "Trip Planning",
    description: "Tools to help organize your perfect F1 race weekend",
    icon: Calendar
  }
]

const FeatureCard = ({ title, description, icon: Icon }: FeatureProps) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300 }}
    className="transform-gpu"
  >
    <Card className="group h-full transition-shadow duration-200 hover:shadow-lg">
      <CardHeader>
        <Icon className="mb-2 size-12 text-[#E10600]" />
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
    </Card>
  </motion.div>
)

export const FeaturesSection = () => {
  return (
    <section className="mt-20 bg-gradient-to-b from-gray-50 to-white py-20 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="mb-4 text-center text-4xl font-bold">
            Plan Your Perfect F1 Weekend
          </h2>
          <p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-center text-lg">
            Everything you need to research, plan, and organize your Formula 1
            race experience.
          </p>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
