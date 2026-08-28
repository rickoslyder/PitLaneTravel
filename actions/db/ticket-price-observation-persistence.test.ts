import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it, vi } from "vitest"
import { getTableConfig } from "drizzle-orm/pg-core"
import {
  ticketPriceObservationSchema,
  type ObservationAttempt,
  type TicketPriceObservation
} from "@/lib/ticket-price-observation"

const ROOT = process.cwd()
const MIGRATIONS_DIR = path.join(ROOT, "db/migrations")
const SCHEMA_PATH = path.join(
  ROOT,
  "db/schema/ticket-price-observation-schema.ts"
)
const INDEX_PATH = path.join(ROOT, "db/schema/index.ts")
const PERSISTENCE_PATH = path.join(
  ROOT,
  "actions/db/ticket-price-observation-persistence.ts"
)
const MIGRATION_PREFIX = "0009_"
const ATTEMPTS_TABLE = "ticket_price_observation_attempts"
const OBSERVATIONS_TABLE = "ticket_price_observations"
const APPEND_ONLY_FN = "reject_append_only_mutation"
const MAX_SAFE = 9007199254740991

const SOURCE_METHODS = [
  "api",
  "feed",
  "official_page",
  "authenticated_portal"
] as const
const SESSION_SCOPES = [
  "race_day",
  "saturday",
  "weekend",
  "multi_day",
  "hospitality"
] as const
const AVAILABILITIES = [
  "available",
  "low_stock",
  "sold_out",
  "unknown"
] as const
const AUTHORISATION_TIERS = [
  "official",
  "authorised_reseller",
  "bonded_package_operator",
  "unverified_secondary"
] as const
const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const
const FAILURE_REASONS = [
  "auth",
  "rate_limited",
  "unavailable",
  "invalid_payload",
  "network",
  "unknown"
] as const
const ATTEMPT_STATUSES = ["observed", "failed"] as const

const ATTEMPT_COLUMNS = [
  "id",
  "status",
  "provider",
  "source_url",
  "attempted_at",
  "failure_reason",
  "created_at"
] as const

const OBSERVATION_COLUMNS = [
  "id",
  "attempt_id",
  "attempt_status",
  "provider",
  "source_url",
  "source_method",
  "observed_at",
  "race_id",
  "session_scope",
  "grandstand_id",
  "zone",
  "ticket_class",
  "quantity",
  "currency",
  "base_price_minor",
  "mandatory_fees_minor",
  "all_in_total_minor",
  "availability",
  "fulfilment_restrictions",
  "refund_terms_summary",
  "authorisation_tier",
  "confidence",
  "created_at"
] as const

function numberedSqlFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith(".sql"))
    .filter(file => Number(file.slice(0, 4)) >= 3)
    .sort()
}

function migrationPath(): string {
  const file = numberedSqlFiles().find(name =>
    name.startsWith(MIGRATION_PREFIX)
  )
  expect(file, "expected 0009_*.sql in db/migrations").toBeTruthy()
  return path.join(MIGRATIONS_DIR, file!)
}

function read(filePath: string): string {
  expect(existsSync(filePath), `missing ${path.relative(ROOT, filePath)}`).toBe(
    true
  )
  return readFileSync(filePath, "utf8")
}

function stripSqlComments(sql: string): string {
  return sql.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--[^\n]*/g, "")
}

function collapse(sql: string): string {
  return stripSqlComments(sql).replace(/\s+/g, " ").trim()
}

function extractEnumValues(sql: string, enumName: string): string[] {
  const match = stripSqlComments(sql).match(
    new RegExp(`CREATE TYPE\\s+"${enumName}"\\s+AS ENUM\\s*\\(([^)]*)\\)`, "i")
  )
  if (!match?.[1]) return []
  return [...match[1].matchAll(/'([^']+)'/g)].map(item => item[1])
}

function sqlChunksToText(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean")
    return String(value)
  if (Array.isArray(value))
    return value.map(item => sqlChunksToText(item)).join("")
  if (typeof value === "object") {
    const obj = value as {
      queryChunks?: unknown[]
      value?: unknown
      name?: unknown
    }
    if (Array.isArray(obj.queryChunks)) {
      return obj.queryChunks.map(item => sqlChunksToText(item)).join("")
    }
    if (
      Array.isArray(obj.value) &&
      obj.value.every(item => typeof item === "string")
    ) {
      return obj.value.join("")
    }
    if (typeof obj.name === "string") return `"${obj.name}"`
    if (typeof obj.value === "string") return obj.value
  }
  return ""
}

