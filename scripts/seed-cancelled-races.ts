/*
Seed cancelled races from data/seeds/f1-<season>-cancelled.json. Idempotent — upserts by
(series, season, planned_round) among cancelled rows. Sets status='cancelled', records the
original round in planned_round, and stores a cancellation reason. Circuits are resolved
against existing DB circuits (they must already exist).

Run: npx tsx scripts/seed-cancelled-races.ts [file]
(defaults to data/seeds/f1-2026-cancelled.json). Requires DATABASE_URL.
*/

import { config } from "dotenv"
config({ path: ".env.local" })

import { readFileSync } from "node:fs"
import { join } from "node:path"
import { db } from "@/db/db"
import { racesTable, seriesTable } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { buildRaceSlug } from "@/lib/series"
import { findOrCreateCircuit } from "./_circuits"

interface CancelledRace {
  name: string
  circuit: string
  country: string
  plannedRound: number
  date: string
}

async function main() {
  const file =
    process.argv[2] ?? join(process.cwd(), "data/seeds/f1-2026-cancelled.json")
  const data = JSON.parse(readFileSync(file, "utf8")) as {
    season: number
    series: string
    cancellationReason: string
    races: CancelledRace[]
  }

  const [series] = await db
    .select()
    .from(seriesTable)
    .where(eq(seriesTable.slug, data.series))
    .limit(1)
  if (!series) throw new Error(`Series '${data.series}' not found`)

  let added = 0
  let updated = 0
  for (const r of data.races) {
    // Resolve to the real venue (must exist for a real cancelled GP).
    const { id: circuitId } = await findOrCreateCircuit({
      circuit: r.circuit,
      location: r.country,
      country: r.country,
      latitude: 0,
      longitude: 0
    })

    const slug = buildRaceSlug(
      { name: series.name, shortName: series.shortName, slug: series.slug, eventNoun: series.eventNoun },
      { name: r.name, country: r.country, season: data.season }
    )

    // Match an existing cancelled row by its original (prospective) round.
    const [existing] = await db
      .select({ id: racesTable.id })
      .from(racesTable)
      .where(
        and(
          eq(racesTable.seriesId, series.id),
          eq(racesTable.season, data.season),
          eq(racesTable.status, "cancelled"),
          eq(racesTable.plannedRound, r.plannedRound)
        )
      )
      .limit(1)

    const values = {
      circuitId,
      seriesId: series.id,
      name: r.name,
      date: new Date(r.date),
      season: data.season,
      // A cancelled race has no position in the run calendar; keep its intended slot in
      // both round and planned_round (the partial unique index ignores cancelled rows).
      round: r.plannedRound,
      plannedRound: r.plannedRound,
      country: r.country,
      slug,
      status: "cancelled" as const,
      cancellationReason: data.cancellationReason
    }

    if (existing) {
      await db.update(racesTable).set(values).where(eq(racesTable.id, existing.id))
      updated++
      console.log(`  = ${r.name} (updated)`)
    } else {
      await db.insert(racesTable).values(values)
      added++
      console.log(`  + ${r.name}`)
    }
  }

  console.log(`Cancelled races: ${added} added, ${updated} updated.`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
