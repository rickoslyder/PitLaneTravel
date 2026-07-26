/*
Seed the verified 2026 calendars for the non-F1 championships from
data/seeds/multi-series-2026-calendars.json.

Idempotent: races are upserted on (series, season, round). Circuits are resolved against
existing rows first and only created when genuinely new, using the real coordinates
carried in the seed file (never 0,0 placeholders).

Race status is DERIVED FROM THE DATE at run time rather than read from the file, so
re-running keeps the calendar honest as the season progresses.

Run: npx tsx scripts/seed-multi-series-calendars.ts [--dry-run]
Requires DATABASE_URL and that scripts/seed-series.ts has run.
*/

import { config } from "dotenv"
config({ path: ".env.local" })

import { readFileSync } from "node:fs"
import { join } from "node:path"
import { db } from "@/db/db"
import { circuitsTable, racesTable, seriesTable } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { buildRaceSlug } from "@/lib/series"

interface SeedRound {
  round: number
  name: string
  circuit: string
  location: string
  country: string
  date: string
  note?: string
  latitude?: number
  longitude?: number
}

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")

/** Status implied by the race date; a race weekend is treated as done the day after. */
function deriveStatus(date: Date, now: Date): "upcoming" | "completed" {
  const dayAfter = new Date(date.getTime() + 24 * 60 * 60 * 1000)
  return now > dayAfter ? "completed" : "upcoming"
}

async function resolveCircuit(r: SeedRound): Promise<string> {
  const existing = await db
    .select({ id: circuitsTable.id, name: circuitsTable.name })
    .from(circuitsTable)
  const hit = existing.find(c => normalise(c.name) === normalise(r.circuit))
  if (hit) return hit.id

  if (r.latitude === undefined || r.longitude === undefined) {
    throw new Error(
      `Circuit "${r.circuit}" is new but has no coordinates in the seed file; refusing to create a placeholder.`
    )
  }

  const [created] = await db
    .insert(circuitsTable)
    .values({
      name: r.circuit,
      location: r.location,
      country: r.country,
      latitude: String(r.latitude),
      longitude: String(r.longitude)
    })
    .returning({ id: circuitsTable.id })
  console.log(`    + circuit created: ${r.circuit}`)
  return created.id
}

async function main() {
  const dryRun = process.argv.includes("--dry-run")
  const file = join(process.cwd(), "data/seeds/multi-series-2026-calendars.json")
  const data = JSON.parse(readFileSync(file, "utf8")) as {
    season: number
    series: Record<
      string,
      { seasonLabel?: string; confidence?: string; rounds: SeedRound[] }
    >
  }

  const now = new Date()
  let added = 0
  let updated = 0

  for (const [slug, payload] of Object.entries(data.series)) {
    const [series] = await db
      .select()
      .from(seriesTable)
      .where(eq(seriesTable.slug, slug))
      .limit(1)
    if (!series) {
      console.warn(`  ! series '${slug}' not found — run seed-series.ts first; skipping`)
      continue
    }

    console.log(`\n${series.name} (${payload.rounds.length} rounds, confidence=${payload.confidence})`)

    for (const r of payload.rounds) {
      const date = new Date(r.date)
      const status = deriveStatus(date, now)
      const circuitId = dryRun ? "dry-run" : await resolveCircuit(r)
      const slugValue = buildRaceSlug(
        {
          name: series.name,
          shortName: series.shortName,
          slug: series.slug,
          eventNoun: series.eventNoun
        },
        { name: r.name, country: r.country, season: data.season }
      )

      if (dryRun) {
        console.log(`    [dry] R${r.round} ${r.date} ${status.padEnd(9)} ${r.name}`)
        continue
      }

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

      const values = {
        circuitId,
        seriesId: series.id,
        name: r.name,
        date,
        season: data.season,
        round: r.round,
        country: r.country,
        slug: slugValue,
        status,
        description: r.note ? `Note: ${r.note}` : undefined
      }

      if (existing) {
        await db.update(racesTable).set(values).where(eq(racesTable.id, existing.id))
        updated++
      } else {
        await db.insert(racesTable).values(values)
        added++
        console.log(`    + R${r.round} ${r.date} ${status.padEnd(9)} ${r.name}`)
      }
    }
  }

  console.log(`\nDone: ${added} races added, ${updated} updated.`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
