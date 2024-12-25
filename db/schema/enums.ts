import { pgEnum } from "drizzle-orm/pg-core"

export const raceStatus = pgEnum("race_status", [
  "live",
  "upcoming",
  "completed",
  "cancelled"
])
