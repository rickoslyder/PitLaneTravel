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
  CircleOff,
  Flag,
  GitCompare,
  Info,
  LucideIcon,
  MapPin,
  Plane,
  Search
} from "lucide-react"

interface FeatureProps {
  title: string
  description: string
  icon: LucideIcon
}

const features: FeatureProps[] = [
  {
    title: "Race calendar",
    description:
      "Browse the public catalogue for Formula 1, Formula E, MotoGP, IndyCar and WEC",
    icon: Search
  },
  {
    title: "Compare races",
    description:
      "Compare events on travel-decision dimensions, with missing values left unknown",
    icon: GitCompare
  },
  {
    title: "Circuit pages",
    description:
      "Open circuit pages, track maps and grandstand notes where coverage exists",
    icon: Info
  },
  {
    title: "Race pages",
    description:
      "Open supported race pages for dates, circuit context and planning entry points",
    icon: Flag
  },
  {
    title: "Flight search",
    description:
      "Search flight options as a planning affordance with an external provider handoff",
    icon: Plane
  },
  {
    title: "Hotel city search",
    description:
      "Open a generic Booking.com city search. Confirm distance and terms on the provider",
    icon: MapPin
  },
  {
    title: "Planning tools",
    description:
      "Use compare and trip-planning tools to assemble a self-directed weekend",
    icon: Calendar
  },
  {
    title: "Honest limits",
    description:
      "Unavailable packages, unknown coverage and empty states stay labelled as such",
    icon: CircleOff
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
            Tools for choosing a race weekend
          </h2>
          <p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-center text-lg">
            A five-series calendar, race and circuit pages, compare tools,
            and labelled external search.
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
