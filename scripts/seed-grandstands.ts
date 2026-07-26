/*
Seed grandstand guide content from data/seeds/grandstands.json. Matches circuits by
name (they must already exist) and upserts grandstands by (circuit, slug). Idempotent.
Run: npx tsx scripts/seed-grandstands.ts   (requires DATABASE_URL)
*/

import { config } from "dotenv"
config({ path: ".env.local" })

import { readFileSync } from "node:fs"
import { join } from "node:path"
import { db } from "@/db/db"
import { circuitsTable, grandstandsTable } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { slugify } from "@/lib/series"

interface GrandstandSeed {
  name: string
  priceTier?: string
  viewRating?: number
  covered?: boolean
  hasBigScreen?: boolean
  bestFor?: string
  viewsOf?: string[]
  sunExposure?: string
  pros?: string[]
  cons?: string[]
  description?: string
}

async function main() {
  const file = join(process.cwd(), "data/seeds/grandstands.json")
  const data = JSON.parse(readFileSync(file, "utf8")) as {
    circuits: Record<string, GrandstandSeed[]>
  }

  let added = 0
  let skipped = 0
  for (const [circuitName, stands] of Object.entries(data.circuits)) {
    const [circuit] = await db
      .select({ id: circuitsTable.id })
      .from(circuitsTable)
      .where(eq(circuitsTable.name, circuitName))
      .limit(1)
    if (!circuit) {
      console.warn(`  ! circuit not found, skipping: ${circuitName}`)
      continue
    }

    for (const s of stands) {
      const slug = slugify(s.name)
      const [existing] = await db
        .select({ id: grandstandsTable.id })
        .from(grandstandsTable)
        .where(
          and(
            eq(grandstandsTable.circuitId, circuit.id),
            eq(grandstandsTable.slug, slug)
          )
        )
        .limit(1)
      if (existing) {
        skipped++
        continue
      }

      await db.insert(grandstandsTable).values({
        circuitId: circuit.id,
        name: s.name,
        slug,
        description: s.description,
        viewRating: s.viewRating,
        covered: s.covered ?? false,
        hasBigScreen: s.hasBigScreen ?? false,
        priceTier: s.priceTier,
        bestFor: s.bestFor,
        pros: s.pros,
        cons: s.cons,
        viewsOf: s.viewsOf,
        sunExposure: s.sunExposure
      })
      added++
      console.log(`  + ${circuitName}: ${s.name}`)
    }
  }

  console.log(`Grandstands seeded: ${added} added, ${skipped} already present.`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
