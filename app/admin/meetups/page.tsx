"use server"

import { Suspense } from "react"
import { db } from "@/db/db"
import { meetupsTable, racesTable, SelectMeetup } from "@/db/schema"
import { desc, eq, sql } from "drizzle-orm"
import { Card } from "@/components/ui/card"
import MeetupsTable from "./_components/meetups-table"
import MeetupsSkeleton from "./_components/meetups-skeleton"
import { CreateMeetupDialog } from "./_components/create-meetup-dialog"
import { Button } from "@/components/ui/button"

async function getMeetups() {
  const meetups = await db
    .select({
      id: meetupsTable.id,
      title: meetupsTable.title,
      description: meetupsTable.description,
      location: meetupsTable.location,
      date: meetupsTable.date,
      maxAttendees: meetupsTable.maxAttendees,
      attendees: meetupsTable.attendees,
      createdAt: meetupsTable.createdAt,
      updatedAt: meetupsTable.updatedAt,
      userId: meetupsTable.userId,
      raceId: meetupsTable.raceId,
      race: {
        name: racesTable.name
      }
    })
    .from(meetupsTable)
    .leftJoin(racesTable, eq(meetupsTable.raceId, racesTable.id))
    .orderBy(desc(meetupsTable.createdAt))
  return meetups as (SelectMeetup & { race: { name: string } | null })[]
}

export default async function MeetupsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Meetups</h1>
        <CreateMeetupDialog>
          <Button>Create Meetup</Button>
        </CreateMeetupDialog>
      </div>

      <Card>
        <Suspense fallback={<MeetupsSkeleton />}>
          <MeetupsTableWrapper />
        </Suspense>
      </Card>
    </div>
  )
}

async function MeetupsTableWrapper() {
  const meetups = await getMeetups()
  return <MeetupsTable meetups={meetups} />
}
