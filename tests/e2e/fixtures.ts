import { test as base, expect, type ConsoleMessage } from "@playwright/test"
import postgres from "postgres"
import {
  classifyBrowserRequest,
  isAppOriginConsoleError
} from "./browser-network-isolation"

// Official fixtures + empty storage state:
// https://playwright.dev/docs/test-fixtures
// https://playwright.dev/docs/auth#avoid-authentication-in-some-tests
// Console / pageerror:
// https://playwright.dev/docs/api/class-page#page-event-console
// https://playwright.dev/docs/api/class-page#page-event-page-error
// postgres.js transactions: https://github.com/porsager/postgres#transactions

export { expect }

export const E2E_CIRCUIT_ID = "b1070009-e2e0-4000-8000-000000000002"
export const E2E_RACE_ID = "b1070009-e2e0-4000-8000-000000000003"
export const E2E_GRANDSTAND_ID = "b1070009-e2e0-4000-8000-000000000004"

export const E2E_CIRCUIT_NAME = "Synthetic E2E Circuit"
export const E2E_CIRCUIT_LOCATION = "E2E Fixture City"
export const E2E_CIRCUIT_COUNTRY = "Fixtureland"
export const E2E_RACE_NAME = "Synthetic Formula 1 Grand Prix"
export const E2E_RACE_SLUG = "plt-e2e-synthetic-grand-prix"
export const E2E_GRANDSTAND_NAME = "Synthetic Main Grandstand"
export const E2E_GRANDSTAND_SLUG = "synthetic-main"
export const E2E_RACE_DATE = "2099-09-15T12:00:00.000Z"

type SeededCatalog = {
  raceSlug: string
  raceName: string
  circuitName: string
}

const emptyStorageState: { cookies: []; origins: [] } = {
  cookies: [],
  origins: []
}

function requireDisposableDatabaseUrl(): string {
  if (process.env.PLAYWRIGHT_E2E_ALLOW_DISPOSABLE_DB !== "true") {
    throw new Error(
      "Refusing DB access: PLAYWRIGHT_E2E_ALLOW_DISPOSABLE_DB is not true"
    )
  }

  const raw = process.env.DATABASE_URL
  if (!raw) {
    throw new Error("Refusing DB access: DATABASE_URL is missing")
  }

  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    throw new Error("Refusing DB access: DATABASE_URL is not a valid URL")
  }

  const protocol = parsed.protocol.replace(/:$/, "")
  if (protocol !== "postgres" && protocol !== "postgresql") {
    throw new Error("Refusing DB access: DATABASE_URL is not PostgreSQL")
  }

  if (parsed.hostname !== "127.0.0.1" && parsed.hostname !== "localhost") {
    throw new Error("Refusing DB access: DATABASE_URL host is not loopback")
  }

  const databaseName = parsed.pathname.replace(/^\//, "")
  if (databaseName !== "pitlane_ci" && databaseName !== "pitlane_e2e") {
    throw new Error(
      "Refusing DB access: DATABASE_URL database name is not an allowed disposable name"
    )
  }

  return raw
}

function redactSecrets(text: string): string {
  return text
    .replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted-db-url]")
    .replace(/\b(?:sk|pk|whsec)_[A-Za-z0-9+/=._-]+/g, "[redacted-key]")
}

