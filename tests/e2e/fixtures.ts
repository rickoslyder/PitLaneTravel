import { test as base, expect, type ConsoleMessage, type Page } from "@playwright/test"
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
export const E2E_RACE_IN_PROGRESS_ID = "b1070009-e2e0-4000-8000-000000000005"
export const E2E_RACE_COMPLETED_ID = "b1070009-e2e0-4000-8000-000000000006"
export const E2E_RACE_CANCELLED_ID = "b1070009-e2e0-4000-8000-000000000007"

export const E2E_CIRCUIT_NAME = "Synthetic E2E Circuit"
export const E2E_CIRCUIT_LOCATION = "E2E Fixture City"
export const E2E_CIRCUIT_COUNTRY = "Fixtureland"
export const E2E_RACE_NAME = "Synthetic Formula 1 Grand Prix"
export const E2E_RACE_SLUG = "plt-e2e-synthetic-grand-prix"
export const E2E_GRANDSTAND_NAME = "Synthetic Main Grandstand"
export const E2E_GRANDSTAND_SLUG = "synthetic-main"
export const E2E_RACE_DATE = "2099-09-15T12:00:00.000Z"
export const E2E_RACE_IN_PROGRESS_NAME = "Synthetic MotoGP Grand Prix"
export const E2E_RACE_IN_PROGRESS_SLUG = "plt-e2e-synthetic-motogp-live"
export const E2E_RACE_COMPLETED_NAME = "Synthetic Formula E E-Prix"
export const E2E_RACE_COMPLETED_SLUG = "plt-e2e-synthetic-formula-e-completed"
export const E2E_RACE_COMPLETED_DATE = "1999-06-12T12:00:00.000Z"
export const E2E_RACE_CANCELLED_NAME = "Synthetic IndyCar Grand Prix"
export const E2E_RACE_CANCELLED_SLUG = "plt-e2e-synthetic-indycar-cancelled"
export const E2E_RACE_CANCELLED_DATE = "2098-04-01T12:00:00.000Z"
export const E2E_RACE_CANCELLED_REASON =
  "Synthetic e2e cancellation. Not a real event."

export const E2E_ADMIN_USER_ID = "user_plt014_admin"
export const E2E_NONADMIN_USER_ID = "user_plt014_nonadmin"
export const E2E_CLERK_SESSION_ADMIN_ENV = "PLAYWRIGHT_E2E_CLERK_SESSION_ADMIN"
export const E2E_CLERK_SESSION_NONADMIN_ENV =
  "PLAYWRIGHT_E2E_CLERK_SESSION_NONADMIN"
export const E2E_CLERK_CLIENT_UAT_ENV = "PLAYWRIGHT_E2E_CLERK_CLIENT_UAT"

export const E2E_COVERAGE_MISSING_RACE_ID = E2E_RACE_CANCELLED_ID
export const E2E_COVERAGE_EXPIRED_RACE_ID = E2E_RACE_COMPLETED_ID
export const E2E_COVERAGE_CURRENT_RACE_ID = E2E_RACE_ID

export const E2E_COVERAGE_EXPIRED_CALENDAR_ID =
  "b1070009-e2e0-4000-8000-000000000110"
export const E2E_COVERAGE_EXPIRED_LOGISTICS_ID =
  "b1070009-e2e0-4000-8000-000000000111"
export const E2E_COVERAGE_EXPIRED_DECISION_GUIDE_ID =
  "b1070009-e2e0-4000-8000-000000000112"
export const E2E_COVERAGE_EXPIRED_LIVE_OFFER_ID =
  "b1070009-e2e0-4000-8000-000000000113"
export const E2E_COVERAGE_CURRENT_CALENDAR_ID =
  "b1070009-e2e0-4000-8000-000000000120"
export const E2E_COVERAGE_CURRENT_LOGISTICS_ID =
  "b1070009-e2e0-4000-8000-000000000121"
export const E2E_COVERAGE_CURRENT_DECISION_GUIDE_ID =
  "b1070009-e2e0-4000-8000-000000000122"
export const E2E_COVERAGE_CURRENT_LIVE_OFFER_ID =
  "b1070009-e2e0-4000-8000-000000000123"

