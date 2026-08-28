/*
<ai_context>
Immutable ticket price observation persistence (provider-neutral). Attempts and
successful observations are append-only (enforced by trigger in migration 0009);
no updated_at and no mutable latest state. Latest-known-good is derived from
immutable successful rows by source-offer identity (provider + source URL +
the comparable offer dimensions). Mirrors
db/migrations/0009_ticket_price_observation_persistence.sql.
</ai_context>
*/

import { sql } from "drizzle-orm"
import {
  bigint,
  check,
  foreignKey,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid
} from "drizzle-orm/pg-core"

export const ticketPriceObservationAttemptStatusEnum = pgEnum(
  "ticket_price_observation_attempt_status",
  ["observed", "failed"]
)

export const ticketPriceObservationFailureReasonEnum = pgEnum(
  "ticket_price_observation_failure_reason",
  [
    "auth",
    "rate_limited",
    "unavailable",
    "invalid_payload",
    "network",
    "unknown"
  ]
)

export const ticketPriceSourceMethodEnum = pgEnum(
  "ticket_price_source_method",
  ["api", "feed", "official_page", "authenticated_portal"]
)

export const ticketPriceSessionScopeEnum = pgEnum(
  "ticket_price_session_scope",
  ["race_day", "saturday", "weekend", "multi_day", "hospitality"]
)

export const ticketPriceAvailabilityEnum = pgEnum("ticket_price_availability", [
  "available",
  "low_stock",
  "sold_out",
  "unknown"
])

export const ticketPriceAuthorisationTierEnum = pgEnum(
  "ticket_price_authorisation_tier",
  [
    "official",
    "authorised_reseller",
    "bonded_package_operator",
    "unverified_secondary"
  ]
)

export const ticketPriceConfidenceEnum = pgEnum("ticket_price_confidence", [
  "high",
  "medium",
  "low"
])

const MAX_SAFE_MINOR = 9007199254740991

export const ticketPriceObservationAttemptsTable = pgTable(
  "ticket_price_observation_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    status: ticketPriceObservationAttemptStatusEnum("status").notNull(),
    provider: text("provider").notNull(),
    sourceUrl: text("source_url").notNull(),
    attemptedAt: timestamp("attempted_at", { withTimezone: true }).notNull(),
    failureReason: ticketPriceObservationFailureReasonEnum("failure_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  table => ({
    idStatusUnique: unique(
      "ticket_price_observation_attempts_id_status_unique"
    ).on(table.id, table.status),
    statusFailureConsistency: check(
      "ticket_price_observation_attempts_status_failure_consistency",
      sql`(${table.status} = 'observed' AND ${table.failureReason} IS NULL) OR (${table.status} = 'failed' AND ${table.failureReason} IS NOT NULL)`
    ),
    sourceUrlHttps: check(
      "ticket_price_observation_attempts_source_url_https",
      sql`starts_with(${table.sourceUrl}, 'https://')`
    )
  })
)