function normalizeExpr(expr: string): string {
  return expr.replace(/"/g, "").replace(/\s+/g, " ").trim()
}

function extractCreateTable(sql: string, table: string): string {
  const body = stripSqlComments(sql)
  const start = body.search(
    new RegExp(`CREATE TABLE IF NOT EXISTS\\s+"${table}"\\s*\\(`, "i")
  )
  expect(start, `CREATE TABLE IF NOT EXISTS "${table}"`).toBeGreaterThan(-1)
  let depth = 0
  for (let i = start; i < body.length; i += 1) {
    if (body[i] === "(") depth += 1
    if (body[i] === ")") {
      depth -= 1
      if (depth === 0) return body.slice(start, i + 1)
    }
  }
  throw new Error(`unterminated CREATE TABLE "${table}"`)
}

function splitComma(list: string): string[] {
  const items: string[] = []
  let current = ""
  let depth = 0
  for (const char of list) {
    if (char === "(") depth += 1
    if (char === ")") depth -= 1
    if (char === "," && depth === 0) {
      items.push(current.trim())
      current = ""
      continue
    }
    current += char
  }
  if (current.trim()) items.push(current.trim())
  return items
}

function extractTableColumns(sql: string, table: string): string[] {
  const create = extractCreateTable(sql, table)
  const inner = create.slice(create.indexOf("(") + 1, create.lastIndexOf(")"))
  return splitComma(inner)
    .filter(
      line =>
        !/^(CONSTRAINT|CHECK|PRIMARY KEY|UNIQUE|FOREIGN KEY)\b/i.test(line)
    )
    .map(line => line.match(/^"([^"]+)"/)?.[1])
    .filter((name): name is string => Boolean(name))
}

function extractBalanced(source: string, openIndex: number): string {
  let depth = 0
  for (let i = openIndex; i < source.length; i += 1) {
    if (source[i] === "(") depth += 1
    if (source[i] === ")") {
      depth -= 1
      if (depth === 0) return source.slice(openIndex + 1, i)
    }
  }
  throw new Error("unterminated SQL parenthesis")
}

function extractNamedChecks(sql: string): Record<string, string> {
  const checks: Record<string, string> = {}
  const source = stripSqlComments(sql)
  const marker = /(?:ADD\s+)?CONSTRAINT\s+"([^"]+)"\s+CHECK\s*\(/gi
  for (const match of source.matchAll(marker)) {
    const openIndex = match.index! + match[0].length - 1
    checks[match[1]] = normalizeExpr(extractBalanced(source, openIndex))
  }
  return checks
}

function validObservation(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    provider: "p1-travel",
    sourceUrl: "https://www.p1travel.com/f1/monza",
    sourceMethod: "api",
    observedAt: "2026-08-28T12:00:00.000Z",
    raceId: "f1-2026-italy",
    sessionScope: "race_day",
    grandstandId: "tifosi",
    zone: "upper",
    ticketClass: "adult-seated",
    quantity: 2,
    currency: "EUR",
    basePriceMinor: 45000,
    mandatoryFeesMinor: 5000,
    allInTotalMinor: 50000,
    availability: "available",
    fulfilmentRestrictions: ["photo-id"],
    refundTermsSummary: "Non-refundable",
    authorisationTier: "authorised_reseller",
    confidence: "high",
    ...overrides
  }
}

function parseObservation(
  overrides: Record<string, unknown> = {}
): TicketPriceObservation {
  return ticketPriceObservationSchema.parse(validObservation(overrides))
}

type MemoryStore = {
  transactionCalls: number
  committedAttempts: Array<Record<string, unknown>>
  committedObservations: Array<Record<string, unknown>>
  failNextObservation: boolean
  transaction: <T>(
    fn: (tx: {
      insertAttempt: (
        values: Record<string, unknown>
      ) => Promise<Record<string, unknown>>
      insertObservation: (
        values: Record<string, unknown>
      ) => Promise<Record<string, unknown>>
    }) => Promise<T>
  ) => Promise<T>
  findLatestSuccessfulObservation: (
    identity: Record<string, unknown>
  ) => Promise<Record<string, unknown> | null>
}

function idOrdinal(id: unknown): number {
  const match = /(\d+)\s*$/.exec(String(id))
  return match ? Number(match[1]) : 0
}

