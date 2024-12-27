"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Ticket, Users, Bus } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks you can perform</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Link href="/admin/tickets?action=create">
          <Button className="w-full">
            <Plus className="mr-2 size-4" />
            <Ticket className="mr-2 size-4" />
            Create Ticket Package
          </Button>
        </Link>
        <Link href="/admin/meetups?action=create">
          <Button className="w-full">
            <Plus className="mr-2 size-4" />
            <Users className="mr-2 size-4" />
            Schedule Meetup
          </Button>
        </Link>
        <Link href="/admin/transport?action=create">
          <Button className="w-full">
            <Plus className="mr-2 size-4" />
            <Bus className="mr-2 size-4" />
            Add Transport
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