export const E2E_COVERAGE_TIER0_RACE_ID = "b1070009-e2e0-4000-8000-000000000008"
export const E2E_COVERAGE_TIER4_RACE_ID = "b1070009-e2e0-4000-8000-000000000009"
export const E2E_COVERAGE_TIER0_RACE_NAME = "Synthetic WEC Calendar Grand Prix"
export const E2E_COVERAGE_TIER0_RACE_SLUG = "plt-e2e-synthetic-wec-calendar"
export const E2E_COVERAGE_TIER0_RACE_DATE = "2099-10-15T12:00:00.000Z"
export const E2E_COVERAGE_TIER4_RACE_NAME =
  "Synthetic WEC Personalized Grand Prix"
export const E2E_COVERAGE_TIER4_RACE_SLUG = "plt-e2e-synthetic-wec-plan"
export const E2E_COVERAGE_TIER4_RACE_DATE = "2099-11-15T12:00:00.000Z"

export const E2E_COVERAGE_TIER1_CALENDAR_ID =
  "b1070009-e2e0-4000-8000-000000000130"
export const E2E_COVERAGE_TIER1_LOGISTICS_ID =
  "b1070009-e2e0-4000-8000-000000000131"
export const E2E_COVERAGE_TIER0_CALENDAR_ID =
  "b1070009-e2e0-4000-8000-000000000140"
export const E2E_COVERAGE_TIER4_CALENDAR_ID =
  "b1070009-e2e0-4000-8000-000000000150"
export const E2E_COVERAGE_TIER4_LOGISTICS_ID =
  "b1070009-e2e0-4000-8000-000000000151"
export const E2E_COVERAGE_TIER4_DECISION_GUIDE_ID =
  "b1070009-e2e0-4000-8000-000000000152"
export const E2E_COVERAGE_TIER4_LIVE_OFFER_ID =
  "b1070009-e2e0-4000-8000-000000000153"
export const E2E_COVERAGE_TIER4_PERSONALIZED_PLAN_ID =
  "b1070009-e2e0-4000-8000-000000000154"

export const E2E_COVERAGE_EVIDENCE_IDS = [
  E2E_COVERAGE_EXPIRED_CALENDAR_ID,
  E2E_COVERAGE_EXPIRED_LOGISTICS_ID,
  E2E_COVERAGE_EXPIRED_DECISION_GUIDE_ID,
  E2E_COVERAGE_EXPIRED_LIVE_OFFER_ID,
  E2E_COVERAGE_CURRENT_CALENDAR_ID,
  E2E_COVERAGE_CURRENT_LOGISTICS_ID,
  E2E_COVERAGE_CURRENT_DECISION_GUIDE_ID,
  E2E_COVERAGE_CURRENT_LIVE_OFFER_ID,
  E2E_COVERAGE_TIER1_CALENDAR_ID,
  E2E_COVERAGE_TIER1_LOGISTICS_ID,
  E2E_COVERAGE_TIER0_CALENDAR_ID,
  E2E_COVERAGE_TIER4_CALENDAR_ID,
  E2E_COVERAGE_TIER4_LOGISTICS_ID,
  E2E_COVERAGE_TIER4_DECISION_GUIDE_ID,
  E2E_COVERAGE_TIER4_LIVE_OFFER_ID,
  E2E_COVERAGE_TIER4_PERSONALIZED_PLAN_ID
] as const

export const ADMIN_COVERAGE_MATRIX_MARKERS = [
  "Coverage matrix for every supplied event",
  "Why this tier",
  "Current inventory",
  "Add missing calendar evidence",
  "Refresh expired live-offer evidence",
  "Limited by expired live_offer",
  "Limited by missing personalized_plan"
] as const

const COVERAGE_KIND_ATTRIBUTES = {
  calendar: {
    officialSource: true,
    datesVerified: true,
    statusVerified: true
  },
  logistics: {
    primaryOrLocalSources: true,
    accessVerified: true,
    stayGuidanceVerified: true
  },
  decision_guide: {
    structuredGuide: true,
    citationsPresent: true,
    confidenceAssessed: true,
    qaPassed: true
  },
  live_offer: {
    inventoryAvailable: true,
    taggedLink: true,
    attributionConfigured: true
  },
  personalized_plan: {
    completeInputs: true,
    sourceBackedRecommendations: true,
    handoffsTracked: true
  }
} as const