function createMemoryStore(): MemoryStore {
  const committedAttempts: Array<Record<string, unknown>> = []
  const committedObservations: Array<Record<string, unknown>> = []
  const store: MemoryStore = {
    transactionCalls: 0,
    committedAttempts,
    committedObservations,
    failNextObservation: false,
    async transaction(fn) {
      store.transactionCalls += 1
      const stagedAttempts: Array<Record<string, unknown>> = []
      const stagedObservations: Array<Record<string, unknown>> = []
      const tx = {
        async insertAttempt(values: Record<string, unknown>) {
          const row = {
            id: `attempt-${committedAttempts.length + stagedAttempts.length + 1}`,
            ...values
          }
          stagedAttempts.push(row)
          return row
        },
        async insertObservation(values: Record<string, unknown>) {
          if (store.failNextObservation) {
            store.failNextObservation = false
            throw new Error("observation insert failed")
          }
          const row = {
            id: `obs-${committedObservations.length + stagedObservations.length + 1}`,
            createdAt: new Date(),
            ...values
          }
          stagedObservations.push(row)
          return row
        }
      }
      const result = await fn(tx)
      committedAttempts.push(...stagedAttempts)
      committedObservations.push(...stagedObservations)
      return result
    },
    async findLatestSuccessfulObservation(identity) {
      const matches = committedObservations.filter(row => {
        return (
          row.provider === identity.provider &&
          row.sourceUrl === identity.sourceUrl &&
          row.raceId === identity.raceId &&
          row.sessionScope === identity.sessionScope &&
          row.grandstandId === identity.grandstandId &&
          row.zone === identity.zone &&
          row.ticketClass === identity.ticketClass &&
          row.quantity === identity.quantity
        )
      })
      // Mirrors the real query's deterministic ordering:
      // observed_at desc, created_at desc, id desc.
      matches.sort((left, right) => {
        const byObserved =
          (right.observedAt as Date).getTime() -
          (left.observedAt as Date).getTime()
        if (byObserved !== 0) return byObserved
        const byCreated =
          ((right.createdAt as Date | undefined)?.getTime() ?? 0) -
          ((left.createdAt as Date | undefined)?.getTime() ?? 0)
        if (byCreated !== 0) return byCreated
        return idOrdinal(right.id) - idOrdinal(left.id)
      })
      return matches[0] ?? null
    }
  }
  return store
}

function latestIdentity(observation: TicketPriceObservation) {
  return {
    provider: observation.provider,
    sourceUrl: observation.sourceUrl,
    raceId: observation.raceId,
    sessionScope: observation.sessionScope,
    grandstandId: observation.grandstandId,
    zone: observation.zone,
    ticketClass: observation.ticketClass,
    quantity: observation.quantity
  }
}

async function loadPersistence() {
  return import("./ticket-price-observation-persistence")
}