export const ticketPriceObservationsTable = pgTable(
  "ticket_price_observations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    attemptId: uuid("attempt_id").notNull(),
    attemptStatus: ticketPriceObservationAttemptStatusEnum("attempt_status")
      .default("observed")
      .notNull(),
    provider: text("provider").notNull(),
    sourceUrl: text("source_url").notNull(),
    sourceMethod: ticketPriceSourceMethodEnum("source_method").notNull(),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    raceId: text("race_id").notNull(),
    sessionScope: ticketPriceSessionScopeEnum("session_scope").notNull(),
    grandstandId: text("grandstand_id"),
    zone: text("zone"),
    ticketClass: text("ticket_class").notNull(),
    quantity: bigint("quantity", { mode: "number" }).notNull(),
    currency: text("currency").notNull(),
    basePriceMinor: bigint("base_price_minor", { mode: "number" }).notNull(),
    mandatoryFeesMinor: bigint("mandatory_fees_minor", { mode: "number" }),
    allInTotalMinor: bigint("all_in_total_minor", { mode: "number" }),
    availability: ticketPriceAvailabilityEnum("availability").notNull(),
    fulfilmentRestrictions: jsonb("fulfilment_restrictions")
      .notNull()
      .default(sql`'[]'::jsonb`),
    refundTermsSummary: text("refund_terms_summary"),
    authorisationTier:
      ticketPriceAuthorisationTierEnum("authorisation_tier").notNull(),
    confidence: ticketPriceConfidenceEnum("confidence").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  table => ({
    attemptIdUnique: unique("ticket_price_observations_attempt_id_unique").on(
      table.attemptId
    ),
    attemptFk: foreignKey({
      name: "ticket_price_observations_attempt_fk",
      columns: [table.attemptId, table.attemptStatus],
      foreignColumns: [
        ticketPriceObservationAttemptsTable.id,
        ticketPriceObservationAttemptsTable.status
      ]
    }),
    attemptStatusObserved: check(
      "ticket_price_observations_attempt_status_observed",
      sql`${table.attemptStatus} = 'observed'`
    ),
    sourceUrlHttps: check(
      "ticket_price_observations_source_url_https",
      sql`starts_with(${table.sourceUrl}, 'https://')`
    ),
    currencyFormat: check(
      "ticket_price_observations_currency_format",
      sql`${table.currency} ~ '^[A-Z]{3}$'`
    ),
    quantityPositive: check(
      "ticket_price_observations_quantity_positive",
      sql`${table.quantity} > 0 AND ${table.quantity} <= ${MAX_SAFE_MINOR}`
    ),
    basePriceMinorRange: check(
      "ticket_price_observations_base_price_minor_range",
      sql`${table.basePriceMinor} >= 0 AND ${table.basePriceMinor} <= ${MAX_SAFE_MINOR}`
    ),
    mandatoryFeesMinorRange: check(
      "ticket_price_observations_mandatory_fees_minor_range",
      sql`${table.mandatoryFeesMinor} IS NULL OR (${table.mandatoryFeesMinor} >= 0 AND ${table.mandatoryFeesMinor} <= ${MAX_SAFE_MINOR})`
    ),
    allInTotalMinorRange: check(
      "ticket_price_observations_all_in_total_minor_range",
      sql`${table.allInTotalMinor} IS NULL OR (${table.allInTotalMinor} >= 0 AND ${table.allInTotalMinor} <= ${MAX_SAFE_MINOR})`
    ),
    // Both null, or both non-null with total = base + fees. The explicit
    // IS NOT NULL arm is required: PostgreSQL CHECK admits UNKNOWN, so a
    // bare comparison would let mixed-null rows through.
    allInTotalConsistency: check(
      "ticket_price_observations_all_in_total_consistency",
      sql`(${table.mandatoryFeesMinor} IS NULL AND ${table.allInTotalMinor} IS NULL) OR (${table.mandatoryFeesMinor} IS NOT NULL AND ${table.allInTotalMinor} IS NOT NULL AND ${table.allInTotalMinor} = ${table.basePriceMinor} + ${table.mandatoryFeesMinor})`
    ),
    identityObservedIdx: index(
      "ticket_price_observations_identity_observed_idx"
    ).on(
      table.provider,
      table.sourceUrl,
      table.raceId,
      table.sessionScope,
      table.grandstandId,
      table.zone,
      table.ticketClass,
      table.quantity,
      table.observedAt
    )
  })
)

export type InsertTicketPriceObservationAttempt =
  typeof ticketPriceObservationAttemptsTable.$inferInsert
export type InsertTicketPriceObservation =
  typeof ticketPriceObservationsTable.$inferInsert
export type SelectTicketPriceObservationAttempt =
  typeof ticketPriceObservationAttemptsTable.$inferSelect
export type SelectTicketPriceObservation =
  typeof ticketPriceObservationsTable.$inferSelect
