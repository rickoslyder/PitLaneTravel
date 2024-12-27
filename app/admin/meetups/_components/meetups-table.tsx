"use client"

import { useState } from "react"
import { SelectMeetup } from "@/db/schema"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { deleteMeetupAction } from "@/actions/db/meetups-actions"
import { toast } from "sonner"
import EditMeetupDialog from "./edit-meetup-dialog"
import { useAuth } from "@clerk/nextjs"

interface MeetupsTableProps {
  meetups: (SelectMeetup & {
    race: {
      name: string
    } | null
  })[]
}

export default function MeetupsTable({ meetups }: MeetupsTableProps) {
  const [optimisticMeetups, setOptimisticMeetups] = useState(meetups)
  const { userId } = useAuth()

  async function handleDelete(id: string) {
    if (!userId) {
      toast.error("You must be logged in to delete a meetup")
      return
    }

    const result = await deleteMeetupAction(id, userId)
    if (result.isSuccess) {
      setOptimisticMeetups(prev => prev.filter(m => m.id !== id))
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Race</TableHead>
              <TableHead>Attendees</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticMeetups.map(meetup => (
              <TableRow key={meetup.id}>
                <TableCell>{meetup.title}</TableCell>
                <TableCell>{meetup.description}</TableCell>
                <TableCell>{meetup.location}</TableCell>
                <TableCell>
                  {format(new Date(meetup.date), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell>{meetup.race?.name || "No race"}</TableCell>
                <TableCell>
                  {meetup.attendees?.length || 0} / {meetup.maxAttendees}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="size-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <EditMeetupDialog meetup={meetup} />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(meetup.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