export const CANONICAL_SERIES_SLUGS = [
  "f1",
  "formula-e",
  "motogp",
  "indycar",
  "wec"
] as const

export type CatalogueDerivedStatus =
  | "upcoming"
  | "in_progress"
  | "completed"
  | "cancelled"

export type CatalogueVisibleStatus =
  | "Upcoming"
  | "Live"
  | "Completed"
  | "Cancelled"

export type CatalogueStatusRace = {
  id: string
  slug: string
  name: string
  seriesSlug: (typeof CANONICAL_SERIES_SLUGS)[number]
  derivedStatus: CatalogueDerivedStatus
  visibleStatus: CatalogueVisibleStatus
}

export const CATALOGUE_STATUS_RACES: readonly CatalogueStatusRace[] = [
  {
    id: E2E_RACE_ID,
    slug: E2E_RACE_SLUG,
    name: E2E_RACE_NAME,
    seriesSlug: "f1",
    derivedStatus: "upcoming",
    visibleStatus: "Upcoming"
  },
  {
    id: E2E_RACE_IN_PROGRESS_ID,
    slug: E2E_RACE_IN_PROGRESS_SLUG,
    name: E2E_RACE_IN_PROGRESS_NAME,
    seriesSlug: "motogp",
    derivedStatus: "in_progress",
    visibleStatus: "Live"
  },
  {
    id: E2E_RACE_COMPLETED_ID,
    slug: E2E_RACE_COMPLETED_SLUG,
    name: E2E_RACE_COMPLETED_NAME,
    seriesSlug: "formula-e",
    derivedStatus: "completed",
    visibleStatus: "Completed"
  },
  {
    id: E2E_RACE_CANCELLED_ID,
    slug: E2E_RACE_CANCELLED_SLUG,
    name: E2E_RACE_CANCELLED_NAME,
    seriesSlug: "indycar",
    derivedStatus: "cancelled",
    visibleStatus: "Cancelled"
  }
]

export const PUBLIC_COVERAGE_SEARCH_QUERY = "Synthetic"

export const PUBLIC_COVERAGE_TIER_CASES = [
  {
    id: E2E_RACE_CANCELLED_ID,
    slug: E2E_RACE_CANCELLED_SLUG,
    name: E2E_RACE_CANCELLED_NAME,
    tier: null,
    depthLabel: "No verified coverage",
    offerLabel: "No current offers",
    tone: "muted"
  },
  {
    id: E2E_COVERAGE_TIER0_RACE_ID,
    slug: E2E_COVERAGE_TIER0_RACE_SLUG,
    name: E2E_COVERAGE_TIER0_RACE_NAME,
    tier: 0,
    depthLabel: "Calendar only",
    offerLabel: "No current offers",
    tone: "muted"
  },
  {
    id: E2E_RACE_IN_PROGRESS_ID,
    slug: E2E_RACE_IN_PROGRESS_SLUG,
    name: E2E_RACE_IN_PROGRESS_NAME,
    tier: 1,
    depthLabel: "Logistics",
    offerLabel: "No current offers",
    tone: "emphasis"
  },
  {
    id: E2E_RACE_COMPLETED_ID,
    slug: E2E_RACE_COMPLETED_SLUG,
    name: E2E_RACE_COMPLETED_NAME,
    tier: 2,
    depthLabel: "Decision guide",
    offerLabel: "No current offers",
    tone: "emphasis"
  },
  {
    id: E2E_RACE_ID,
    slug: E2E_RACE_SLUG,
    name: E2E_RACE_NAME,
    tier: 3,
    depthLabel: "Live offers",
    offerLabel: "Current offers",
    tone: "emphasis"
  },
  {
    id: E2E_COVERAGE_TIER4_RACE_ID,
    slug: E2E_COVERAGE_TIER4_RACE_SLUG,
    name: E2E_COVERAGE_TIER4_RACE_NAME,
    tier: 4,
    depthLabel: "Personalized plan",
    offerLabel: "Current offers",
    tone: "emphasis"
  }
] as const

