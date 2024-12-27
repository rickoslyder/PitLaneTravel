"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Ticket, Calendar, Activity } from "lucide-react"
import { useEffect, useState } from "react"
import { getDashboardDataAction } from "@/actions/db/dashboard-actions"

interface DashboardData {
  userCount: number
  adminCount: number
  ticketCount: number
  meetupCount: number
  activeNow: number
}

export function MetricsCards() {
  const [data, setData] = useState<DashboardData>({
    userCount: 0,
    adminCount: 0,
    ticketCount: 0,
    meetupCount: 0,
    activeNow: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const response = await getDashboardDataAction()
      if (response.isSuccess) {
        setData(response.data)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : data.userCount}
          </div>
          <p className="text-muted-foreground text-xs">
            {loading ? "..." : `${data.adminCount} admins`}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
          <Ticket className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : data.ticketCount}
          </div>
          <p className="text-muted-foreground text-xs">
            Active ticket packages
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          <Calendar className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : data.meetupCount}
          </div>
          <p className="text-muted-foreground text-xs">Scheduled meetups</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Now</CardTitle>
          <Activity className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : data.activeNow}
          </div>
          <p className="text-muted-foreground text-xs">Users online</p>
        </CardContent>
      </Card>
    </div>
  )
}
