import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { eq } from "drizzle-orm"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { currencyRatesTable } from "@/db/schema/currency-rates-schema"
import { raceWeatherTable } from "@/db/schema"
import { upsertCurrencyRate } from "./currency-rates"
import { replaceRaceWeather, type RaceWeatherDay } from "./race-weather-write"
import { selectUpcomingRaces } from "./upcoming-races"

function loopbackUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    throw new Error(
      "Refusing DB access: cron test database URL is not a valid URL"
    )
  }
  const protocol = parsed.protocol.replace(/:$/, "")
  if (protocol !== "postgres" && protocol !== "postgresql") {
    throw new Error(
      "Refusing DB access: cron test database URL is not PostgreSQL"
    )
  }
  if (parsed.hostname !== "127.0.0.1" && parsed.hostname !== "localhost") {
    throw new Error(
      "Refusing DB access: cron test database URL host is not loopback"
    )
  }
  return raw
}

function cronTestDatabaseUrl(): string | undefined {
  const explicit =
    process.env.CRON_DB_TEST_DATABASE_URL?.trim() ||
    process.env.STATUS_CRON_TEST_DATABASE_URL?.trim()
  if (explicit) return loopbackUrl(explicit)

  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) return undefined
  const parsed = loopbackUrl(databaseUrl)
  if (!parsed) return undefined
  const name = new URL(parsed).pathname.replace(/^\//, "")
  if (name !== "pitlane_ci" && name !== "pitlane_e2e") return undefined
  return parsed
}

const databaseUrl = cronTestDatabaseUrl()

if (!databaseUrl && process.env.CI) {
  throw new Error(
    "CRON_DB_TEST_DATABASE_URL, STATUS_CRON_TEST_DATABASE_URL, or a loopback disposable DATABASE_URL is required in CI"
  )
}

const futureRace = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1"
const pastRace = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2"
const futureCircuit = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1"
const pastCircuit = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2"

function sampleDay(datetime: string, temp: number): RaceWeatherDay {
  return {
    datetime,
    tempmax: temp + 2,
    tempmin: temp - 2,
    temp,
    feelslike: temp,
    dew: 10,
    humidity: 50,
    precip: 0,
    precipprob: 10,
    windspeed: 5,
    winddir: 180,
    pressure: 1012,
    cloudcover: 20,
    visibility: 10,
    uvindex: 4,
    sunrise: "06:30:00",
    sunset: "17:45:00",
    conditions: "Clear",
    icon: "clear-day"
  }
}

