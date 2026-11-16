/*
<ai_context>
This server component provides the features section for the landing page.
</ai_context>
*/

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { siteCopy } from "@/config/site-copy"
import {
  Calendar,
  Flag,
  GitCompare,
  Info,
  LucideIcon,
  MapPin,
  Plane,
  Search,
  Shield
} from "lucide-react"

interface FeatureProps {
  title: string
  description: string
  icon: LucideIcon
}

const featureIcons: LucideIcon[] = [
  Calendar,
  GitCompare,
  Flag,
  Info,
  Search,
  MapPin,
  Shield,
  Plane
]

const FeatureCard = ({ title, description, icon: Icon }: FeatureProps) => (
  <div className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:scale-[1.02]">
    <Card className="group h-full transition-shadow duration-200 hover:shadow-lg">
      <CardHeader>
        <Icon className="text-foreground mb-2 size-12" />
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
    </Card>
  </div>
)

export const FeaturesSection = ({
  packagesLive = false
}: {
  packagesLive?: boolean
}) => {
  const features: FeatureProps[] = siteCopy(packagesLive).featureCards.map(
    (feature, index) => ({
      ...feature,
      icon: featureIcons[index] ?? Info
    })
  )

  return (
    <section className="mt-20 bg-gradient-to-b from-gray-50 to-white py-20 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="home-rise">
          <h2 className="mb-4 text-center text-4xl font-bold">
            Know before you go
          </h2>
          <p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-center text-lg">
            What fans who&apos;ve been would tell you, before you book.
          </p>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