export const SHARED_CIRCUIT_RACE_SLUGS = [
  E2E_RACE_SLUG,
  E2E_RACE_IN_PROGRESS_SLUG
] as const

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

async function loadCanonicalSeriesIds(
  tx: postgres.Sql
): Promise<Map<string, string>> {
  const seriesIdBySlug = new Map<string, string>()

  for (const slug of CANONICAL_SERIES_SLUGS) {
    const rows = await tx<{ id: string }[]>`
      SELECT id
      FROM series
      WHERE slug = ${slug}
    `

    if (rows.length !== 1) {
      throw new Error(
        `Expected exactly one canonical series row with slug ${slug}, found ${rows.length}`
      )
    }

    seriesIdBySlug.set(slug, rows[0].id)
  }

  return seriesIdBySlug
}

function requireSeriesId(
  seriesIdBySlug: Map<string, string>,
  slug: (typeof CANONICAL_SERIES_SLUGS)[number]
): string {
  const id = seriesIdBySlug.get(slug)
  if (!id) {
    throw new Error(
      `Expected exactly one canonical series row with slug ${slug}, found 0`
    )
  }
  return id
}

export function requireEphemeralClerkSession(role: "admin" | "nonadmin"): {
  session: string
  clientUat: string
} {
  const sessionEnv =
    role === "admin"
      ? E2E_CLERK_SESSION_ADMIN_ENV
      : E2E_CLERK_SESSION_NONADMIN_ENV
  const session = process.env[sessionEnv]
  const clientUat = process.env[E2E_CLERK_CLIENT_UAT_ENV]
  if (!session || !clientUat) {
    throw new Error(
      `Missing ephemeral Clerk ${role} session for production e2e`
    )
  }
  return { session, clientUat }
}

export function ephemeralClerkCookieHeader(
  role: "admin" | "nonadmin"
): string {
  const { session, clientUat } = requireEphemeralClerkSession(role)
  return `__session=${session}; __client_uat=${clientUat}`
}

export async function applyEphemeralClerkSession(
  page: Page,
  role: "admin" | "nonadmin"
): Promise<void> {
  const { session, clientUat } = requireEphemeralClerkSession(role)
  await page.context().addCookies([
    {
      name: "__session",
      value: session,
      url: "http://localhost:3100"
    },
    {
      name: "__client_uat",
      value: clientUat,
      url: "http://localhost:3100"
    }
  ])
}

type CoverageKind = keyof typeof COVERAGE_KIND_ATTRIBUTES

