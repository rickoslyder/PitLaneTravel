"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { QuickActions } from "./quick-actions"
import { RecentActivity } from "./recent-activity"
import { MetricsCards } from "./metrics-cards"

export function DashboardTabs() {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <MetricsCards />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <RecentActivity />
          </Card>
          <Card className="col-span-3">
            <QuickActions />
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="analytics">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium">Analytics</h3>
            <p className="text-muted-foreground text-sm">
              Detailed analytics coming soon...
            </p>
          </div>
        </Card>
      </TabsContent>
      <TabsContent value="reports">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium">Reports</h3>
            <p className="text-muted-foreground text-sm">
              Report generation coming soon...
            </p>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
