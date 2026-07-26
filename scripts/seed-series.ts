/*
Seed the `series` table from config/series.ts and backfill existing races to the F1
series. Idempotent — safe to re-run. Run with: npx tsx scripts/seed-series.ts
Requires DATABASE_URL in the environment (.env.local).
*/

import { config } from "dotenv"
config({ path: ".env.local" })

import { db } from "@/db/db"
import { seriesTable, racesTable } from "@/db/schema"
import { SERIES } from "@/config/series"
import { eq, isNull } from "drizzle-orm"

async function main() {
  console.log("Seeding series...")
  for (const s of SERIES) {
    await db
      .insert(seriesTable)
      .values({
        name: s.name,
        shortName: s.shortName,
        slug: s.slug,
        governingBody: s.governingBody,
        eventNoun: s.eventNoun,
        seasonLabel: s.seasonLabel,
        accentColor: s.accentColor,
        dataProvider: s.dataProvider,
        sortOrder: s.sortOrder,
        description: s.description
      })
      .onConflictDoUpdate({
        target: seriesTable.slug,
        set: {
          name: s.name,
          shortName: s.shortName,
          governingBody: s.governingBody,
          eventNoun: s.eventNoun,
          seasonLabel: s.seasonLabel,
          accentColor: s.accentColor,
          dataProvider: s.dataProvider,
          sortOrder: s.sortOrder,
          description: s.description
        }
      })
    console.log(`  ✓ ${s.name}`)
  }

  const [f1] = await db
    .select()
    .from(seriesTable)
    .where(eq(seriesTable.slug, "f1"))
    .limit(1)

  if (f1) {
    const res = await db
      .update(racesTable)
      .set({ seriesId: f1.id })
      .where(isNull(racesTable.seriesId))
      .returning({ id: racesTable.id })
    console.log(`Backfilled ${res.length} existing races to Formula 1.`)
  }

  console.log("Done.")
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
