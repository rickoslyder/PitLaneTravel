import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb
} from "drizzle-orm/pg-core"
import { racesTable } from "./races-schema"

export interface TimelineEvent {
  year: string // e.g., "1934" or "1953-1958"
  title: string
  description?: string
}

export interface RecordBreaker {
  title: string
  description: string
}

export interface MemorableMoment {
  year: number
  title: string
  description: string
}

export const raceHistoryTable = pgTable("race_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  raceId: uuid("race_id")
    .references(() => racesTable.id, { onDelete: "cascade" })
    .notNull(),
  // Timeline events stored as JSON array
  timeline: jsonb("timeline").$type<TimelineEvent[]>().notNull(),
  // Record breakers stored as JSON array
  recordBreakers: jsonb("record_breakers").$type<RecordBreaker[]>().notNull(),
  // Memorable moments stored as JSON array
  memorableMoments: jsonb("memorable_moments")
    .$type<MemorableMoment[]>()
    .notNull(),
  // Full history content in Markdown
  fullHistory: text("full_history").notNull(),
  // SEO fields
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertRaceHistory = typeof raceHistoryTable.$inferInsert
export type SelectRaceHistory = typeof raceHistoryTable.$inferSelect
