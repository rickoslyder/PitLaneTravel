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
import { eq } from "drizzle-orm"
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
    // The venue of a real cancelled GP must already exist. Fail fast rather than let
    // findOrCreateCircuit fabricate a placeholder circuit at (0,0).
    const circuit = await findOrCreateCircuit({
      circuit: r.circuit,
      location: r.country,
      country: r.country,
      latitude: 0,
      longitude: 0
    })
    if (circuit.created) {
      throw new Error(
        `Circuit "${r.circuit}" for cancelled race "${r.name}" does not exist. ` +
          `Add it (or a circuit-aliases.json entry) before seeding cancelled races.`
      )
    }
    const circuitId = circuit.id

    const slug = buildRaceSlug(
      { name: series.name, shortName: series.shortName, slug: series.slug, eventNoun: series.eventNoun },
      { name: r.name, country: r.country, season: data.season }
    )

    // Match any existing race for this event by slug, regardless of status, so we update
    // in place instead of creating a duplicate that shares the (non-unique) slug.
    const [existing] = await db
      .select({ id: racesTable.id, status: racesTable.status })
      .from(racesTable)
      .where(eq(racesTable.slug, slug))
      .limit(1)

    if (existing && existing.status !== "cancelled") {
      console.warn(
        `  ! "${r.name}" already exists as a non-cancelled race (slug ${slug}); ` +
          `skipping to avoid a duplicate. Cancel it via the admin UI instead.`
      )
      continue
    }

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
