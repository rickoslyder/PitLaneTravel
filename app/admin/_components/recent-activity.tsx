"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Ticket, Users, Bus, Star, Trophy } from "lucide-react"
import { useEffect, useState } from "react"
import { getRecentAdminActivityAction } from "@/actions/db/admin-activity-actions"
import { SelectAdminActivity } from "@/db/schema/admin-activity-schema"

export function RecentActivity() {
  const [activities, setActivities] = useState<SelectAdminActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivities() {
      const { data } = await getRecentAdminActivityAction()
      if (data) {
        setActivities(data)
      }
      setLoading(false)
    }
    fetchActivities()
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case "ticket":
        return <Ticket className="size-4" />
      case "meetup":
        return <Users className="size-4" />
      case "transport":
        return <Bus className="size-4" />
      case "attraction":
        return <Star className="size-4" />
      case "series":
        return <Trophy className="size-4" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions in the admin panel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-muted-foreground text-sm">
            Loading activities...
          </div>
        ) : activities.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No recent activities
          </div>
        ) : (
          activities.map(activity => (
            <div key={activity.id} className="flex items-center gap-4">
              <div className="text-muted-foreground">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-muted-foreground text-xs">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
