/*
<ai_context>
Coverage evidence records for derived Tier 0–4 depth. Tier is never stored; Packet B
derives it from verified, unrevoked, unexpired evidence. Multiple rows per race/kind
are allowed so sources and offers are not flattened. Typed attribute shapes live in
lib, not as provider-specific columns.
</ai_context>
*/

import { sql } from "drizzle-orm"
import {
  check,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"
import { racesTable } from "./races-schema"

export const coverageEvidenceKindEnum = pgEnum("coverage_evidence_kind", [
  "calendar",
  "logistics",
  "decision_guide",
  "live_offer",
  "personalized_plan"
])

export const coverageReviewStateEnum = pgEnum("coverage_review_state", [
  "pending",
  "verified",
  "rejected"
])

export const coverageEvidenceTable = pgTable(
  "coverage_evidence",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    raceId: uuid("race_id")
      .references(() => racesTable.id, { onDelete: "cascade" })
      .notNull(),
    kind: coverageEvidenceKindEnum("kind").notNull(),
    sourceUrl: text("source_url").notNull(),
    sourceLabel: text("source_label").notNull(),
    attributes: jsonb("attributes").notNull().default(sql`'{}'::jsonb`),
    verifiedAt: timestamp("verified_at", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    reviewState: coverageReviewStateEnum("review_state")
      .default("pending")
      .notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  table => ({
    expiresAfterVerified: check(
      "coverage_evidence_expires_after_verified",
      sql`${table.expiresAt} > ${table.verifiedAt}`
    ),
    sourceUrlHttp: check(
      "coverage_evidence_source_url_http",
      sql`(starts_with(${table.sourceUrl}, 'https://') OR starts_with(${table.sourceUrl}, 'http://'))`
    ),
    raceKindReviewIdx: index("coverage_evidence_race_kind_review_idx").on(
      table.raceId,
      table.kind,
      table.reviewState
    ),
    expiresAtIdx: index("coverage_evidence_expires_at_idx").on(table.expiresAt)
  })
)

export type InsertCoverageEvidence = typeof coverageEvidenceTable.$inferInsert
export type SelectCoverageEvidence = typeof coverageEvidenceTable.$inferSelect
