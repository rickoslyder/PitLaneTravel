"use server"

import { PageHeader } from "@/components/ui/page-header"
import { DashboardTabs } from "./_components/dashboard-tabs"
import { MetricsCards } from "./_components/metrics-cards"

export default async function AdminPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to your admin dashboard"
      />
      <DashboardTabs />
    </div>
  )
}