async function seedCatalog(sql: postgres.Sql): Promise<SeededCatalog> {
  await sql.begin(async tx => {
    const f1Rows = await tx<{ id: string }[]>`
      SELECT id
      FROM series
      WHERE slug = 'f1'
    `

    if (f1Rows.length !== 1) {
      throw new Error(
        `Expected exactly one canonical series row with slug f1, found ${f1Rows.length}`
      )
    }

    const f1SeriesId = f1Rows[0].id

    await tx`
      INSERT INTO circuits (
        id, name, location, country, latitude, longitude, image_url
      )
      VALUES (
        ${E2E_CIRCUIT_ID}::uuid,
        ${E2E_CIRCUIT_NAME},
        ${E2E_CIRCUIT_LOCATION},
        ${E2E_CIRCUIT_COUNTRY},
        ${"0.0000000"},
        ${"0.0000000"},
        ${"/android-chrome-512x512.png"}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        location = EXCLUDED.location,
        country = EXCLUDED.country,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        image_url = EXCLUDED.image_url,
        updated_at = now()
    `

    await tx`
      INSERT INTO races (
        id, circuit_id, series_id, name, date, season, round,
        country, description, status, slug, is_sprint_weekend
      )
      VALUES (
        ${E2E_RACE_ID}::uuid,
        ${E2E_CIRCUIT_ID}::uuid,
        ${f1SeriesId}::uuid,
        ${E2E_RACE_NAME},
        ${E2E_RACE_DATE}::timestamptz,
        2099,
        1,
        ${E2E_CIRCUIT_COUNTRY},
        ${"Synthetic Formula 1 weekend used only by disposable Playwright e2e. Not a real event."},
        ${"upcoming"}::race_status,
        ${E2E_RACE_SLUG},
        false
      )
      ON CONFLICT (id) DO UPDATE SET
        circuit_id = EXCLUDED.circuit_id,
        series_id = EXCLUDED.series_id,
        name = EXCLUDED.name,
        date = EXCLUDED.date,
        season = EXCLUDED.season,
        round = EXCLUDED.round,
        country = EXCLUDED.country,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        slug = EXCLUDED.slug,
        is_sprint_weekend = EXCLUDED.is_sprint_weekend,
        updated_at = now()
    `

    await tx`
      INSERT INTO grandstands (
        id, circuit_id, name, slug, description, covered, has_big_screen
      )
      VALUES (
        ${E2E_GRANDSTAND_ID}::uuid,
        ${E2E_CIRCUIT_ID}::uuid,
        ${E2E_GRANDSTAND_NAME},
        ${E2E_GRANDSTAND_SLUG},
        ${"Synthetic grandstand note used only by disposable Playwright e2e."},
        false,
        false
      )
      ON CONFLICT (id) DO UPDATE SET
        circuit_id = EXCLUDED.circuit_id,
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        description = EXCLUDED.description,
        covered = EXCLUDED.covered,
        has_big_screen = EXCLUDED.has_big_screen,
        updated_at = now()
    `
  })

  return {
    raceSlug: E2E_RACE_SLUG,
    raceName: E2E_RACE_NAME,
    circuitName: E2E_CIRCUIT_NAME
  }
}

async function cleanupCatalog(sql: postgres.Sql): Promise<void> {
  await sql`DELETE FROM grandstands WHERE id = ${E2E_GRANDSTAND_ID}::uuid`
  await sql`DELETE FROM races WHERE id = ${E2E_RACE_ID}::uuid`
  await sql`DELETE FROM circuits WHERE id = ${E2E_CIRCUIT_ID}::uuid`
}

export const test = base.extend<{ consoleGuard: void }, { seededCatalog: SeededCatalog }>({
  storageState: async ({}, use) => {
    await use(emptyStorageState)
  },

  seededCatalog: [
    async ({}, use) => {
      const connectionString = requireDisposableDatabaseUrl()
      const sql = postgres(connectionString, {
        max: 1,
        connect_timeout: 15,
        onnotice: () => undefined
      })

      try {
        const catalog = await seedCatalog(sql)
        try {
          await use(catalog)
        } finally {
          await cleanupCatalog(sql)
        }
      } finally {
        await sql.end({ timeout: 5 })
      }
    },
    { scope: "worker", auto: true }
  ],

  consoleGuard: [
    async ({ page }, use) => {
      const consoleErrors: string[] = []
      const pageErrors: string[] = []
      const deniedExternalRequests: string[] = []

      await page.route("**/*", async route => {
        const classification = classifyBrowserRequest(route.request().url())
        if (classification === "allow") {
          await route.continue()
          return
        }
        if (classification === "suppress") {
          await route.fulfill({
            status: 204,
            contentType: "text/plain",
            body: ""
          })
          return
        }
        deniedExternalRequests.push(redactSecrets(route.request().url()))
        await route.abort("blockedbyclient")
      })

      page.on("console", (message: ConsoleMessage) => {
        if (message.type() !== "error") return
        const text = message.text()
        if (!isAppOriginConsoleError(text)) return
        consoleErrors.push(redactSecrets(text))
      })

      page.on("pageerror", error => {
        pageErrors.push(redactSecrets(error.message))
      })

      await use()

      expect(
        deniedExternalRequests,
        deniedExternalRequests.join("\n")
      ).toEqual([])
      expect(consoleErrors, consoleErrors.join("\n")).toEqual([])
      expect(pageErrors, pageErrors.join("\n")).toEqual([])
    },
    { auto: true }
  ]
})
