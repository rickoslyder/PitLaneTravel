/*
Refresh the Formula 1 calendar for a given season from data/seeds/f1-<season>-calendar.json.
Upserts circuits (by name) and races (by slug, or by id when the seed names one).
Matching on round would let a re-seed overwrite the Sepang Bahrain Grand Prix with
Singapore. Date-only seed values keep an existing clock time so a re-seed cannot
push official start instants back to 00:00Z.

Run: npx tsx scripts/refresh-f1-calendar.ts [season]   (defaults to 2026)
Requires DATABASE_URL and that scripts/seed-series.ts has run (F1 series must exist).
*/

import { config } from "dotenv"
config({ path: ".env.local" })

import { readFileSync } from "node:fs"
import { join } from "node:path"
import { db } from "@/db/db"
import { racesTable, seriesTable } from "@/db/schema"
import { and, eq, ne } from "drizzle-orm"
import { buildRaceSlug, type SeriesLike } from "@/lib/series"
import { findOrCreateCircuit } from "./_circuits"

export interface Round {
  id?: string
  round: number
  name: string
  circuit: string
  location: string
  country: string
  latitude: number
  longitude: number
  date: string
  slug?: string
  sprint?: boolean
}

export function seedHasClockTime(date: string): boolean {
  return /T\d{2}:\d{2}/.test(date)
}

/**
 * Full ISO timestamps are written as given. A date-only value keeps the stored
 * UTC clock when a row already exists, and otherwise means UTC midnight.
 */
export function raceDateFromSeed(date: string, existing: Date | null): Date {
  if (seedHasClockTime(date)) {
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Invalid race date: ${date}`)
    }
    return parsed
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid race date: ${date}`)
  }
  if (!existing) return new Date(`${date}T00:00:00.000Z`)
  const clock = existing.toISOString().slice(11, 23)
  return new Date(`${date}T${clock}Z`)
}

export function seedRaceSlug(
  series: SeriesLike,
  race: { name: string; country: string; slug?: string },
  season: number
): string {
  if (race.slug && race.slug.trim().length > 0) return race.slug.trim()
  return buildRaceSlug(series, {
    name: race.name,
    country: race.country,
    season
  })
}

interface LiveRace {
  id: string
  date: Date
  round: number
  slug: string | null
  isSprintWeekend: boolean
}

async function findLiveRace(
  seriesId: string,
  season: number,
  race: Round,
  slug: string
): Promise<LiveRace | null> {
  const columns = {
    id: racesTable.id,
    date: racesTable.date,
    round: racesTable.round,
    slug: racesTable.slug,
    isSprintWeekend: racesTable.isSprintWeekend
  }
  const live = ne(racesTable.status, "cancelled")

  if (race.id) {
    const [byId] = await db
      .select(columns)
      .from(racesTable)
      .where(
        and(
          eq(racesTable.id, race.id),
          eq(racesTable.seriesId, seriesId),
          eq(racesTable.season, season),
          live
        )
      )
      .limit(1)
    if (byId) return byId
  }

  const [bySlug] = await db
    .select(columns)
    .from(racesTable)
    .where(
      and(
        eq(racesTable.slug, slug),
        eq(racesTable.seriesId, seriesId),
        eq(racesTable.season, season),
        live
      )
    )
    .limit(1)
  return bySlug ?? null
}

async function main() {
  const season = Number(process.argv[2] ?? 2026)
  const file = join(process.cwd(), `data/seeds/f1-${season}-calendar.json`)
  const data = JSON.parse(readFileSync(file, "utf8")) as { races: Round[] }

  const [f1] = await db
    .select()
    .from(seriesTable)
    .where(eq(seriesTable.slug, "f1"))
    .limit(1)
  if (!f1) throw new Error("F1 series not found — run seed-series.ts first")

  const series = {
    name: f1.name,
    shortName: f1.shortName,
    slug: f1.slug,
    eventNoun: f1.eventNoun
  }

  const pending: Array<{
    race: Round
    circuitId: string
    slug: string
    existing: LiveRace | null
  }> = []
  for (const race of data.races) {
    const { id: circuitId } = await findOrCreateCircuit(race)
    const slug = seedRaceSlug(series, race, season)
    const existing = await findLiveRace(f1.id, season, race, slug)
    pending.push({ race, circuitId, slug, existing })
  }

  let added = 0
  let updated = 0
  await db.transaction(async tx => {
    for (const item of pending) {
      if (item.existing && item.existing.round !== item.race.round) {
        await tx
          .update(racesTable)
          .set({ round: item.existing.round + 100 })
          .where(eq(racesTable.id, item.existing.id))
      }
    }

    for (const item of pending) {
      const { race, circuitId, slug, existing } = item
      const date = raceDateFromSeed(race.date, existing?.date ?? null)
      const isSprintWeekend =
        typeof race.sprint === "boolean"
          ? race.sprint
          : (existing?.isSprintWeekend ?? false)
      const stableSlug = race.slug?.trim() || existing?.slug || slug

      if (existing) {
        await tx
          .update(racesTable)
          .set({
            name: race.name,
            circuitId,
            date,
            country: race.country,
            round: race.round,
            slug: stableSlug,
            isSprintWeekend
          })
          .where(eq(racesTable.id, existing.id))
        updated++
      } else {
        await tx.insert(racesTable).values({
          id: race.id,
          circuitId,
          seriesId: f1.id,
          name: race.name,
          date,
          season,
          round: race.round,
          country: race.country,
          slug: stableSlug,
          isSprintWeekend,
          status: "upcoming"
        })
        added++
      }
    }
  })

  console.log(`F1 ${season}: ${added} added, ${updated} updated.`)
  process.exit(0)
}

const invokedDirectly = process.argv.some(arg =>
  /(?:^|\/)refresh-f1-calendar\.ts$/.test(arg)
)
if (invokedDirectly) {
  main().catch(err => {
    console.error(err)
    process.exit(1)
  })
}
