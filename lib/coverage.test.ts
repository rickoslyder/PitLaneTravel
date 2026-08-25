import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { getTableConfig } from "drizzle-orm/pg-core"
import {
  COVERAGE_EVIDENCE_KINDS,
  COVERAGE_KIND_ATTRIBUTE_FLAGS,
  COVERAGE_KIND_DIAGNOSTIC_PRECEDENCE,
  deriveCoverage,
  type CoverageEvidenceKind,
  type CoverageKindDiagnostic
} from "./coverage"

const ROOT = process.cwd()
const SCHEMA_PATH = path.join(ROOT, "db/schema/coverage-schema.ts")
const INDEX_PATH = path.join(ROOT, "db/schema/index.ts")
const MIGRATION_PATH = path.join(ROOT, "db/migrations/0008_coverage.sql")

const EVIDENCE_KINDS = [
  "calendar",
  "logistics",
  "decision_guide",
  "live_offer",
  "personalized_plan"
] as const

const REVIEW_STATES = ["pending", "verified", "rejected"] as const

const TABLE = "coverage_evidence"
const KIND_ENUM = "coverage_evidence_kind"
const REVIEW_ENUM = "coverage_review_state"

const COLUMNS = [
  "id",
  "race_id",
  "kind",
  "source_url",
  "source_label",
  "attributes",
  "verified_at",
  "expires_at",
  "review_state",
  "revoked_at",
  "created_at",
  "updated_at"
] as const

const EXPIRES_CHECK = "coverage_evidence_expires_after_verified"
const SOURCE_URL_CHECK = "coverage_evidence_source_url_http"
const RACE_KIND_REVIEW_INDEX = "coverage_evidence_race_kind_review_idx"
const EXPIRES_INDEX = "coverage_evidence_expires_at_idx"

const FORBIDDEN_TIER_FIELDS = ["tier", "coverage_level", "coverageLevel"] as const

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

function sqlChunksToText(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) return value.map(item => sqlChunksToText(item)).join("")
  if (typeof value === "object") {
    const obj = value as {
      queryChunks?: unknown[]
      value?: unknown
      name?: unknown
    }
    if (Array.isArray(obj.queryChunks)) {
      return obj.queryChunks.map(item => sqlChunksToText(item)).join("")
    }
    if (Array.isArray(obj.value) && obj.value.every(item => typeof item === "string")) {
      return obj.value.join("")
    }
    if (typeof obj.name === "string") return `"${obj.name}"`
    if (typeof obj.value === "string") return obj.value
  }
  return ""
}

