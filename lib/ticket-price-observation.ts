/*
<ai_context>
Provider-neutral ticket-price observation contract. Pure schema and helpers;
no I/O, adapters, or persistence.
</ai_context>
*/

import { z } from "zod"

const SOURCE_METHODS = [
  "api",
  "feed",
  "official_page",
  "authenticated_portal"
] as const

const SESSION_SCOPES = [
  "race_day",
  "saturday",
  "weekend",
  "multi_day",
  "hospitality"
] as const

const AVAILABILITIES = [
  "available",
  "low_stock",
  "sold_out",
  "unknown"
] as const

const AUTHORISATION_TIERS = [
  "official",
  "authorised_reseller",
  "bonded_package_operator",
  "unverified_secondary"
] as const

const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const

const OBSERVATION_FAILURE_REASONS = [
  "auth",
  "rate_limited",
  "unavailable",
  "invalid_payload",
  "network",
  "unknown"
] as const

const stableIdentifier = z
  .string()
  .min(1)
  .refine(value => value === value.trim(), {
    message: "Identifier must not have surrounding whitespace"
  })

const httpsUrl = z
  .string()
  .url()
  .refine(value => new URL(value).protocol === "https:", {
    message: "sourceUrl must be HTTPS"
  })

const observedAt = z
  .string()
  .datetime({ offset: true })
  .transform(value => new Date(value))

const minorUnits = z.number().int().nonnegative().safe()

export const ticketPriceObservationSchema = z
  .object({
    provider: stableIdentifier,
    sourceUrl: httpsUrl,
    sourceMethod: z.enum(SOURCE_METHODS),
    observedAt,
    raceId: stableIdentifier,
    sessionScope: z.enum(SESSION_SCOPES),
    grandstandId: stableIdentifier.nullable(),
    zone: stableIdentifier.nullable(),
    ticketClass: stableIdentifier,
    quantity: z.number().int().positive().safe(),
    currency: z.string().regex(/^[A-Z]{3}$/),
    basePriceMinor: minorUnits,
    mandatoryFeesMinor: minorUnits.nullable(),
    allInTotalMinor: minorUnits.nullable(),
    availability: z.enum(AVAILABILITIES),
    fulfilmentRestrictions: z.array(z.string()),
    refundTermsSummary: z.string().nullable(),
    authorisationTier: z.enum(AUTHORISATION_TIERS),
    confidence: z.enum(CONFIDENCE_LEVELS)
  })
  .refine(
    observation => {
      if (observation.mandatoryFeesMinor === null) {
        return observation.allInTotalMinor === null
      }
      if (observation.allInTotalMinor === null) {
        return false
      }
      const total = observation.basePriceMinor + observation.mandatoryFeesMinor
      return (
        Number.isSafeInteger(total) && observation.allInTotalMinor === total
      )
    },
    {
      message:
        "allInTotalMinor must equal basePriceMinor + mandatoryFeesMinor when fees are known, otherwise null"
    }
  )

export type TicketPriceObservation = Readonly<
  z.infer<typeof ticketPriceObservationSchema>
>

export type ObservationFailureReason =
  (typeof OBSERVATION_FAILURE_REASONS)[number]

export type ObservationAttempt =
  | {
      readonly status: "observed"
      readonly observation: TicketPriceObservation
    }
  | {
      readonly status: "failed"
      readonly provider: string
      readonly sourceUrl: string
      readonly attemptedAt: Date
      readonly failureReason: ObservationFailureReason
    }

export function buildComparableOfferKey(
  observation: TicketPriceObservation
): string {
  return JSON.stringify([
    observation.raceId,
    observation.sessionScope,
    observation.grandstandId,
    observation.zone,
    observation.ticketClass,
    observation.quantity
  ])
}

export function isEligibleForCheapestBadge(
  observation: TicketPriceObservation
): boolean {
  return (
    observation.mandatoryFeesMinor !== null &&
    observation.allInTotalMinor !== null &&
    (observation.availability === "available" ||
      observation.availability === "low_stock") &&
    observation.authorisationTier !== "unverified_secondary"
  )
}

export function latestKnownGood(
  previous: TicketPriceObservation | null,
  attempt: ObservationAttempt
): TicketPriceObservation | null {
  if (attempt.status === "observed") {
    return attempt.observation
  }
  return previous
}
