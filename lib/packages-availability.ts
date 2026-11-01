import "server-only"

import * as React from "react"
import { unstable_cache } from "next/cache"
import { and, eq, gt, inArray, isNull, lte, ne, or } from "drizzle-orm"
import { db } from "@/db/db"
import { racesTable } from "@/db/schema/races-schema"
import { seriesTable } from "@/db/schema/series-schema"
import { ticketPackagesTable } from "@/db/schema/ticket-packages-schema"
import { deriveRaceStatus } from "@/lib/race-status"
import type { RaceStatusValue } from "@/services/providers/types"

export type AvailabilityOptions = {
  /** (a) Count only packages that do not include flights. */
  excludeFlightPackages: boolean
  /** (b) Site-wide waits until both F1 and MotoGP have a listed package. */
  requireF1AndMotoGP: boolean
}

export const AVAILABILITY_DEFAULTS: AvailabilityOptions = {
  excludeFlightPackages: false,
  requireF1AndMotoGP: false
}

export type CandidatePackage = {
  raceId: string
  seriesSlug: string | null
  validFrom: Date
  validTo: Date | null
  raceStatus: RaceStatusValue
  raceDate: Date
  weekendStart: Date | null
  weekendEnd: Date | null
  includesFlights: boolean | null
}

export type PackagesAvailability = {
  siteWide: boolean
  byRace(raceId: string): boolean
}

export const NO_PACKAGES: PackagesAvailability = {
  siteWide: false,
  byRace: () => false
}

const PACKAGE_SERIES = ["f1", "motogp"] as const

function isListed(
  row: CandidatePackage,
  now: Date,
  opts: AvailabilityOptions
): boolean {
  const nowMs = now.getTime()
  if (row.validFrom.getTime() > nowMs) return false
  if (row.validTo != null && row.validTo.getTime() <= nowMs) return false
  if (row.seriesSlug !== "f1" && row.seriesSlug !== "motogp") return false
  if (opts.excludeFlightPackages && row.includesFlights !== false) return false

  const status = deriveRaceStatus(
    {
      status: row.raceStatus,
      date: row.raceDate,
      weekendStart: row.weekendStart,
      weekendEnd: row.weekendEnd
    },
    now
  )
  return status === "upcoming" || status === "in_progress"
}

export function computePackagesAvailability(
  rows: CandidatePackage[],
  now: Date,
  opts: AvailabilityOptions = AVAILABILITY_DEFAULTS
): PackagesAvailability {
  const listed = rows.filter(row => isListed(row, now, opts))
  const siteWide = opts.requireF1AndMotoGP
    ? listed.some(row => row.seriesSlug === "f1") &&
      listed.some(row => row.seriesSlug === "motogp")
    : listed.length > 0

  return {
    siteWide,
    byRace(raceId: string) {
      return listed.some(row => row.raceId === raceId)
    }
  }
}

async function queryCandidatePackages(now: Date): Promise<CandidatePackage[]> {
  const rows = await db
    .select({
      raceId: ticketPackagesTable.raceId,
      seriesSlug: seriesTable.slug,
      validFrom: ticketPackagesTable.validFrom,
      validTo: ticketPackagesTable.validTo,
      raceStatus: racesTable.status,
      raceDate: racesTable.date,
      weekendStart: racesTable.weekendStart,
      weekendEnd: racesTable.weekendEnd
    })
    .from(ticketPackagesTable)
    .innerJoin(racesTable, eq(ticketPackagesTable.raceId, racesTable.id))
    .innerJoin(seriesTable, eq(racesTable.seriesId, seriesTable.id))
    .where(
      and(
        lte(ticketPackagesTable.validFrom, now),
        or(isNull(ticketPackagesTable.validTo), gt(ticketPackagesTable.validTo, now)),
        ne(racesTable.status, "cancelled"),
        inArray(seriesTable.slug, [...PACKAGE_SERIES])
      )
    )

  return rows.map(row => ({
    raceId: row.raceId,
    seriesSlug: row.seriesSlug,
    validFrom: row.validFrom,
    validTo: row.validTo,
    raceStatus: row.raceStatus,
    raceDate: row.raceDate,
    weekendStart: row.weekendStart,
    weekendEnd: row.weekendEnd,
    includesFlights: null
  }))
}

async function loadPackagesAvailability(
  excludeFlightPackages: boolean,
  requireF1AndMotoGP: boolean
): Promise<PackagesAvailability> {
  const now = new Date()
  const rows = await queryCandidatePackages(now)
  return computePackagesAvailability(rows, now, {
    excludeFlightPackages,
    requireF1AndMotoGP
  })
}

const loadCachedPackagesAvailability = unstable_cache(
  loadPackagesAvailability,
  ["packages-availability"],
  { revalidate: 300, tags: ["packages-availability"] }
)

type CacheFn = <T extends (...args: never[]) => unknown>(fn: T) => T

const reactCache = (React as { cache?: CacheFn }).cache

const requestCache: CacheFn =
  typeof reactCache === "function" ? reactCache : fn => fn

export const getPackagesAvailability = requestCache(
  async (
    opts?: Partial<AvailabilityOptions>
  ): Promise<PackagesAvailability> => {
    const resolved = { ...AVAILABILITY_DEFAULTS, ...opts }
    try {
      return await loadCachedPackagesAvailability(
        resolved.excludeFlightPackages,
        resolved.requireF1AndMotoGP
      )
    } catch (error) {
      console.error("[packages-availability] failed closed", error)
      return NO_PACKAGES
    }
  }
)