function normalizeExpr(expr: string): string {
  return expr
    .replace(/"/g, "")
    .replace(/\s+/g, " ")
    .replace(/::jsonb/gi, "")
    .trim()
    .toLowerCase()
}

function extractEnumValues(sql: string, enumName: string): string[] {
  const match = stripSqlComments(sql).match(
    new RegExp(
      `CREATE TYPE\\s+"${enumName}"\\s+AS ENUM\\s*\\(([^)]*)\\)`,
      "i"
    )
  )
  if (!match?.[1]) return []
  return [...match[1].matchAll(/'([^']+)'/g)].map(item => item[1])
}

function extractCreateTable(sql: string): string {
  const body = stripSqlComments(sql)
  const start = body.search(
    new RegExp(`CREATE TABLE IF NOT EXISTS\\s+"${TABLE}"\\s*\\(`, "i")
  )
  expect(start, `CREATE TABLE IF NOT EXISTS "${TABLE}"`).toBeGreaterThan(-1)
  let depth = 0
  for (let i = start; i < body.length; i += 1) {
    if (body[i] === "(") depth += 1
    if (body[i] === ")") {
      depth -= 1
      if (depth === 0) return body.slice(start, i + 1)
    }
  }
  throw new Error(`unterminated CREATE TABLE "${TABLE}"`)
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

function extractTableColumns(sql: string): string[] {
  const create = extractCreateTable(sql)
  const inner = create.slice(create.indexOf("(") + 1, create.lastIndexOf(")"))
  return splitComma(inner)
    .filter(line => !/^(CONSTRAINT|CHECK|PRIMARY KEY|UNIQUE|FOREIGN KEY)\b/i.test(line))
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

function extractIndexes(sql: string): Record<string, string[]> {
  const indexes: Record<string, string[]> = {}
  const re =
    /CREATE INDEX IF NOT EXISTS\s+"([^"]+)"\s+ON\s+"coverage_evidence"\s*\(([^)]*)\)/gi
  for (const match of stripSqlComments(sql).matchAll(re)) {
    indexes[match[1]] = [...match[2].matchAll(/"([^"]+)"/g)].map(item => item[1])
  }
  return indexes
}

function hasCatalogTypeGuard(sql: string, typeName: string): boolean {
  const collapsed = collapse(sql)
  return (
    collapsed.includes(`typname = '${typeName}'`) &&
    new RegExp(`CREATE TYPE\\s+"${typeName}"\\s+AS ENUM`, "i").test(collapsed)
  )
}

async function loadCoverageSchema() {
  expect(existsSync(SCHEMA_PATH)).toBe(true)
  return import("@/db/schema/coverage-schema")
}

describe("coverage schema artifacts", () => {
  it("adds db/schema/coverage-schema.ts", () => {
    expect(existsSync(SCHEMA_PATH)).toBe(true)
  })

  it("adds db/migrations/0008_coverage.sql", () => {
    expect(existsSync(MIGRATION_PATH)).toBe(true)
  })

  it("re-exports coverage-schema from db/schema/index.ts", () => {
    expect(read(INDEX_PATH)).toMatch(
      /export \* from ["']\.\/coverage-schema["']/
    )
  })

  it("exports table and enums from the schema barrel", async () => {
    const schema = await import("@/db/schema")
    expect(schema).toHaveProperty("coverageEvidenceTable")
    expect(schema).toHaveProperty("coverageEvidenceKindEnum")
    expect(schema).toHaveProperty("coverageReviewStateEnum")
  })
})

describe("coverage drizzle schema contract", () => {
  it("declares exact enums, columns, checks, indexes, and race FK without a stored tier", async () => {
    const mod = await loadCoverageSchema()
    expect(mod.coverageEvidenceKindEnum.enumName).toBe(KIND_ENUM)
    expect([...mod.coverageEvidenceKindEnum.enumValues]).toEqual([...EVIDENCE_KINDS])
    expect(mod.coverageReviewStateEnum.enumName).toBe(REVIEW_ENUM)
    expect([...mod.coverageReviewStateEnum.enumValues]).toEqual([...REVIEW_STATES])

    const config = getTableConfig(mod.coverageEvidenceTable)
    expect(config.name).toBe(TABLE)

    const columns = Object.fromEntries(
      config.columns.map(column => [column.name, column])
    )
    expect(Object.keys(columns).sort()).toEqual([...COLUMNS].sort())

    expect(columns.id.primary).toBe(true)
    expect(columns.id.columnType).toBe("PgUUID")
    expect(columns.id.hasDefault).toBe(true)
    expect(sqlChunksToText(columns.id.default as { queryChunks?: unknown[] })).toMatch(
      /gen_random_uuid\(\)/
    )

    expect(columns.race_id.notNull).toBe(true)
    expect(columns.race_id.columnType).toBe("PgUUID")
    expect(columns.kind.notNull).toBe(true)
    expect(columns.kind.getSQLType()).toBe(KIND_ENUM)
    expect(columns.source_url.notNull).toBe(true)
    expect(columns.source_label.notNull).toBe(true)
    expect(columns.attributes.notNull).toBe(true)
    expect(columns.attributes.getSQLType()).toBe("jsonb")
    expect(normalizeExpr(sqlChunksToText(columns.attributes.default as { queryChunks?: unknown[] }))).toContain(
      "{}"
    )

    for (const name of [
      "verified_at",
      "expires_at",
      "revoked_at",
      "created_at",
      "updated_at"
    ] as const) {
      expect(columns[name].getSQLType()).toBe("timestamp with time zone")
    }

    expect(columns.verified_at.notNull).toBe(true)
    expect(columns.expires_at.notNull).toBe(true)
    expect(columns.revoked_at.notNull).toBe(false)
    expect(columns.review_state.notNull).toBe(true)
    expect(columns.review_state.getSQLType()).toBe(REVIEW_ENUM)
    expect(columns.review_state.hasDefault).toBe(true)
    expect(columns.review_state.default).toBe("pending")
    expect(columns.created_at.hasDefault).toBe(true)
    expect(columns.updated_at.hasDefault).toBe(true)

    for (const field of FORBIDDEN_TIER_FIELDS) {
      expect(columns).not.toHaveProperty(field)
    }

    expect(config.uniqueConstraints).toEqual([])

    const fks = config.foreignKeys.map(fk => {
      const ref = fk.reference()
      return {
        columns: ref.columns.map(column => column.name),
        foreignTable: getTableConfig(ref.foreignTable).name,
        foreignColumns: ref.foreignColumns.map(column => column.name),
        onDelete: fk.onDelete
      }
    })
    expect(fks).toEqual([
      {
        columns: ["race_id"],
        foreignTable: "races",
        foreignColumns: ["id"],
        onDelete: "cascade"
      }
    ])

    const checks = Object.fromEntries(
      config.checks.map(check => [check.name, normalizeExpr(sqlChunksToText(check.value))])
    )
    expect(Object.keys(checks).sort()).toEqual(
      [EXPIRES_CHECK, SOURCE_URL_CHECK].sort()
    )
    expect(checks[EXPIRES_CHECK]).toBe("expires_at > verified_at")
    expect(checks[SOURCE_URL_CHECK]).toContain("starts_with(source_url, 'https://')")
    expect(checks[SOURCE_URL_CHECK]).toContain("starts_with(source_url, 'http://')")
    expect(checks[SOURCE_URL_CHECK]).not.toMatch(/ilike|lower\(|upper\(/)

    const indexes = Object.fromEntries(
      config.indexes.map(index => [
        index.config.name,
        index.config.columns.map(column => {
          if (column && typeof column === "object" && "name" in column) {
            return String((column as { name: string }).name)
          }
          return ""
        })
      ])
    )
    expect(indexes).toEqual({
      [RACE_KIND_REVIEW_INDEX]: ["race_id", "kind", "review_state"],
      [EXPIRES_INDEX]: ["expires_at"]
    })
    expect(config.indexes.every(index => !index.config.unique)).toBe(true)
  })
})

describe("coverage SQL migration contract", () => {
  it("is additive, idempotent, and matches the drizzle declarations", async () => {
    const sql = read(MIGRATION_PATH)
    const stripped = stripSqlComments(sql)
    const collapsed = collapse(sql)

    expect(extractEnumValues(sql, KIND_ENUM)).toEqual([...EVIDENCE_KINDS])
    expect(extractEnumValues(sql, REVIEW_ENUM)).toEqual([...REVIEW_STATES])
    expect(hasCatalogTypeGuard(sql, KIND_ENUM)).toBe(true)
    expect(hasCatalogTypeGuard(sql, REVIEW_ENUM)).toBe(true)

    expect(collapsed).toMatch(
      new RegExp(`CREATE TABLE IF NOT EXISTS "${TABLE}"`, "i")
    )
    expect(extractTableColumns(sql).sort()).toEqual([...COLUMNS].sort())
    expect(collapsed).toMatch(/"id" uuid PRIMARY KEY DEFAULT gen_random_uuid\(\)/i)
    expect(collapsed).toMatch(
      /"race_id" uuid NOT NULL REFERENCES "races"\("id"\) ON DELETE CASCADE/i
    )
    expect(collapsed).toMatch(new RegExp(`"kind" "${KIND_ENUM}" NOT NULL`))
    expect(collapsed).toMatch(/"source_url" text NOT NULL/)
    expect(collapsed).toMatch(/"source_label" text NOT NULL/)
    expect(collapsed).toMatch(/"attributes" jsonb NOT NULL DEFAULT '\{\}'::jsonb/)
    expect(collapsed).toMatch(/"verified_at" timestamptz NOT NULL/)
    expect(collapsed).toMatch(/"expires_at" timestamptz NOT NULL/)
    expect(collapsed).toMatch(
      new RegExp(`"review_state" "${REVIEW_ENUM}" NOT NULL DEFAULT 'pending'`)
    )
    expect(collapsed).toMatch(/"revoked_at" timestamptz(?! NOT NULL)/)
    expect(collapsed).toMatch(/"created_at" timestamptz NOT NULL DEFAULT now\(\)/)
    expect(collapsed).toMatch(/"updated_at" timestamptz NOT NULL DEFAULT now\(\)/)

    const checks = extractNamedChecks(sql)
    expect(checks[EXPIRES_CHECK]).toBe("expires_at > verified_at")
    expect(checks[SOURCE_URL_CHECK]).toContain("starts_with(source_url, 'https://')")
    expect(checks[SOURCE_URL_CHECK]).toContain("starts_with(source_url, 'http://')")
    expect(checks[SOURCE_URL_CHECK]).not.toMatch(/ilike|lower\(|upper\(/)

    const indexes = extractIndexes(sql)
    expect(indexes).toEqual({
      [RACE_KIND_REVIEW_INDEX]: ["race_id", "kind", "review_state"],
      [EXPIRES_INDEX]: ["expires_at"]
    })

    expect(stripped).not.toMatch(/UNIQUE\s*\(\s*"race_id"\s*,\s*"kind"/i)
    for (const field of ["tier", "coverage_level"]) {
      expect(stripped).not.toMatch(new RegExp(`\\b${field}\\b`, "i"))
    }

    const scanned = stripped.replace(/ON DELETE CASCADE/gi, "")
    expect(scanned).not.toMatch(/\bDROP\b/i)
    expect(scanned).not.toMatch(/\bTRUNCATE\b/i)
    expect(scanned).not.toMatch(/\bDELETE\b/i)
    expect(scanned).not.toMatch(/\bUPDATE\b/i)
    expect(scanned).not.toMatch(/\bGRANT\b/i)
    expect(scanned).not.toMatch(/\bINSERT\b/i)
    expect(scanned).not.toMatch(/WHEN\s+OTHERS/i)
    expect(scanned).not.toMatch(/DROP\s+COLUMN/i)
    expect(scanned).not.toMatch(/ALTER\s+COLUMN/i)
    expect(scanned).not.toMatch(/DISABLE\s+TRIGGER/i)

    const mod = await loadCoverageSchema()
    const config = getTableConfig(mod.coverageEvidenceTable)
    expect([...mod.coverageEvidenceKindEnum.enumValues]).toEqual(
      extractEnumValues(sql, KIND_ENUM)
    )
    expect([...mod.coverageReviewStateEnum.enumValues]).toEqual(
      extractEnumValues(sql, REVIEW_ENUM)
    )
    expect(config.columns.map(column => column.name).sort()).toEqual(
      extractTableColumns(sql).sort()
    )
    expect(
      Object.fromEntries(
        config.checks.map(check => [
          check.name,
          normalizeExpr(sqlChunksToText(check.value))
        ])
      )
    ).toEqual(extractNamedChecks(sql))
    expect(
      Object.fromEntries(
        config.indexes.map(index => [
          index.config.name,
          index.config.columns.map(column =>
            column && typeof column === "object" && "name" in column
              ? String((column as { name: string }).name)
              : ""
          )
        ])
      )
    ).toEqual(extractIndexes(sql))
  })
})

const AS_OF = new Date("2026-08-25T12:00:00.000Z")
const VERIFIED_AT = new Date("2026-08-01T00:00:00.000Z")
const EXPIRES_AT = new Date("2026-09-01T00:00:00.000Z")
const OFFER_EXPIRES_AT = new Date("2026-08-26T00:00:00.000Z")

const KIND_FLAGS: Record<CoverageEvidenceKind, Record<string, true>> = {
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
}

type EvidenceOverrides = {
  kind?: unknown
  reviewState?: unknown
  revokedAt?: unknown
  verifiedAt?: unknown
  expiresAt?: unknown
  sourceLabel?: unknown
  sourceUrl?: unknown
  attributes?: unknown
  tier?: unknown
}

function evidence(
  kind: CoverageEvidenceKind,
  overrides: EvidenceOverrides = {}
) {
  return {
    kind,
    reviewState: "verified",
    revokedAt: null,
    verifiedAt: VERIFIED_AT,
    expiresAt: EXPIRES_AT,
    sourceLabel: `${kind} source`,
    sourceUrl: `https://example.com/${kind}`,
    attributes: { ...KIND_FLAGS[kind] },
    ...overrides
  }
}

function chain(
  kinds: readonly CoverageEvidenceKind[],
  overrides: Partial<Record<CoverageEvidenceKind, EvidenceOverrides>> = {}
) {
  return kinds.map(kind => evidence(kind, overrides[kind]))
}

function allKinds(
  state: CoverageKindDiagnostic
): Record<CoverageEvidenceKind, CoverageKindDiagnostic> {
  return {
    calendar: state,
    logistics: state,
    decision_guide: state,
    live_offer: state,
    personalized_plan: state
  }
}

describe("coverage derivation contract", () => {
  it("exports the closed kind, attribute, and diagnostic unions", () => {
    expect([...COVERAGE_EVIDENCE_KINDS]).toEqual([...EVIDENCE_KINDS])
    expect(COVERAGE_KIND_ATTRIBUTE_FLAGS).toEqual(KIND_FLAGS)
    expect([...COVERAGE_KIND_DIAGNOSTIC_PRECEDENCE]).toEqual([
      "current",
      "expired",
      "not_yet_valid",
      "unverified",
      "revoked",
      "incomplete",
      "missing"
    ])
  })

  it("returns null when calendar evidence is absent", () => {
    const result = deriveCoverage([], AS_OF)
    expect(result.tier).toBeNull()
    expect(result.kinds).toEqual(allKinds("missing"))
    expect(result.firstLimitingKind).toBe("calendar")
    expect(result.freshUntil).toBeNull()
  })

  it("returns Tier 0 from current calendar only", () => {
    const result = deriveCoverage(chain(["calendar"]), AS_OF)
    expect(result.tier).toBe(0)
    expect(result.kinds).toEqual({
      ...allKinds("missing"),
      calendar: "current"
    })
    expect(result.firstLimitingKind).toBe("logistics")
    expect(result.freshUntil).toEqual(EXPIRES_AT)
  })

  it("returns Tier 4 when all five kinds are current", () => {
    const result = deriveCoverage(chain([...COVERAGE_EVIDENCE_KINDS]), AS_OF)
    expect(result.tier).toBe(4)
    expect(result.kinds).toEqual(allKinds("current"))
    expect(result.firstLimitingKind).toBeNull()
    expect(result.freshUntil).toEqual(EXPIRES_AT)
  })

  it("cannot claim Tier 3 when live_offer is absent", () => {
    const result = deriveCoverage(
      chain(["calendar", "logistics", "decision_guide"]),
      AS_OF
    )
    expect(result.tier).toBe(2)
    expect(result.kinds.live_offer).toBe("missing")
    expect(result.firstLimitingKind).toBe("live_offer")
  })

  it("cannot claim Tier 3 when live_offer attributes are incomplete", () => {
    const result = deriveCoverage(
      [
        ...chain(["calendar", "logistics", "decision_guide"]),
        evidence("live_offer", {
          attributes: {
            inventoryAvailable: true,
            taggedLink: true
          }
        })
      ],
      AS_OF
    )
    expect(result.tier).toBe(2)
    expect(result.kinds.live_offer).toBe("incomplete")
    expect(result.firstLimitingKind).toBe("live_offer")
  })

  it("cannot claim Tier 3 when live_offer is unattributed", () => {
    const untagged = deriveCoverage(
      [
        ...chain(["calendar", "logistics", "decision_guide"]),
        evidence("live_offer", {
          attributes: { ...KIND_FLAGS.live_offer, taggedLink: false }
        })
      ],
      AS_OF
    )
    const unconfigured = deriveCoverage(
      [
        ...chain(["calendar", "logistics", "decision_guide"]),
        evidence("live_offer", {
          attributes: {
            ...KIND_FLAGS.live_offer,
            attributionConfigured: false
          }
        })
      ],
      AS_OF
    )
    expect(untagged.tier).toBe(2)
    expect(untagged.kinds.live_offer).toBe("incomplete")
    expect(unconfigured.tier).toBe(2)
    expect(unconfigured.kinds.live_offer).toBe("incomplete")
  })

  it("cannot claim Tier 3 when live_offer has no inventory", () => {
    const result = deriveCoverage(
      [
        ...chain(["calendar", "logistics", "decision_guide"]),
        evidence("live_offer", {
          attributes: { ...KIND_FLAGS.live_offer, inventoryAvailable: false }
        })
      ],
      AS_OF
    )
    expect(result.tier).toBe(2)
    expect(result.kinds.live_offer).toBe("incomplete")
    expect(result.firstLimitingKind).toBe("live_offer")
  })

  it("returns Tier 3 when live_offer is current", () => {
    const result = deriveCoverage(
      chain(["calendar", "logistics", "decision_guide", "live_offer"]),
      AS_OF
    )
    expect(result.tier).toBe(3)
    expect(result.kinds.live_offer).toBe("current")
    expect(result.firstLimitingKind).toBe("personalized_plan")
  })

  it("drops Tier 3 to Tier 2 automatically at live_offer expiry", () => {
    const records = [
      ...chain(["calendar", "logistics", "decision_guide"]),
      evidence("live_offer", { expiresAt: OFFER_EXPIRES_AT })
    ]
    const justBefore = deriveCoverage(
      records,
      new Date(OFFER_EXPIRES_AT.getTime() - 1)
    )
    const exactlyAt = deriveCoverage(records, OFFER_EXPIRES_AT)

    expect(justBefore.tier).toBe(3)
    expect(justBefore.kinds.live_offer).toBe("current")
    expect(justBefore.freshUntil).toEqual(OFFER_EXPIRES_AT)

    expect(exactlyAt.tier).toBe(2)
    expect(exactlyAt.kinds.live_offer).toBe("expired")
    expect(exactlyAt.firstLimitingKind).toBe("live_offer")
    expect(exactlyAt.freshUntil).toEqual(EXPIRES_AT)
  })

  it("caps otherwise-current higher evidence at Tier 0 when logistics is stale", () => {
    const result = deriveCoverage(
      [
        evidence("calendar"),
        evidence("logistics", { expiresAt: new Date("2026-08-20T00:00:00.000Z") }),
        evidence("decision_guide"),
        evidence("live_offer"),
        evidence("personalized_plan")
      ],
      AS_OF
    )
    expect(result.tier).toBe(0)
    expect(result.kinds).toEqual({
      calendar: "current",
      logistics: "expired",
      decision_guide: "current",
      live_offer: "current",
      personalized_plan: "current"
    })
    expect(result.firstLimitingKind).toBe("logistics")
    expect(result.freshUntil).toEqual(EXPIRES_AT)
  })

  it("does not let higher-kind evidence skip a missing lower prerequisite", () => {
    const result = deriveCoverage(
      chain(["calendar", "decision_guide", "live_offer", "personalized_plan"]),
      AS_OF
    )
    expect(result.tier).toBe(0)
    expect(result.kinds.logistics).toBe("missing")
    expect(result.firstLimitingKind).toBe("logistics")
  })

  it("fails closed on future, pending, rejected, revoked, and malformed records", () => {
    const future = deriveCoverage(
      [evidence("calendar", { verifiedAt: new Date("2026-08-26T00:00:00.000Z") })],
      AS_OF
    )
    const pending = deriveCoverage(
      [evidence("calendar", { reviewState: "pending" })],
      AS_OF
    )
    const rejected = deriveCoverage(
      [evidence("calendar", { reviewState: "rejected" })],
      AS_OF
    )
    const revoked = deriveCoverage(
      [evidence("calendar", { revokedAt: new Date("2026-08-10T00:00:00.000Z") })],
      AS_OF
    )
    const malformed = deriveCoverage(
      [
        evidence("calendar", {
          sourceUrl: "not-a-url",
          sourceLabel: "   ",
          verifiedAt: new Date(Number.NaN),
          expiresAt: VERIFIED_AT,
          attributes: { officialSource: "true", datesVerified: 1, statusVerified: true }
        })
      ],
      AS_OF
    )

    expect(future).toMatchObject({
      tier: null,
      kinds: { calendar: "not_yet_valid" },
      firstLimitingKind: "calendar",
      freshUntil: null
    })
    expect(pending).toMatchObject({
      tier: null,
      kinds: { calendar: "unverified" },
      firstLimitingKind: "calendar"
    })
    expect(rejected).toMatchObject({
      tier: null,
      kinds: { calendar: "unverified" },
      firstLimitingKind: "calendar"
    })
    expect(revoked).toMatchObject({
      tier: null,
      kinds: { calendar: "revoked" },
      firstLimitingKind: "calendar"
    })
    expect(malformed).toMatchObject({
      tier: null,
      kinds: { calendar: "incomplete" },
      firstLimitingKind: "calendar"
    })
  })

  it("lets a newer qualifying duplicate rescue a kind", () => {
    const result = deriveCoverage(
      [
        evidence("calendar", {
          reviewState: "pending",
          expiresAt: new Date("2026-07-01T00:00:00.000Z"),
          sourceLabel: "stale calendar"
        }),
        evidence("calendar", {
          revokedAt: new Date("2026-08-02T00:00:00.000Z"),
          sourceLabel: "revoked calendar"
        }),
        evidence("calendar", {
          sourceLabel: "rescued calendar",
          sourceUrl: "https://fia.com/calendar",
          expiresAt: new Date("2026-10-01T00:00:00.000Z")
        })
      ],
      AS_OF
    )
    expect(result.tier).toBe(0)
    expect(result.kinds.calendar).toBe("current")
    expect(result.freshUntil).toEqual(new Date("2026-10-01T00:00:00.000Z"))
  })

  it("uses expiry-boundary, freshUntil, and first limiting kind from the contiguous chain", () => {
    const logisticsExpiry = new Date("2026-08-28T00:00:00.000Z")
    const records = [
      evidence("calendar", { expiresAt: new Date("2026-10-01T00:00:00.000Z") }),
      evidence("logistics", { expiresAt: logisticsExpiry }),
      evidence("decision_guide", { expiresAt: new Date("2026-12-01T00:00:00.000Z") })
    ]
    const current = deriveCoverage(records, AS_OF)
    expect(current.tier).toBe(2)
    expect(current.firstLimitingKind).toBe("live_offer")
    expect(current.freshUntil).toEqual(logisticsExpiry)

    const atLogisticsExpiry = deriveCoverage(records, logisticsExpiry)
    expect(atLogisticsExpiry.tier).toBe(0)
    expect(atLogisticsExpiry.kinds.logistics).toBe("expired")
    expect(atLogisticsExpiry.firstLimitingKind).toBe("logistics")
    expect(atLogisticsExpiry.freshUntil).toEqual(new Date("2026-10-01T00:00:00.000Z"))
  })

  it("does not mutate caller inputs and is order-independent", () => {
    const first = evidence("logistics")
    const second = evidence("calendar")
    const firstAttributes = first.attributes as Record<string, unknown>
    const secondAttributes = second.attributes as Record<string, unknown>
    const input = [
      Object.freeze({
        ...first,
        attributes: Object.freeze({ ...firstAttributes })
      }),
      Object.freeze({
        ...second,
        attributes: Object.freeze({ ...secondAttributes })
      })
    ]
    Object.freeze(input)
    const snapshot = JSON.stringify(input)

    const forward = deriveCoverage(input, AS_OF)
    const reverse = deriveCoverage([...input].reverse(), AS_OF)

    expect(JSON.stringify(input)).toBe(snapshot)
    expect(input.map(record => record.kind)).toEqual(["logistics", "calendar"])
    expect(forward).toEqual(reverse)
    expect(forward.tier).toBe(1)
    expect(forward.kinds).toEqual({
      ...allKinds("missing"),
      calendar: "current",
      logistics: "current"
    })
  })

  it("uses deterministic diagnostic precedence when no record is current", () => {
    const mixed = deriveCoverage(
      [
        evidence("calendar", { sourceUrl: "ftp://example.com/calendar" }),
        evidence("calendar", { revokedAt: AS_OF }),
        evidence("calendar", { reviewState: "pending" }),
        evidence("calendar", { verifiedAt: new Date("2026-08-30T00:00:00.000Z") }),
        evidence("calendar", { expiresAt: new Date("2026-08-20T00:00:00.000Z") })
      ],
      AS_OF
    )
    expect(mixed.kinds.calendar).toBe("expired")
    expect(mixed.tier).toBeNull()

    const withoutExpired = deriveCoverage(
      [
        evidence("calendar", { sourceUrl: "/relative" }),
        evidence("calendar", { revokedAt: AS_OF }),
        evidence("calendar", { reviewState: "rejected" }),
        evidence("calendar", { verifiedAt: new Date("2026-08-30T00:00:00.000Z") })
      ],
      AS_OF
    )
    expect(withoutExpired.kinds.calendar).toBe("not_yet_valid")

    const withoutFuture = deriveCoverage(
      [
        evidence("calendar", { attributes: { officialSource: true } }),
        evidence("calendar", { revokedAt: AS_OF }),
        evidence("calendar", { reviewState: "pending" })
      ],
      AS_OF
    )
    expect(withoutFuture.kinds.calendar).toBe("unverified")

    const revokedOnly = deriveCoverage(
      [
        evidence("calendar", { attributes: null }),
        evidence("calendar", { revokedAt: AS_OF })
      ],
      AS_OF
    )
    expect(revokedOnly.kinds.calendar).toBe("revoked")

    const incompleteOnly = deriveCoverage(
      [evidence("calendar", { attributes: { officialSource: true } })],
      AS_OF
    )
    expect(incompleteOnly.kinds.calendar).toBe("incomplete")
  })

  it("fails closed on malformed records and ignores an asserted tier field", () => {
    const result = deriveCoverage(
      [
        {
          kind: "calendar",
          reviewState: "verified",
          revokedAt: null,
          verifiedAt: VERIFIED_AT,
          expiresAt: EXPIRES_AT,
          sourceLabel: "asserted",
          sourceUrl: "https://example.com/calendar",
          attributes: KIND_FLAGS.calendar,
          tier: 4
        },
        {
          kind: "not-a-kind",
          reviewState: "verified",
          revokedAt: null,
          verifiedAt: VERIFIED_AT,
          expiresAt: EXPIRES_AT,
          sourceLabel: "unknown",
          sourceUrl: "https://example.com/unknown",
          attributes: {},
          tier: 3
        },
        "not-a-record",
        null,
        {
          kind: "logistics",
          reviewState: 1,
          revokedAt: "revoked",
          verifiedAt: "yesterday",
          expiresAt: "tomorrow",
          sourceLabel: 12,
          sourceUrl: 34,
          attributes: ["nope"],
          tier: 1
        }
      ],
      AS_OF
    )

    expect(result.tier).toBe(0)
    expect(result.kinds.calendar).toBe("current")
    expect(result.kinds.logistics).toBe("incomplete")
    expect(result).not.toHaveProperty("assertedTier")
    expect(result).not.toHaveProperty("override")
    expect(Object.keys(result).sort()).toEqual(
      ["firstLimitingKind", "freshUntil", "kinds", "tier"].sort()
    )
  })

  it("throws only for an invalid asOf and treats non-array evidence as empty", () => {
    expect(() => deriveCoverage([], new Date(Number.NaN))).toThrow(
      /invalid asOf/i
    )
    expect(() => deriveCoverage([], "2026-08-25T12:00:00.000Z" as never)).toThrow(
      /invalid asOf/i
    )
    expect(() => deriveCoverage([], null as never)).toThrow(/invalid asOf/i)

    expect(deriveCoverage(null as never, AS_OF)).toEqual({
      tier: null,
      kinds: allKinds("missing"),
      firstLimitingKind: "calendar",
      freshUntil: null
    })
  })

  it("fails closed on wrong-type attributes, empty source, and expiresAt <= verifiedAt", () => {
    const wrongType = deriveCoverage(
      [
        evidence("calendar", {
          attributes: {
            officialSource: true,
            datesVerified: true,
            statusVerified: "true"
          }
        })
      ],
      AS_OF
    )
    const emptySource = deriveCoverage(
      [evidence("calendar", { sourceLabel: "" })],
      AS_OF
    )
    const invertedDates = deriveCoverage(
      [
        evidence("calendar", {
          verifiedAt: EXPIRES_AT,
          expiresAt: VERIFIED_AT
        })
      ],
      AS_OF
    )
    const equalDates = deriveCoverage(
      [
        evidence("calendar", {
          verifiedAt: VERIFIED_AT,
          expiresAt: VERIFIED_AT
        })
      ],
      AS_OF
    )

    expect(wrongType.kinds.calendar).toBe("incomplete")
    expect(emptySource.kinds.calendar).toBe("incomplete")
    expect(invertedDates.kinds.calendar).toBe("incomplete")
    expect(equalDates.kinds.calendar).toBe("incomplete")
    expect(wrongType.tier).toBeNull()
  })

  it("accepts extra attribute keys and http source URLs", () => {
    const result = deriveCoverage(
      [
        evidence("calendar", {
          sourceUrl: "http://example.com/calendar",
          attributes: { ...KIND_FLAGS.calendar, extra: "ignored" }
        })
      ],
      AS_OF
    )
    expect(result.tier).toBe(0)
    expect(result.kinds.calendar).toBe("current")
  })

  it("uses the latest current expiry for a kind, then the chain minimum", () => {
    const result = deriveCoverage(
      [
        evidence("calendar", { expiresAt: new Date("2026-09-01T00:00:00.000Z") }),
        evidence("calendar", { expiresAt: new Date("2026-11-01T00:00:00.000Z") }),
        evidence("logistics", { expiresAt: new Date("2026-10-01T00:00:00.000Z") })
      ],
      AS_OF
    )
    expect(result.tier).toBe(1)
    expect(result.freshUntil).toEqual(new Date("2026-10-01T00:00:00.000Z"))
  })
})
