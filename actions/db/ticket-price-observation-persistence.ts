/*
<ai_context>
Append-only ticket price observation persistence. Private module (not a public
server action): validates the observation contract from lib before opening a
transaction, writes the attempt and (on success) the observation atomically,
and derives latest-known-good from immutable successful rows by source-offer
identity (provider + source URL + the comparable offer dimensions). The store
boundary is injected so tests and callers control persistence; the default
store is the Drizzle database.
</ai_context>
*/

import { and, desc, eq, isNull } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/db/db"
import {
  ticketPriceObservationAttemptsTable,
  ticketPriceObservationsTable
} from "@/db/schema"
import {
  ticketPriceObservationSchema,
  type ObservationAttempt,
  type TicketPriceObservation
} from "@/lib/ticket-price-observation"

const httpsSourceUrl = z
  .string()
  .url()
  .refine(value => new URL(value).protocol === "https:", {
    message: "sourceUrl must be HTTPS"
  })

// Local exact mirror of the stableIdentifier rule in
// lib/ticket-price-observation (not exported there): non-empty and no
// surrounding whitespace, so empty, whitespace-only, and padded providers
// are rejected with the same semantics as observations.
const stableIdentifier = z
  .string()
  .min(1)
  .refine(value => value === value.trim(), {
    message: "Identifier must not have surrounding whitespace"
  })

const failedAttemptSchema = z.object({
  status: z.literal("failed"),
  provider: stableIdentifier,
  sourceUrl: httpsSourceUrl,
  attemptedAt: z.date(),
  failureReason: z.enum([
    "auth",
    "rate_limited",
    "unavailable",
    "invalid_payload",
    "network",
    "unknown"
  ])
})

// Accepts both the wire shape (ISO datetime string) and an already-parsed
// observation (observedAt as Date); validation rules stay owned by lib.
const observationInputSchema = z.preprocess(value => {
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>
    if (record.observedAt instanceof Date) {
      return { ...record, observedAt: record.observedAt.toISOString() }
    }
  }
  return value
}, ticketPriceObservationSchema)

export type ObservationIdentity = {
  provider: string
  sourceUrl: string
  raceId: string
  sessionScope: TicketPriceObservation["sessionScope"]
  grandstandId: string | null
  zone: string | null
  ticketClass: string
  quantity: number
}

export interface ObservationTx {
  insertAttempt(
    values: Record<string, unknown>
  ): Promise<Record<string, unknown>>
  insertObservation(
    values: Record<string, unknown>
  ): Promise<Record<string, unknown>>
}

export interface ObservationStore {
  transaction<T>(fn: (tx: ObservationTx) => Promise<T>): Promise<T>
  findLatestSuccessfulObservation(
    identity: ObservationIdentity
  ): Promise<Record<string, unknown> | null>
}

export interface PersistObservationResult {
  attemptId: string
  observationId: string | null
}

const drizzleObservationStore: ObservationStore = {
  transaction(fn) {
    return db.transaction(async tx => {
      const wrapped: ObservationTx = {
        async insertAttempt(values) {
          const rows = await tx
            .insert(ticketPriceObservationAttemptsTable)
            .values(
              values as typeof ticketPriceObservationAttemptsTable.$inferInsert
            )
            .returning()
          const row = rows.at(0)
          if (!row) throw new Error("attempt insert returned no row")
          return row as Record<string, unknown>
        },
        async insertObservation(values) {
          const rows = await tx
            .insert(ticketPriceObservationsTable)
            .values(values as typeof ticketPriceObservationsTable.$inferInsert)
            .returning()
          const row = rows.at(0)
          if (!row) throw new Error("observation insert returned no row")
          return row as Record<string, unknown>
        }
      }
      return fn(wrapped)
    })
  },
  async findLatestSuccessfulObservation(identity) {
    const rows = await db
      .select()
      .from(ticketPriceObservationsTable)
      .where(
        and(
          eq(ticketPriceObservationsTable.provider, identity.provider),
          eq(ticketPriceObservationsTable.sourceUrl, identity.sourceUrl),
          eq(ticketPriceObservationsTable.raceId, identity.raceId),
          eq(ticketPriceObservationsTable.sessionScope, identity.sessionScope),
          identity.grandstandId === null
            ? isNull(ticketPriceObservationsTable.grandstandId)
            : eq(
                ticketPriceObservationsTable.grandstandId,
                identity.grandstandId
              ),
          identity.zone === null
            ? isNull(ticketPriceObservationsTable.zone)
            : eq(ticketPriceObservationsTable.zone, identity.zone),
          eq(ticketPriceObservationsTable.ticketClass, identity.ticketClass),
          eq(ticketPriceObservationsTable.quantity, identity.quantity)
        )
      )
      .orderBy(
        desc(ticketPriceObservationsTable.observedAt),
        desc(ticketPriceObservationsTable.createdAt),
        desc(ticketPriceObservationsTable.id)
      )
      .limit(1)
    const row = rows.at(0)
    return row ? (row as Record<string, unknown>) : null
  }
}

export async function persistObservationAttempt(
  attempt: ObservationAttempt,
  store: ObservationStore = drizzleObservationStore
): Promise<PersistObservationResult> {
  if (attempt.status === "observed") {
    const observation = observationInputSchema.parse(attempt.observation)
    return store.transaction(async tx => {
      const attemptRow = await tx.insertAttempt({
        status: "observed",
        provider: observation.provider,
        sourceUrl: observation.sourceUrl,
        attemptedAt: observation.observedAt,
        failureReason: null
      })
      const attemptId = attemptRow.id as string
      const observationRow = await tx.insertObservation({
        attemptId,
        attemptStatus: "observed",
        provider: observation.provider,
        sourceUrl: observation.sourceUrl,
        sourceMethod: observation.sourceMethod,
        observedAt: observation.observedAt,
        raceId: observation.raceId,
        sessionScope: observation.sessionScope,
        grandstandId: observation.grandstandId,
        zone: observation.zone,
        ticketClass: observation.ticketClass,
        quantity: observation.quantity,
        currency: observation.currency,
        basePriceMinor: observation.basePriceMinor,
        mandatoryFeesMinor: observation.mandatoryFeesMinor,
        allInTotalMinor: observation.allInTotalMinor,
        availability: observation.availability,
        fulfilmentRestrictions: observation.fulfilmentRestrictions,
        refundTermsSummary: observation.refundTermsSummary,
        authorisationTier: observation.authorisationTier,
        confidence: observation.confidence
      })
      return { attemptId, observationId: observationRow.id as string }
    })
  }

  const failed = failedAttemptSchema.parse(attempt)
  return store.transaction(async tx => {
    const attemptRow = await tx.insertAttempt({
      status: "failed",
      provider: failed.provider,
      sourceUrl: failed.sourceUrl,
      attemptedAt: failed.attemptedAt,
      failureReason: failed.failureReason
    })
    return { attemptId: attemptRow.id as string, observationId: null }
  })
}

export async function getLatestSuccessfulObservation(
  identity: ObservationIdentity,
  store: ObservationStore = drizzleObservationStore
): Promise<TicketPriceObservation | null> {
  const row = await store.findLatestSuccessfulObservation(identity)
  return row ? observationInputSchema.parse(row) : null
}