async function upsertCoverageEvidence(
  tx: postgres.Sql,
  row: {
    id: string
    raceId: string
    kind: CoverageKind
    freshness: "current" | "expired"
  }
): Promise<void> {
  const attributes = JSON.stringify(COVERAGE_KIND_ATTRIBUTES[row.kind])
  const verifiedAtSql =
    row.freshness === "current"
      ? tx`now() - interval '1 day'`
      : tx`now() - interval '30 days'`
  const expiresAtSql =
    row.freshness === "current"
      ? tx`now() + interval '30 days'`
      : tx`now() - interval '1 day'`

  await tx`
    INSERT INTO coverage_evidence (
      id, race_id, kind, source_url, source_label, attributes,
      verified_at, expires_at, review_state, revoked_at
    )
    VALUES (
      ${row.id}::uuid,
      ${row.raceId}::uuid,
      ${row.kind}::coverage_evidence_kind,
      ${`https://coverage.invalid/${row.kind}`},
      ${`Synthetic ${row.kind} evidence`},
      ${attributes}::jsonb,
      ${verifiedAtSql},
      ${expiresAtSql},
      ${"verified"}::coverage_review_state,
      NULL
    )
    ON CONFLICT (id) DO UPDATE SET
      race_id = EXCLUDED.race_id,
      kind = EXCLUDED.kind,
      source_url = EXCLUDED.source_url,
      source_label = EXCLUDED.source_label,
      attributes = EXCLUDED.attributes,
      verified_at = EXCLUDED.verified_at,
      expires_at = EXCLUDED.expires_at,
      review_state = EXCLUDED.review_state,
      revoked_at = EXCLUDED.revoked_at,
      updated_at = now()
  `
}

async function seedDisposableProfilesAndCoverage(
  tx: postgres.Sql
): Promise<void> {
  await tx`
    INSERT INTO profiles (user_id, membership, is_admin)
    VALUES
      (${E2E_ADMIN_USER_ID}, ${"free"}::membership, true),
      (${E2E_NONADMIN_USER_ID}, ${"free"}::membership, false)
    ON CONFLICT (user_id) DO UPDATE SET
      is_admin = EXCLUDED.is_admin,
      updated_at = now()
  `

  const expired = [
    {
      id: E2E_COVERAGE_EXPIRED_CALENDAR_ID,
      raceId: E2E_COVERAGE_EXPIRED_RACE_ID,
      kind: "calendar" as const,
      freshness: "current" as const
    },
    {
      id: E2E_COVERAGE_EXPIRED_LOGISTICS_ID,
      raceId: E2E_COVERAGE_EXPIRED_RACE_ID,
      kind: "logistics" as const,
      freshness: "current" as const
    },
    {
      id: E2E_COVERAGE_EXPIRED_DECISION_GUIDE_ID,
      raceId: E2E_COVERAGE_EXPIRED_RACE_ID,
      kind: "decision_guide" as const,
      freshness: "current" as const
    },
    {
      id: E2E_COVERAGE_EXPIRED_LIVE_OFFER_ID,
      raceId: E2E_COVERAGE_EXPIRED_RACE_ID,
      kind: "live_offer" as const,
      freshness: "expired" as const
    }
  ]
  const current = [
    {
      id: E2E_COVERAGE_CURRENT_CALENDAR_ID,
      raceId: E2E_COVERAGE_CURRENT_RACE_ID,
      kind: "calendar" as const,
      freshness: "current" as const
    },
    {
      id: E2E_COVERAGE_CURRENT_LOGISTICS_ID,
      raceId: E2E_COVERAGE_CURRENT_RACE_ID,
      kind: "logistics" as const,
      freshness: "current" as const
    },
    {
      id: E2E_COVERAGE_CURRENT_DECISION_GUIDE_ID,
      raceId: E2E_COVERAGE_CURRENT_RACE_ID,
      kind: "decision_guide" as const,
      freshness: "current" as const
    },
    {
      id: E2E_COVERAGE_CURRENT_LIVE_OFFER_ID,
      raceId: E2E_COVERAGE_CURRENT_RACE_ID,
      kind: "live_offer" as const,
      freshness: "current" as const
    }
    ]
    const extraTiers = [
    {
      id: E2E_COVERAGE_TIER1_CALENDAR_ID,
      raceId: E2E_RACE_IN_PROGRESS_ID,
      kind: "calendar" as const,
      freshness: "current" as const
    },
    {
      id: E2E_COVERAGE_TIER1_LOGISTICS_ID,
      raceId: E2E_RACE_IN_PROGRESS_ID,
      kind: "logistics" as const,
      freshness: "current" as const
    },
    {
      id: E2E_COVERAGE_TIER0_CALENDAR_ID,
      raceId: E2E_COVERAGE_TIER0_RACE_ID,
      kind: "calendar" as const,
      freshness: "current" as const
    },
    {
      id: E2E_COVERAGE_TIER4_CALENDAR_ID,
      raceId: E2E_COVERAGE_TIER4_RACE_ID,
      kind: "calendar" as const,
      freshness: "current" as const
    },
    {
      id: E2E_COVERAGE_TIER4_LOGISTICS_ID,
      raceId: E2E_COVERAGE_TIER4_RACE_ID,
      kind: "logistics" as const,
      freshness: "current" as const
    },
    {
      id: E2E_COVERAGE_TIER4_DECISION_GUIDE_ID,
      raceId: E2E_COVERAGE_TIER4_RACE_ID,
      kind: "decision_guide" as const,
      freshness: "current" as const
    },
    {
      id: E2E_COVERAGE_TIER4_LIVE_OFFER_ID,
      raceId: E2E_COVERAGE_TIER4_RACE_ID,
      kind: "live_offer" as const,
      freshness: "current" as const
    },
    {
      id: E2E_COVERAGE_TIER4_PERSONALIZED_PLAN_ID,
      raceId: E2E_COVERAGE_TIER4_RACE_ID,
      kind: "personalized_plan" as const,
      freshness: "current" as const
    }
    ]

    for (const row of [...expired, ...current, ...extraTiers]) {
    await upsertCoverageEvidence(tx, row)
    }
}

async function cleanupDisposableCoverage(sql: postgres.Sql): Promise<void> {
  for (const id of E2E_COVERAGE_EVIDENCE_IDS) {
    await sql`DELETE FROM coverage_evidence WHERE id = ${id}::uuid`
  }
}

async function cleanupDisposableProfiles(sql: postgres.Sql): Promise<void> {
  await sql`DELETE FROM profiles WHERE user_id = ${E2E_ADMIN_USER_ID}`
  await sql`DELETE FROM profiles WHERE user_id = ${E2E_NONADMIN_USER_ID}`
}

async function seedCatalog(sql: postgres.Sql): Promise<SeededCatalog> {
  await sql.begin(async tx => {
    const seriesIdBySlug = await loadCanonicalSeriesIds(tx)
    const f1SeriesId = requireSeriesId(seriesIdBySlug, "f1")
    const motogpSeriesId = requireSeriesId(seriesIdBySlug, "motogp")
    const formulaESeriesId = requireSeriesId(seriesIdBySlug, "formula-e")
    const indycarSeriesId = requireSeriesId(seriesIdBySlug, "indycar")
    const wecSeriesId = requireSeriesId(seriesIdBySlug, "wec")

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
      INSERT INTO races (
        id, circuit_id, series_id, name, date, season, round,
        country, description, status, slug, is_sprint_weekend,
        weekend_start, weekend_end, cancellation_reason
      )
      VALUES (
        ${E2E_RACE_IN_PROGRESS_ID}::uuid,
        ${E2E_CIRCUIT_ID}::uuid,
        ${motogpSeriesId}::uuid,
        ${E2E_RACE_IN_PROGRESS_NAME},
        now(),
        2099,
        1,
        ${E2E_CIRCUIT_COUNTRY},
        ${"Synthetic MotoGP weekend used only by disposable Playwright e2e. Not a real event."},
        ${"upcoming"}::race_status,
        ${E2E_RACE_IN_PROGRESS_SLUG},
        false,
        now() - interval '12 hours',
        now() + interval '12 hours',
        NULL
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
        weekend_start = EXCLUDED.weekend_start,
        weekend_end = EXCLUDED.weekend_end,
        cancellation_reason = EXCLUDED.cancellation_reason,
        updated_at = now()
    `

    await tx`
      INSERT INTO races (
        id, circuit_id, series_id, name, date, season, round,
        country, description, status, slug, is_sprint_weekend,
        weekend_start, weekend_end, cancellation_reason
      )
      VALUES (
        ${E2E_RACE_COMPLETED_ID}::uuid,
        ${E2E_CIRCUIT_ID}::uuid,
        ${formulaESeriesId}::uuid,
        ${E2E_RACE_COMPLETED_NAME},
        ${E2E_RACE_COMPLETED_DATE}::timestamptz,
        1999,
        1,
        ${E2E_CIRCUIT_COUNTRY},
        ${"Synthetic Formula E weekend used only by disposable Playwright e2e. Not a real event."},
        ${"completed"}::race_status,
        ${E2E_RACE_COMPLETED_SLUG},
        false,
        ${E2E_RACE_COMPLETED_DATE}::timestamptz,
        ${E2E_RACE_COMPLETED_DATE}::timestamptz + interval '1 day',
        NULL
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
        weekend_start = EXCLUDED.weekend_start,
        weekend_end = EXCLUDED.weekend_end,
        cancellation_reason = EXCLUDED.cancellation_reason,
        updated_at = now()
    `

    await tx`
      INSERT INTO races (
        id, circuit_id, series_id, name, date, season, round,
        country, description, status, slug, is_sprint_weekend,
        weekend_start, weekend_end, cancellation_reason
      )
      VALUES (
        ${E2E_RACE_CANCELLED_ID}::uuid,
        ${E2E_CIRCUIT_ID}::uuid,
        ${indycarSeriesId}::uuid,
        ${E2E_RACE_CANCELLED_NAME},
        ${E2E_RACE_CANCELLED_DATE}::timestamptz,
        2098,
        1,
        ${E2E_CIRCUIT_COUNTRY},
        ${"Synthetic IndyCar weekend used only by disposable Playwright e2e. Not a real event."},
        ${"cancelled"}::race_status,
        ${E2E_RACE_CANCELLED_SLUG},
        false,
        NULL,
        NULL,
        ${E2E_RACE_CANCELLED_REASON}
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
        weekend_start = EXCLUDED.weekend_start,
        weekend_end = EXCLUDED.weekend_end,
        cancellation_reason = EXCLUDED.cancellation_reason,
        updated_at = now()
    `

    await tx`
      INSERT INTO races (
        id, circuit_id, series_id, name, date, season, round,
        country, description, status, slug, is_sprint_weekend
      )
      VALUES (
        ${E2E_COVERAGE_TIER0_RACE_ID}::uuid,
        ${E2E_CIRCUIT_ID}::uuid,
        ${wecSeriesId}::uuid,
        ${E2E_COVERAGE_TIER0_RACE_NAME},
        ${E2E_COVERAGE_TIER0_RACE_DATE}::timestamptz,
        2099,
        2,
        ${E2E_CIRCUIT_COUNTRY},
        ${"Synthetic WEC calendar-only weekend used only by disposable Playwright e2e. Not a real event."},
        ${"upcoming"}::race_status,
        ${E2E_COVERAGE_TIER0_RACE_SLUG},
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
      INSERT INTO races (
        id, circuit_id, series_id, name, date, season, round,
        country, description, status, slug, is_sprint_weekend
      )
      VALUES (
        ${E2E_COVERAGE_TIER4_RACE_ID}::uuid,
        ${E2E_CIRCUIT_ID}::uuid,
        ${wecSeriesId}::uuid,
        ${E2E_COVERAGE_TIER4_RACE_NAME},
        ${E2E_COVERAGE_TIER4_RACE_DATE}::timestamptz,
        2099,
        3,
        ${E2E_CIRCUIT_COUNTRY},
        ${"Synthetic WEC personalized-plan weekend used only by disposable Playwright e2e. Not a real event."},
        ${"upcoming"}::race_status,
        ${E2E_COVERAGE_TIER4_RACE_SLUG},
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

    await seedDisposableProfilesAndCoverage(tx)
  })

  return {
    raceSlug: E2E_RACE_SLUG,
    raceName: E2E_RACE_NAME,
    circuitName: E2E_CIRCUIT_NAME
  }
}

async function cleanupCatalog(sql: postgres.Sql): Promise<void> {
  await cleanupDisposableCoverage(sql)
  await sql`DELETE FROM races WHERE id = ${E2E_COVERAGE_TIER0_RACE_ID}::uuid`
  await sql`DELETE FROM races WHERE id = ${E2E_COVERAGE_TIER4_RACE_ID}::uuid`
  await sql`DELETE FROM races WHERE id = ${E2E_RACE_IN_PROGRESS_ID}::uuid`
  await sql`DELETE FROM races WHERE id = ${E2E_RACE_COMPLETED_ID}::uuid`
  await sql`DELETE FROM races WHERE id = ${E2E_RACE_CANCELLED_ID}::uuid`
  await sql`DELETE FROM grandstands WHERE id = ${E2E_GRANDSTAND_ID}::uuid`
  await sql`DELETE FROM races WHERE id = ${E2E_RACE_ID}::uuid`
  await sql`DELETE FROM circuits WHERE id = ${E2E_CIRCUIT_ID}::uuid`
  await cleanupDisposableProfiles(sql)
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
