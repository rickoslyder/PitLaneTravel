import { ComingSoon } from "@/components/ui/coming-soon"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "F1 Travel Packages - Coming Soon | PitLane Travel",
  description:
    "Premium F1 travel packages coming soon. Get ready for an unforgettable Formula 1 experience with exclusive race weekend packages, VIP hospitality, and luxury accommodations."
}

export default function PackagesPage() {
  return (
    <ComingSoon
      title="F1 Travel Packages Coming Soon"
      description="We're crafting premium F1 travel experiences that will get you closer to the action. Stay tuned for exclusive race weekend packages, VIP hospitality, and luxury accommodations."
    />
  )
}
