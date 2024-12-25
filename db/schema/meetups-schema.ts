/*
<ai_context>
Defines the database schema for meetups.
</ai_context>
*/

import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core"
import { racesTable } from "./races-schema"

export const meetupsTable = pgTable("meetups", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  date: timestamp("date", { withTimezone: false }).notNull(),
  maxAttendees: integer("max_attendees"),
  attendees: text("attendees").array(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  raceId: uuid("race_id")
    .references(() => racesTable.id, { onDelete: "cascade" })
    .notNull()
})

export type InsertMeetup = typeof meetupsTable.$inferInsert
export type SelectMeetup = typeof meetupsTable.$inferSelect
