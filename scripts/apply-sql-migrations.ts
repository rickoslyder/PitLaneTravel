/*
Apply the hand-authored SQL migrations (0003+) that are not in the drizzle-kit journal.

`npm run db:migrate` (drizzle-kit migrate) only applies journalled tags, so it would
provision a database WITHOUT the series tables, grandstands, cancelled-race index or the
flight-payment columns — silently dropping the payment-reuse defence. This script applies
them in order and records what it ran, so a fresh/restored database matches production.

Every migration is written to be idempotent, so re-running is safe.

Run: npx tsx scripts/apply-sql-migrations.ts
*/

import { config } from "dotenv"
config({ path: ".env.local" })

import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import postgres from "postgres"

const DIR = join(process.cwd(), "db/migrations")
// 0000-0002 are owned by the drizzle journal; these are applied by hand.
const MIN_TAG = 3

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is required")
  const sql = postgres(url, { max: 1, connect_timeout: 15 })

  try {
    await sql`create table if not exists applied_sql_migrations (
      tag text primary key,
      applied_at timestamptz not null default now()
    )`

    const files = readdirSync(DIR)
      .filter(f => f.endsWith(".sql"))
      .filter(f => Number(f.slice(0, 4)) >= MIN_TAG)
      .sort()

    for (const file of files) {
      const tag = file.replace(/\.sql$/, "")
      const [seen] = await sql`select tag from applied_sql_migrations where tag = ${tag}`
      if (seen) {
        console.log(`  = ${tag} (already applied)`)
        continue
      }
      await sql.unsafe(readFileSync(join(DIR, file), "utf8"))
      await sql`insert into applied_sql_migrations (tag) values (${tag})
                on conflict (tag) do nothing`
      console.log(`  + ${tag}`)
    }
    console.log(`\nDone: ${files.length} SQL migrations checked.`)
  } finally {
    await sql.end()
  }
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
