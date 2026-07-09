/*
Seed sample multi-series calendars (MotoGP, Formula E, IndyCar, WEC) from
data/seeds/sample-series-calendars.json. Upserts circuits by name and races by
(series, season, round). Idempotent. Run: npx tsx scripts/seed-sample-calendars.ts

Requires DATABASE_URL and that scripts/seed-series.ts has already run (series rows must
exist). Dates in the seed file are indicative placeholders — verify before launch.
*/

import { config } from "dotenv"
config({ path: ".env.local" })

import { readFileSync } from "node:fs"
import { join } from "node:path"
import { db } from "@/db/db"
import { circuitsTable, racesTable, seriesTable } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { buildRaceSlug } from "@/lib/series"

interface Round {
  round: number
  circuit: string
  location: string
  country: string
  latitude: number
  longitude: number
  date: string
  name: string
}

async function upsertCircuit(r: Round): Promise<string> {
  const [existing] = await db
    .select({ id: circuitsTable.id })
    .from(circuitsTable)
    .where(eq(circuitsTable.name, r.circuit))
    .limit(1)
  if (existing) return existing.id

  const [created] = await db
    .insert(circuitsTable)
    .values({
      name: r.circuit,
      location: r.location,
      country: r.country,
      latitude: r.latitude.toString(),
      longitude: r.longitude.toString()
    })
    .returning({ id: circuitsTable.id })
  return created.id
}

async function main() {
  const file = join(
    process.cwd(),
    "data/seeds/sample-series-calendars.json"
  )
  const data = JSON.parse(readFileSync(file, "utf8")) as {
    season: number
    series: Record<string, Round[]>
  }

  for (const [slug, rounds] of Object.entries(data.series)) {
    const [series] = await db
      .select()
      .from(seriesTable)
      .where(eq(seriesTable.slug, slug))
      .limit(1)
    if (!series) {
      console.warn(`  ! series '${slug}' not found — run seed-series.ts first`)
      continue
    }

    for (const r of rounds) {
      const circuitId = await upsertCircuit(r)

      const [existing] = await db
        .select({ id: racesTable.id })
        .from(racesTable)
        .where(
          and(
            eq(racesTable.seriesId, series.id),
            eq(racesTable.season, data.season),
            eq(racesTable.round, r.round)
          )
        )
        .limit(1)
      if (existing) {
        console.log(`  = ${slug} R${r.round} ${r.name} (exists)`)
        continue
      }

      const slugStr = buildRaceSlug(
        { name: series.name, shortName: series.shortName, slug: series.slug, eventNoun: series.eventNoun },
        { name: r.name, country: r.country, season: data.season }
      )

      await db.insert(racesTable).values({
        circuitId,
        seriesId: series.id,
        name: r.name,
        date: new Date(r.date),
        season: data.season,
        round: r.round,
        country: r.country,
        slug: slugStr,
        status: "upcoming"
      })
      console.log(`  + ${slug} R${r.round} ${r.name}`)
    }
  }

  console.log("Sample calendars seeded.")
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