describe.skipIf(!databaseUrl)(
  "exchange-rate and weather queries against postgres-js",
  () => {
    const url = databaseUrl!
    const admin = postgres(url, { max: 1 })
    let client: ReturnType<typeof postgres>
    let db: ReturnType<typeof drizzle>

    beforeAll(async () => {
      await admin.unsafe("CREATE SCHEMA IF NOT EXISTS cron_feed_test")
      await admin.unsafe(
        "DROP TABLE IF EXISTS cron_feed_test.race_weather CASCADE"
      )
      await admin.unsafe("DROP TABLE IF EXISTS cron_feed_test.races CASCADE")
      await admin.unsafe("DROP TABLE IF EXISTS cron_feed_test.circuits CASCADE")
      await admin.unsafe(
        "DROP TABLE IF EXISTS cron_feed_test.currency_rates CASCADE"
      )
      await admin.unsafe(`
        CREATE TABLE cron_feed_test.circuits (
          id uuid PRIMARY KEY,
          latitude numeric(10, 7) NOT NULL,
          longitude numeric(10, 7) NOT NULL
        )
      `)
      await admin.unsafe(`
        CREATE TABLE cron_feed_test.races (
          id uuid PRIMARY KEY,
          name text NOT NULL,
          date timestamptz NOT NULL,
          weekend_start timestamptz,
          weekend_end timestamptz,
          circuit_id uuid NOT NULL
        )
      `)
      await admin.unsafe(`
        CREATE TABLE cron_feed_test.race_weather (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          race_id uuid NOT NULL,
          date timestamp NOT NULL,
          temp_max text NOT NULL,
          temp_min text NOT NULL,
          temp text NOT NULL,
          feels_like text NOT NULL,
          dew text,
          humidity text NOT NULL,
          precip text NOT NULL,
          precip_prob text NOT NULL,
          wind_speed text NOT NULL,
          wind_dir text,
          pressure text,
          cloud_cover text,
          visibility text,
          uv_index text,
          sunrise text NOT NULL,
          sunset text NOT NULL,
          conditions text NOT NULL,
          icon text NOT NULL,
          unit_group text NOT NULL DEFAULT 'metric',
          created_at timestamp NOT NULL DEFAULT now(),
          updated_at timestamp NOT NULL DEFAULT now()
        )
      `)
      await admin.unsafe(`
        CREATE TABLE cron_feed_test.currency_rates (
          id text PRIMARY KEY,
          from_currency text NOT NULL,
          to_currency text NOT NULL,
          rate numeric(20, 10) NOT NULL,
          last_updated timestamptz NOT NULL DEFAULT now(),
          last_fetch_success timestamptz NOT NULL DEFAULT now(),
          last_fetch_error text,
          is_active boolean NOT NULL DEFAULT true
        )
      `)
      const now = Date.now()
      await admin.unsafe(
        `INSERT INTO cron_feed_test.circuits (id, latitude, longitude) VALUES
          ($1, 24.4672000, 54.6031000),
          ($2, 51.5123000, -0.1277000)`,
        [futureCircuit, pastCircuit]
      )
      await admin.unsafe(
        `INSERT INTO cron_feed_test.races
          (id, name, date, weekend_start, weekend_end, circuit_id) VALUES
          ($1, 'Future without weekend', $2, NULL, NULL, $3),
          ($4, 'Already run', $5, NULL, NULL, $6)`,
        [
          futureRace,
          new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString(),
          futureCircuit,
          pastRace,
          new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
          pastCircuit
        ]
      )
      client = postgres(url, {
        max: 1,
        connection: { search_path: "cron_feed_test" }
      })
      db = drizzle(client)
    })

    afterAll(async () => {
      await client?.end()
      await admin.unsafe("DROP SCHEMA IF EXISTS cron_feed_test CASCADE")
      await admin.end()
    })

    it("selects a future race with a typed date comparison and float coordinates", async () => {
      const rows = await selectUpcomingRaces(db, new Date())
      expect(rows.map(row => row.id)).toEqual([futureRace])
      expect(rows[0]?.weekendStart).toBeNull()
      expect(rows[0]?.weekendEnd).toBeNull()
      expect(Number(rows[0]?.circuit.latitude)).toBeCloseTo(24.4672, 4)
      expect(Number(rows[0]?.circuit.longitude)).toBeCloseTo(54.6031, 4)
    })

    it("replaces weather rows using JS Date bounds on typed timestamp columns", async () => {
      await replaceRaceWeather(
        db,
        futureRace,
        [sampleDay("2026-11-08", 21)],
        "metric"
      )
      await replaceRaceWeather(
        db,
        futureRace,
        [sampleDay("2026-11-08", 27)],
        "metric"
      )

      const rows = await db
        .select({
          temp: raceWeatherTable.temp,
          date: raceWeatherTable.date
        })
        .from(raceWeatherTable)
        .where(eq(raceWeatherTable.raceId, futureRace))

      expect(rows).toHaveLength(1)
      expect(rows[0]?.temp).toBe("27")
      expect(rows[0]?.date).toBeInstanceOf(Date)
    })

    it("upserts a currency rate with JS Date timestamps", async () => {
      const first = new Date("2026-10-21T03:24:03.773Z")
      const second = new Date("2026-10-31T03:24:03.773Z")
      await upsertCurrencyRate(db, {
        fromCurrency: "USD",
        toCurrency: "EUR",
        rate: "0.9200000000",
        at: first
      })
      await upsertCurrencyRate(db, {
        fromCurrency: "USD",
        toCurrency: "EUR",
        rate: "0.8600000000",
        at: second
      })

      const [row] = await db
        .select({
          rate: currencyRatesTable.rate,
          lastUpdated: currencyRatesTable.lastUpdated,
          lastFetchSuccess: currencyRatesTable.lastFetchSuccess,
          lastFetchError: currencyRatesTable.lastFetchError
        })
        .from(currencyRatesTable)
        .where(eq(currencyRatesTable.id, "USD-EUR"))

      expect(row?.rate).toBe("0.8600000000")
      expect(row?.lastFetchError).toBeNull()
      expect(row?.lastUpdated).toBeInstanceOf(Date)
      expect(row?.lastFetchSuccess).toBeInstanceOf(Date)
      expect(row?.lastUpdated?.toISOString()).toBe(second.toISOString())
    })
  }
)
