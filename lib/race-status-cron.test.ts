import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { and, lte, notInArray, sql } from "drizzle-orm"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { racesTable } from "@/db/schema"
import {
  racesDueForStatusUpdate,
  statusCronEmptyEvaluationWarning
} from "./race-status-cron"

function cronTestDatabaseUrl(): string | undefined {
  const explicit = process.env.STATUS_CRON_TEST_DATABASE_URL?.trim()
  if (explicit) return explicit
  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) return undefined
  try {
    const host = new URL(databaseUrl).hostname
    if (host === "127.0.0.1" || host === "localhost") return databaseUrl
  } catch {
    return undefined
  }
  return undefined
}

const databaseUrl = cronTestDatabaseUrl()

if (!databaseUrl && process.env.CI) {
  throw new Error(
    "STATUS_CRON_TEST_DATABASE_URL or a loopback DATABASE_URL is required in CI"
  )
}

describe.skipIf(!databaseUrl)(
  "update-sessions horizon query against postgres-js",
  () => {
    const url = databaseUrl!
    const admin = postgres(url, { max: 1 })
    let client: ReturnType<typeof postgres>
    let db: ReturnType<typeof drizzle>

    const past = "11111111-1111-4111-8111-111111111111"
    const beyond = "22222222-2222-4222-8222-222222222222"
    const completed = "33333333-3333-4333-8333-333333333333"
    const weekendStarted = "44444444-4444-4444-8444-444444444444"

    beforeAll(async () => {
      await admin.unsafe("CREATE SCHEMA IF NOT EXISTS cron_status_test")
      await admin.unsafe("DROP TABLE IF EXISTS cron_status_test.races CASCADE")
      await admin.unsafe(
        "DROP TYPE IF EXISTS cron_status_test.race_status CASCADE"
      )
      await admin.unsafe(
        `CREATE TYPE cron_status_test.race_status AS ENUM
          ('in_progress', 'upcoming', 'completed', 'cancelled')`
      )
      await admin.unsafe(
        `CREATE TABLE cron_status_test.races (
          id uuid PRIMARY KEY,
          date timestamptz NOT NULL,
          weekend_start timestamptz,
          status cron_status_test.race_status NOT NULL
        )`
      )
      const now = Date.now()
      await admin.unsafe(
        `INSERT INTO cron_status_test.races (id, date, weekend_start, status) VALUES
          ($1, $2, NULL, 'upcoming'),
          ($3, $4, NULL, 'upcoming'),
          ($5, $6, NULL, 'completed'),
          ($7, $8, $9, 'upcoming')`,
        [
          past,
          new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
          beyond,
          new Date(now + 10 * 24 * 60 * 60 * 1000).toISOString(),
          completed,
          new Date(now - 24 * 60 * 60 * 1000).toISOString(),
          weekendStarted,
          new Date(now + 10 * 24 * 60 * 60 * 1000).toISOString(),
          new Date(now - 24 * 60 * 60 * 1000).toISOString()
        ]
      )
      client = postgres(url, {
        max: 1,
        connection: { search_path: "cron_status_test" }
      })
      db = drizzle(client)
    })

    afterAll(async () => {
      await client?.end()
      await admin.unsafe("DROP TABLE IF EXISTS cron_status_test.races CASCADE")
      await admin.unsafe(
        "DROP TYPE IF EXISTS cron_status_test.race_status CASCADE"
      )
      await admin.unsafe("DROP SCHEMA IF EXISTS cron_status_test CASCADE")
      await admin.end()
    })

    it("selects in-window races when the horizon is an ISO timestamptz", async () => {
      const startHorizon = new Date(Date.now() + 48 * 60 * 60 * 1000)
      const rows = await db
        .select({ id: racesTable.id })
        .from(racesTable)
        .where(racesDueForStatusUpdate(startHorizon))

      expect(rows.map(row => row.id).sort()).toEqual(
        [past, weekendStarted].sort()
      )
    })

    it("rejects a JS Date bound to the untyped coalesce comparison", async () => {
      const startHorizon = new Date(Date.now() + 48 * 60 * 60 * 1000)
      await expect(
        db
          .select({ id: racesTable.id })
          .from(racesTable)
          .where(
            and(
              notInArray(racesTable.status, ["completed", "cancelled"]),
              lte(
                sql`coalesce(${racesTable.weekendStart}, ${racesTable.date})`,
                startHorizon
              )
            )
          )
      ).rejects.toMatchObject({ code: "ERR_INVALID_ARG_TYPE" })
    })
  }
)

describe("status cron empty evaluation", () => {
  it("warns when the query evaluates no races", () => {
    const horizon = new Date("2026-11-02T12:00:00.000Z")
    expect(statusCronEmptyEvaluationWarning(0, horizon)).toBe(
      "[update-sessions] staleness warning: evaluated 0 races (horizon 2026-11-02T12:00:00.000Z). Stored statuses were not updated."
    )
    expect(statusCronEmptyEvaluationWarning(3, horizon)).toBeNull()
  })
})
