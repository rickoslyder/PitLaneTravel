/*
Refresh the Formula 1 calendar for a given season from data/seeds/f1-<season>-calendar.json.
Upserts circuits (by name) and races (by series+season+round). Idempotent and additive —
existing seasons are left untouched, so it archives 2025 and adds the new season.

Run: npx tsx scripts/refresh-f1-calendar.ts [season]   (defaults to 2026)
Requires DATABASE_URL and that scripts/seed-series.ts has run (F1 series must exist).
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

interface Round {
  round: number
  name: string
  circuit: string
  location: string
  country: string
  latitude: number
  longitude: number
  date: string
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

  let added = 0
  let updated = 0
  for (const r of data.races) {
    const { id: circuitId } = await findOrCreateCircuit(r)
    const slug = buildRaceSlug(
      { name: f1.name, shortName: f1.shortName, slug: f1.slug, eventNoun: f1.eventNoun },
      { name: r.name, country: r.country, season }
    )

    const [existing] = await db
      .select({ id: racesTable.id })
      .from(racesTable)
      .where(
        and(
          eq(racesTable.seriesId, f1.id),
          eq(racesTable.season, season),
          eq(racesTable.round, r.round)
        )
      )
      .limit(1)

    if (existing) {
      await db
        .update(racesTable)
        .set({
          name: r.name,
          circuitId,
          date: new Date(r.date),
          country: r.country,
          slug
        })
        .where(eq(racesTable.id, existing.id))
      updated++
    } else {
      await db.insert(racesTable).values({
        circuitId,
        seriesId: f1.id,
        name: r.name,
        date: new Date(r.date),
        season,
        round: r.round,
        country: r.country,
        slug,
        status: "upcoming"
      })
      added++
    }
  }

  console.log(`F1 ${season}: ${added} added, ${updated} updated.`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