describe("0009 ticket price observation SQL migration", () => {
  it("adds the next numbered hand-authored SQL file after 0008", () => {
    const selected = numberedSqlFiles()
    expect(selected).toContain("0008_coverage.sql")
    expect(selected.some(file => file.startsWith(MIGRATION_PREFIX))).toBe(true)
    expect(existsSync(migrationPath())).toBe(true)
  })

  it("uses valid SQL comments instead of diff-marker-prefixed pseudo-comments", () => {
    const invalidCommentLines = read(migrationPath())
      .split("\n")
      .filter(line => /^\s*\|--/.test(line))
    expect(invalidCommentLines).toEqual([])
  })

  it("is additive and idempotent, append-only, and has no drops/resets/backfill", () => {
    const sql = read(migrationPath())
    const stripped = stripSqlComments(sql)
    const collapsed = collapse(sql)

    expect(collapsed).toMatch(
      /CREATE TABLE IF NOT EXISTS "ticket_price_observation_attempts"/i
    )
    expect(collapsed).toMatch(
      /CREATE TABLE IF NOT EXISTS "ticket_price_observations"/i
    )
    expect(extractTableColumns(sql, ATTEMPTS_TABLE).sort()).toEqual(
      [...ATTEMPT_COLUMNS].sort()
    )
    expect(extractTableColumns(sql, OBSERVATIONS_TABLE).sort()).toEqual(
      [...OBSERVATION_COLUMNS].sort()
    )

    expect(
      extractEnumValues(sql, "ticket_price_observation_attempt_status")
    ).toEqual([...ATTEMPT_STATUSES])
    expect(
      extractEnumValues(sql, "ticket_price_observation_failure_reason")
    ).toEqual([...FAILURE_REASONS])
    expect(extractEnumValues(sql, "ticket_price_source_method")).toEqual([
      ...SOURCE_METHODS
    ])
    expect(extractEnumValues(sql, "ticket_price_session_scope")).toEqual([
      ...SESSION_SCOPES
    ])
    expect(extractEnumValues(sql, "ticket_price_availability")).toEqual([
      ...AVAILABILITIES
    ])
    expect(extractEnumValues(sql, "ticket_price_authorisation_tier")).toEqual([
      ...AUTHORISATION_TIERS
    ])
    expect(extractEnumValues(sql, "ticket_price_confidence")).toEqual([
      ...CONFIDENCE_LEVELS
    ])

    expect(collapsed).toMatch(
      /CREATE OR REPLACE FUNCTION "reject_append_only_mutation"/i
    )
    expect(collapsed).toMatch(/BEFORE UPDATE OR DELETE/i)
    expect(collapsed).toMatch(new RegExp(`ON\\s+"${ATTEMPTS_TABLE}"`, "i"))
    expect(collapsed).toMatch(new RegExp(`ON\\s+"${OBSERVATIONS_TABLE}"`, "i"))
    expect(collapsed).toMatch(
      new RegExp(`EXECUTE (FUNCTION|PROCEDURE)\\s+"?${APPEND_ONLY_FN}"?`, "i")
    )
    expect(
      stripped.match(new RegExp(APPEND_ONLY_FN, "g"))?.length
    ).toBeGreaterThanOrEqual(3)

    expect(sql).toMatch(/\^\[A-Z\]\{3\}/)
    expect(collapsed).toMatch(/starts_with\("source_url", 'https:\/\/'\)/)
    expect(collapsed).not.toMatch(/starts_with\("source_url", 'http:\/\/'\)/)
    expect(collapsed).toMatch(/"quantity" bigint NOT NULL/)
    expect(collapsed).toMatch(/"base_price_minor" bigint NOT NULL/)
    expect(collapsed).toMatch(/"mandatory_fees_minor" bigint/)
    expect(collapsed).toMatch(/"all_in_total_minor" bigint/)
    expect(collapsed).toContain(String(MAX_SAFE))
    expect(collapsed).toMatch(
      /"all_in_total_minor" = "base_price_minor" \+ "mandatory_fees_minor"/
    )
    expect(collapsed).toMatch(/UNIQUE\s*\(\s*"attempt_id"\s*\)/i)
    expect(collapsed).toMatch(
      /FOREIGN KEY\s*\(\s*"attempt_id"\s*,\s*"attempt_status"\s*\)/i
    )
    expect(collapsed).not.toMatch(/updated_at/)
    expect(collapsed).not.toMatch(/latest_/)
    expect(collapsed).not.toMatch(/\bp1_|sportsbreaks|partnerize|awin|impact_/i)

    const scanned = stripped
      .replace(/ON DELETE CASCADE/gi, "")
      .replace(/BEFORE UPDATE OR DELETE/gi, "")
    expect(scanned).not.toMatch(
      /\bDROP\s+(TABLE|COLUMN|DATABASE|TRIGGER|FUNCTION)\b/i
    )
    expect(scanned).not.toMatch(/\bTRUNCATE\b/i)
    expect(scanned).not.toMatch(/\bDELETE\s+FROM\b/i)
    expect(scanned).not.toMatch(/\bUPDATE\s+"/i)
    expect(scanned).not.toMatch(/\bGRANT\b/i)
    expect(scanned).not.toMatch(/\bREVOKE\b/i)
    expect(scanned).not.toMatch(/\bINSERT\s+INTO\b/i)
    expect(scanned).not.toMatch(/WHEN\s+OTHERS/i)

    const checks = extractNamedChecks(sql)
    const checkExprs = Object.values(checks)
    expect(
      checkExprs.some(expr =>
        /\(status = 'observed' AND failure_reason IS NULL\) OR \(status = 'failed' AND failure_reason IS NOT NULL\)/.test(
          expr.replace(/\s+/g, " ")
        )
      )
    ).toBe(true)
    expect(
      checkExprs.some(
        expr => expr.includes("attempt_status") && expr.includes("'observed'")
      )
    ).toBe(true)
  })

  it("enforces both-null or both-non-null all-in pricing (CHECK must not admit UNKNOWN)", () => {
    const checks = extractNamedChecks(read(migrationPath()))
    const allIn = checks["ticket_price_observations_all_in_total_consistency"]
    expect(allIn, "named all-in consistency CHECK").toBeTruthy()
    // Exact shape: both null, OR both non-null with total = base + fees.
    // Without the explicit IS NOT NULL arm, a mixed-null row makes the bare
    // comparison UNKNOWN and PostgreSQL CHECK constraints admit UNKNOWN.
    const compact = allIn.replace(/\(\s+/g, "(").replace(/\s+\)/g, ")")
    expect(compact).toBe(
      "(mandatory_fees_minor IS NULL AND all_in_total_minor IS NULL) " +
        "OR (mandatory_fees_minor IS NOT NULL " +
        "AND all_in_total_minor IS NOT NULL " +
        "AND all_in_total_minor = base_price_minor + mandatory_fees_minor)"
    )

    // Local mirror of the intended semantics (no live DB): every mixed-null
    // combination must evaluate to FALSE, not UNKNOWN-admitted.
    const admits = (
      base: number,
      fees: number | null,
      total: number | null
    ): boolean =>
      (fees === null && total === null) ||
      (fees !== null && total !== null && total === base + fees)
    expect(admits(100, null, null)).toBe(true)
    expect(admits(100, 10, 110)).toBe(true)
    expect(admits(100, 10, null)).toBe(false)
    expect(admits(100, null, 100)).toBe(false)
    expect(admits(100, 10, 111)).toBe(false)
  })

  it("names UNIQUE and FK constraints exactly like Drizzle", () => {
    const collapsed = collapse(read(migrationPath()))
    const named = [
      "ticket_price_observation_attempts_id_status_unique",
      "ticket_price_observations_attempt_id_unique",
      "ticket_price_observations_attempt_fk"
    ]
    for (const name of named) {
      expect(collapsed).toContain(`CONSTRAINT "${name}"`)
    }
    expect(collapsed).toMatch(
      /CONSTRAINT "ticket_price_observation_attempts_id_status_unique" UNIQUE \("id", "status"\)/i
    )
    expect(collapsed).toMatch(
      /CONSTRAINT "ticket_price_observations_attempt_id_unique" UNIQUE \("attempt_id"\)/i
    )
    expect(collapsed).toMatch(
      /CONSTRAINT "ticket_price_observations_attempt_fk" FOREIGN KEY \("attempt_id", "attempt_status"\) REFERENCES "ticket_price_observation_attempts" \("id", "status"\)/i
    )
  })

  it("indexes the full latest-lookup identity including grandstand, zone, and quantity", () => {
    const collapsed = collapse(read(migrationPath()))
    expect(collapsed).toMatch(
      /CREATE INDEX IF NOT EXISTS "ticket_price_observations_identity_observed_idx" ON "ticket_price_observations" \(\s*"provider",\s*"source_url",\s*"race_id",\s*"session_scope",\s*"grandstand_id",\s*"zone",\s*"ticket_class",\s*"quantity",\s*"observed_at"\s*\)/i
    )
  })
})

describe("ticket price observation drizzle schema", () => {
  it("adds schema module and re-exports it from the barrel", () => {
    expect(existsSync(SCHEMA_PATH)).toBe(true)
    expect(read(INDEX_PATH)).toMatch(
      /export \* from ["']\.\/ticket-price-observation-schema["']/
    )
  })

  it("declares append-only tables, constraints, and provider-neutral columns", async () => {
    const schema = await import("@/db/schema")
    expect(schema).toHaveProperty("ticketPriceObservationAttemptsTable")
    expect(schema).toHaveProperty("ticketPriceObservationsTable")

    const mod = await import("@/db/schema/ticket-price-observation-schema")
    const attempts = getTableConfig(mod.ticketPriceObservationAttemptsTable)
    const observations = getTableConfig(mod.ticketPriceObservationsTable)

    expect(attempts.name).toBe(ATTEMPTS_TABLE)
    expect(observations.name).toBe(OBSERVATIONS_TABLE)
    expect(attempts.columns.map(column => column.name).sort()).toEqual(
      [...ATTEMPT_COLUMNS].sort()
    )
    expect(observations.columns.map(column => column.name).sort()).toEqual(
      [...OBSERVATION_COLUMNS].sort()
    )

    const attemptCols = Object.fromEntries(
      attempts.columns.map(column => [column.name, column])
    )
    const observationCols = Object.fromEntries(
      observations.columns.map(column => [column.name, column])
    )
    expect(attemptCols).not.toHaveProperty("updated_at")
    expect(observationCols).not.toHaveProperty("updated_at")
    expect(observationCols.quantity.columnType).toBe("PgBigInt53")
    expect(observationCols.base_price_minor.columnType).toBe("PgBigInt53")
    expect(observationCols.race_id.columnType).toBe("PgText")
    expect(observationCols.race_id.notNull).toBe(true)

    const observationFks = observations.foreignKeys.map(fk => {
      const ref = fk.reference()
      return {
        columns: ref.columns.map(column => column.name),
        foreignTable: getTableConfig(ref.foreignTable).name,
        foreignColumns: ref.foreignColumns.map(column => column.name)
      }
    })
    expect(observationFks).toEqual([
      {
        columns: ["attempt_id", "attempt_status"],
        foreignTable: ATTEMPTS_TABLE,
        foreignColumns: ["id", "status"]
      }
    ])

    const uniqueNames = observations.uniqueConstraints.map(item =>
      item.columns.map(column => column.name)
    )
    expect(uniqueNames).toContainEqual(["attempt_id"])

    const checkExprs = observations.checks.map(check =>
      normalizeExpr(sqlChunksToText(check.value))
    )
    expect(checkExprs.some(expr => expr.includes("^[A-Z]{3}$"))).toBe(true)
    expect(
      checkExprs.some(expr =>
        expr.includes(
          "all_in_total_minor = base_price_minor + mandatory_fees_minor"
        )
      )
    ).toBe(true)

    // Exact shape, matching the SQL migration: both null, OR both non-null
    // with total = base + fees. A bare comparison would admit mixed-null
    // rows as UNKNOWN under PostgreSQL CHECK semantics.
    const allInCheck = observations.checks.find(
      check =>
        check.name === "ticket_price_observations_all_in_total_consistency"
    )
    expect(allInCheck, "named all-in consistency CHECK").toBeTruthy()
    expect(normalizeExpr(sqlChunksToText(allInCheck!.value))).toBe(
      "(mandatory_fees_minor IS NULL AND all_in_total_minor IS NULL) " +
        "OR (mandatory_fees_minor IS NOT NULL " +
        "AND all_in_total_minor IS NOT NULL " +
        "AND all_in_total_minor = base_price_minor + mandatory_fees_minor)"
    )
  })

  it("matches the SQL constraint names and latest-lookup index columns", async () => {
    const mod = await import("@/db/schema/ticket-price-observation-schema")
    const attempts = getTableConfig(mod.ticketPriceObservationAttemptsTable)
    const observations = getTableConfig(mod.ticketPriceObservationsTable)

    expect(attempts.uniqueConstraints.map(item => item.name)).toEqual([
      "ticket_price_observation_attempts_id_status_unique"
    ])
    expect(observations.uniqueConstraints.map(item => item.name)).toEqual([
      "ticket_price_observations_attempt_id_unique"
    ])
    // drizzle-orm 0.33 does not expose the FK name via getTableConfig;
    // assert it from the schema source instead.
    expect(read(SCHEMA_PATH)).toContain(
      'name: "ticket_price_observations_attempt_fk"'
    )

    const latestIdx = observations.indexes.find(
      idx =>
        idx.config.name === "ticket_price_observations_identity_observed_idx"
    )
    expect(latestIdx, "latest-lookup index").toBeTruthy()
    const indexColumns = latestIdx!.config.columns.map(
      column => (column as { name: string }).name
    )
    expect(indexColumns).toEqual([
      "provider",
      "source_url",
      "race_id",
      "session_scope",
      "grandstand_id",
      "zone",
      "ticket_class",
      "quantity",
      "observed_at"
    ])
  })
})

describe("ticket price observation persistence module", () => {
  it("lives under actions/db and is not a public server action", () => {
    const source = read(PERSISTENCE_PATH)
    expect(source).not.toMatch(/["']use server["']/)
    expect(source).not.toMatch(/console\.(log|info|debug|warn|error)/)
    expect(source).not.toMatch(/\bp1_|sportsbreaks|partnerize/i)
  })

  it("validates the Zod contract before opening a transaction", async () => {
    const { persistObservationAttempt } = await loadPersistence()
    const store = createMemoryStore()
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined)
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined)

    await expect(
      persistObservationAttempt(
        {
          status: "observed",
          observation: validObservation({
            sourceUrl: "http://www.p1travel.com/f1/monza"
          })
        } as ObservationAttempt,
        store
      )
    ).rejects.toThrow()
    expect(store.transactionCalls).toBe(0)
    expect(store.committedAttempts).toEqual([])
    expect(store.committedObservations).toEqual([])

    await expect(
      persistObservationAttempt(
        {
          status: "failed",
          provider: "p1-travel",
          sourceUrl: "http://www.p1travel.com/f1/monza",
          attemptedAt: new Date("2026-08-28T13:00:00.000Z"),
          failureReason: "network"
        },
        store
      )
    ).rejects.toThrow()
    expect(store.transactionCalls).toBe(0)
    expect(log.mock.calls.flat().join("\n")).not.toContain(
      "https://www.p1travel.com/f1/monza"
    )
    expect(error.mock.calls.flat().join("\n")).not.toContain(
      "https://www.p1travel.com/f1/monza"
    )
    log.mockRestore()
    error.mockRestore()
  })

  it("writes an observed attempt and observation in one transaction", async () => {
    const { persistObservationAttempt } = await loadPersistence()
    const store = createMemoryStore()
    const observation = parseObservation()

    const result = await persistObservationAttempt(
      { status: "observed", observation },
      store
    )

    expect(store.transactionCalls).toBe(1)
    expect(result).toEqual({
      attemptId: "attempt-1",
      observationId: "obs-1"
    })
    expect(store.committedAttempts).toHaveLength(1)
    expect(store.committedObservations).toHaveLength(1)
    expect(store.committedAttempts[0]).toMatchObject({
      status: "observed",
      provider: observation.provider,
      sourceUrl: observation.sourceUrl,
      attemptedAt: observation.observedAt,
      failureReason: null
    })
    expect(store.committedObservations[0]).toMatchObject({
      attemptId: "attempt-1",
      attemptStatus: "observed",
      provider: observation.provider,
      sourceUrl: observation.sourceUrl,
      sourceMethod: observation.sourceMethod,
      observedAt: observation.observedAt,
      raceId: observation.raceId,
      sessionScope: observation.sessionScope,
      grandstandId: observation.grandstandId,
      zone: observation.zone,
      ticketClass: observation.ticketClass,
      quantity: observation.quantity,
      currency: observation.currency,
      basePriceMinor: observation.basePriceMinor,
      mandatoryFeesMinor: observation.mandatoryFeesMinor,
      allInTotalMinor: observation.allInTotalMinor,
      availability: observation.availability,
      fulfilmentRestrictions: observation.fulfilmentRestrictions,
      refundTermsSummary: observation.refundTermsSummary,
      authorisationTier: observation.authorisationTier,
      confidence: observation.confidence
    })
  })

  it("persists a failed attempt without writing or mutating an observation", async () => {
    const { persistObservationAttempt, getLatestSuccessfulObservation } =
      await loadPersistence()
    const store = createMemoryStore()
    const observation = parseObservation()

    await persistObservationAttempt({ status: "observed", observation }, store)
    const failed: ObservationAttempt = {
      status: "failed",
      provider: observation.provider,
      sourceUrl: observation.sourceUrl,
      attemptedAt: new Date("2026-08-28T13:00:00.000Z"),
      failureReason: "network"
    }
    const result = await persistObservationAttempt(failed, store)

    expect(result).toEqual({
      attemptId: "attempt-2",
      observationId: null
    })
    expect(store.committedAttempts).toHaveLength(2)
    expect(store.committedAttempts[1]).toMatchObject({
      status: "failed",
      provider: observation.provider,
      sourceUrl: observation.sourceUrl,
      attemptedAt: failed.attemptedAt,
      failureReason: "network"
    })
    expect(store.committedObservations).toHaveLength(1)
    expect(store.committedObservations[0]).toMatchObject({
      attemptId: "attempt-1",
      basePriceMinor: 45000
    })

    const latest = await getLatestSuccessfulObservation(
      latestIdentity(observation),
      store
    )
    expect(latest).toEqual(observation)
  })

  it("rolls back the attempt when the observation insert fails", async () => {
    const { persistObservationAttempt } = await loadPersistence()
    const store = createMemoryStore()
    store.failNextObservation = true

    await expect(
      persistObservationAttempt(
        { status: "observed", observation: parseObservation() },
        store
      )
    ).rejects.toThrow("observation insert failed")

    expect(store.transactionCalls).toBe(1)
    expect(store.committedAttempts).toEqual([])
    expect(store.committedObservations).toEqual([])
  })

  it("derives latest-known-good from immutable successful rows by source-offer identity (provider + source URL + comparable offer dimensions)", async () => {
    const { persistObservationAttempt, getLatestSuccessfulObservation } =
      await loadPersistence()
    const store = createMemoryStore()
    const first = parseObservation({
      observedAt: "2026-08-28T12:00:00.000Z",
      basePriceMinor: 45000,
      mandatoryFeesMinor: 5000,
      allInTotalMinor: 50000
    })
    const second = parseObservation({
      observedAt: "2026-08-28T18:00:00.000Z",
      basePriceMinor: 40000,
      mandatoryFeesMinor: 5000,
      allInTotalMinor: 45000
    })
    const otherQuantity = parseObservation({
      quantity: 1,
      observedAt: "2026-08-28T19:00:00.000Z",
      basePriceMinor: 1,
      mandatoryFeesMinor: 1,
      allInTotalMinor: 2
    })

    await persistObservationAttempt(
      { status: "observed", observation: first },
      store
    )
    await persistObservationAttempt(
      { status: "observed", observation: second },
      store
    )
    await persistObservationAttempt(
      { status: "observed", observation: otherQuantity },
      store
    )
    await persistObservationAttempt(
      {
        status: "failed",
        provider: first.provider,
        sourceUrl: first.sourceUrl,
        attemptedAt: new Date("2026-08-28T20:00:00.000Z"),
        failureReason: "rate_limited"
      },
      store
    )

    expect(store.committedObservations).toHaveLength(3)
    expect(store.committedAttempts).toHaveLength(4)

    const latest = await getLatestSuccessfulObservation(
      latestIdentity(first),
      store
    )
    expect(latest).toEqual(second)
    expect(latest).not.toEqual(first)

    const other = await getLatestSuccessfulObservation(
      latestIdentity(otherQuantity),
      store
    )
    expect(other).toEqual(otherQuantity)

    const missing = await getLatestSuccessfulObservation(
      { ...latestIdentity(first), provider: "sportsbreaks" },
      store
    )
    expect(missing).toBeNull()
  })

  it("orders the real latest-success query deterministically (observed_at, created_at, id)", () => {
    // Source-contract evidence for the live query; the tie behaviour itself
    // is covered through the injected memory store below.
    const source = read(PERSISTENCE_PATH)
    const orderByIndex = source.indexOf(".orderBy(")
    expect(orderByIndex).toBeGreaterThan(-1)
    const orderBy = source.slice(
      orderByIndex,
      source.indexOf(".limit(1)", orderByIndex)
    )
    const observedIdx = orderBy.indexOf(
      "desc(ticketPriceObservationsTable.observedAt)"
    )
    const createdIdx = orderBy.indexOf(
      "desc(ticketPriceObservationsTable.createdAt)"
    )
    const idIdx = orderBy.indexOf("desc(ticketPriceObservationsTable.id)")
    expect(observedIdx).toBeGreaterThan(-1)
    expect(createdIdx).toBeGreaterThan(observedIdx)
    expect(idIdx).toBeGreaterThan(createdIdx)
  })

  it("breaks observed_at ties deterministically by created_at then id", async () => {
    const { getLatestSuccessfulObservation } = await loadPersistence()
    const store = createMemoryStore()
    const observedAt = "2026-08-28T12:00:00.000Z"
    const row = (
      id: string,
      createdAt: string,
      basePriceMinor: number
    ): Record<string, unknown> => ({
      id,
      createdAt: new Date(createdAt),
      ...parseObservation({
        observedAt,
        basePriceMinor,
        mandatoryFeesMinor: 5000,
        allInTotalMinor: basePriceMinor + 5000
      })
    })
    const identity = latestIdentity(parseObservation({ observedAt }))

    // Same observed_at: later created_at wins regardless of insertion order.
    const olderCreated = row("obs-9", "2026-08-28T12:00:01.000Z", 45000)
    const newerCreated = row("obs-10", "2026-08-28T12:00:02.000Z", 40000)
    store.committedObservations.push(newerCreated, olderCreated)
    expect(await getLatestSuccessfulObservation(identity, store)).toEqual(
      parseObservation({
        observedAt,
        basePriceMinor: 40000,
        mandatoryFeesMinor: 5000,
        allInTotalMinor: 45000
      })
    )

    // Same observed_at and created_at: higher id wins.
    const higherId = row("obs-11", "2026-08-28T12:00:02.000Z", 30000)
    store.committedObservations.push(higherId)
    expect(await getLatestSuccessfulObservation(identity, store)).toEqual(
      parseObservation({
        observedAt,
        basePriceMinor: 30000,
        mandatoryFeesMinor: 5000,
        allInTotalMinor: 35000
      })
    )
  })

  it("isolates null from non-null grandstand/zone, and the real query uses IS NULL", async () => {
    // Source-contract evidence: the live query must use IS NULL predicates
    // for nullable identity dimensions (never eq(..., null)).
    const source = read(PERSISTENCE_PATH)
    expect(source).toContain(
      "isNull(ticketPriceObservationsTable.grandstandId)"
    )
    expect(source).toContain("isNull(ticketPriceObservationsTable.zone)")

    const { persistObservationAttempt, getLatestSuccessfulObservation } =
      await loadPersistence()
    const store = createMemoryStore()
    const bothNull = parseObservation({
      grandstandId: null,
      zone: null,
      observedAt: "2026-08-28T12:00:00.000Z",
      basePriceMinor: 45000,
      mandatoryFeesMinor: 5000,
      allInTotalMinor: 50000
    })
    const bothNamed = parseObservation({
      observedAt: "2026-08-28T13:00:00.000Z",
      basePriceMinor: 40000,
      mandatoryFeesMinor: 5000,
      allInTotalMinor: 45000
    })
    const mixed = parseObservation({
      grandstandId: "tifosi",
      zone: null,
      observedAt: "2026-08-28T14:00:00.000Z",
      basePriceMinor: 30000,
      mandatoryFeesMinor: 5000,
      allInTotalMinor: 35000
    })

    for (const observation of [bothNull, bothNamed, mixed]) {
      await persistObservationAttempt(
        { status: "observed", observation },
        store
      )
    }

    // Despite later observed_at values on the other rows, each null/non-null
    // combination is its own identity and must not cross-match.
    expect(
      await getLatestSuccessfulObservation(latestIdentity(bothNull), store)
    ).toEqual(bothNull)
    expect(
      await getLatestSuccessfulObservation(latestIdentity(bothNamed), store)
    ).toEqual(bothNamed)
    expect(
      await getLatestSuccessfulObservation(latestIdentity(mixed), store)
    ).toEqual(mixed)
  })

  it("rejects failed attempts with empty, whitespace-only, or padded providers", async () => {
    const { persistObservationAttempt } = await loadPersistence()
    const store = createMemoryStore()

    for (const provider of ["", "   ", " p1-travel", "p1-travel "]) {
      await expect(
        persistObservationAttempt(
          {
            status: "failed",
            provider,
            sourceUrl: "https://www.p1travel.com/f1/monza",
            attemptedAt: new Date("2026-08-28T13:00:00.000Z"),
            failureReason: "network"
          },
          store
        )
      ).rejects.toThrow()
    }

    expect(store.transactionCalls).toBe(0)
    expect(store.committedAttempts).toEqual([])
    expect(store.committedObservations).toEqual([])

    const accepted = await persistObservationAttempt(
      {
        status: "failed",
        provider: "p1-travel",
        sourceUrl: "https://www.p1travel.com/f1/monza",
        attemptedAt: new Date("2026-08-28T13:00:00.000Z"),
        failureReason: "network"
      },
      store
    )
    expect(accepted).toEqual({ attemptId: "attempt-1", observationId: null })
  })
})
