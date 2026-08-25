import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()
const migrationsDir = path.join(root, "db/migrations")
const applyScriptPath = path.join(root, "scripts/apply-sql-migrations.ts")

function numberedSqlFiles(): string[] {
  return readdirSync(migrationsDir)
    .filter(file => file.endsWith(".sql"))
    .filter(file => Number(file.slice(0, 4)) >= 3)
    .sort()
}

describe("PLT-009 additive 0007 split-path migration", () => {
  it("adds a numbered SQL file after 0006 that apply-sql-migrations.ts will select", () => {
    const applyScript = readFileSync(applyScriptPath, "utf8")
    expect(applyScript).toMatch(/const MIN_TAG = 3/)
    expect(applyScript).toMatch(/db\/migrations/)
    expect(applyScript).toMatch(/Number\(f\.slice\(0, 4\)\) >= MIN_TAG/)

    const selected = numberedSqlFiles()
    expect(selected).toContain("0006_flight_payments.sql")
    expect(selected.some(file => file.startsWith("0007_"))).toBe(true)
    expect(selected).not.toContain("0000_initial.sql")
  })

  it("is additive and idempotent and provisions declared route fields", () => {
    const file = numberedSqlFiles().find(name => name.startsWith("0007_"))
    expect(file).toBeTruthy()
    const sql = readFileSync(path.join(migrationsDir, file!), "utf8")

    expect(sql).toMatch(
      /ALTER TABLE\s+"?circuits"?\s+ADD COLUMN IF NOT EXISTS\s+"?track_map_url"?\s+text/i
    )
    expect(sql).toMatch(
      /ALTER TABLE\s+"?tickets"?\s+ADD COLUMN IF NOT EXISTS\s+"?seating_details"?\s+text/i
    )
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS\s+"?race_history"?/i)
    expect(sql).toMatch(/"id"\s+uuid/i)
    expect(sql).toMatch(/"race_id"\s+uuid/i)
    expect(sql).toMatch(/"timeline"\s+jsonb/i)
    expect(sql).toMatch(/"record_breakers"\s+jsonb/i)
    expect(sql).toMatch(/"memorable_moments"\s+jsonb/i)
    expect(sql).toMatch(/"full_history"\s+text/i)
    expect(sql).toMatch(/timestamptz/i)
    expect(sql).toMatch(/REFERENCES\s+"?races"?\s*\(\s*"?id"?\s*\)/i)
    expect(sql).toMatch(/ON DELETE CASCADE/i)
    expect(sql).toMatch(/CREATE INDEX IF NOT EXISTS/i)
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS|CREATE TABLE IF NOT EXISTS/)

    expect(sql).not.toMatch(/\bDROP\s+(TABLE|COLUMN|DATABASE)\b/i)
    expect(sql).not.toMatch(/\bTRUNCATE\b/i)
    expect(sql).not.toMatch(/\bRESET\b/i)
    expect(sql).not.toMatch(/\bDELETE\s+FROM\b/i)
    expect(sql).not.toMatch(/\bUPDATE\s+"/i)
    expect(sql).not.toMatch(/WHEN\s+OTHERS/i)
    expect(sql).not.toMatch(/\bGRANT\b/i)
    expect(sql).not.toMatch(/\bREVOKE\b/i)
    expect(sql).not.toMatch(/0000_initial/)
    expect(sql).not.toMatch(/auth\.users/)
    expect(sql).not.toMatch(/\bTO authenticated\b/)
    expect(sql).not.toMatch(/FORCE ROW LEVEL SECURITY/i)
  })

  it("provisions declared ticket_features enums and columns additively", () => {
    const file = numberedSqlFiles().find(name => name.startsWith("0007_"))
    expect(file).toBeTruthy()
    const sql = readFileSync(path.join(migrationsDir, file!), "utf8")

    expect(sql).toMatch(
      /IF NOT EXISTS[\s\S]*typname\s*=\s*'feature_category'[\s\S]*CREATE TYPE\s+"?feature_category"?\s+AS ENUM\s*\(\s*'access'\s*,\s*'hospitality'\s*,\s*'experience'\s*\)/i
    )
    expect(sql).toMatch(
      /IF NOT EXISTS[\s\S]*typname\s*=\s*'feature_type'[\s\S]*CREATE TYPE\s+"?feature_type"?\s+AS ENUM\s*\(\s*'included'\s*,\s*'optional'\s*,\s*'upgrade'\s*\)/i
    )
    expect(sql).toMatch(
      /ALTER TABLE\s+"?ticket_features"?\s+ADD COLUMN IF NOT EXISTS\s+"?category"?\s+"?feature_category"?\s+NOT NULL DEFAULT\s+'access'/i
    )
    expect(sql).toMatch(
      /ALTER TABLE\s+"?ticket_features"?\s+ADD COLUMN IF NOT EXISTS\s+"?feature_type"?\s+"?feature_type"?\s+NOT NULL DEFAULT\s+'included'/i
    )
    expect(sql).toMatch(
      /ALTER TABLE\s+"?ticket_features"?\s+ADD COLUMN IF NOT EXISTS\s+"?icon"?\s+text/i
    )
    expect(sql).toMatch(
      /ALTER TABLE\s+"?ticket_features"?\s+ADD COLUMN IF NOT EXISTS\s+"?display_priority"?\s+integer\s+NOT NULL DEFAULT\s+0/i
    )
    expect(sql).toMatch(
      /ALTER TABLE\s+"?ticket_features"?\s+ADD COLUMN IF NOT EXISTS\s+"?is_active"?\s+boolean\s+NOT NULL DEFAULT\s+true/i
    )
    expect(sql).toMatch(
      /ALTER TABLE\s+"?ticket_features"?\s+ADD COLUMN IF NOT EXISTS\s+"?created_at"?\s+timestamptz\s+NOT NULL DEFAULT\s+(now\(\)|CURRENT_TIMESTAMP)/i
    )
    expect(sql).toMatch(
      /ALTER TABLE\s+"?ticket_features"?\s+ADD COLUMN IF NOT EXISTS\s+"?updated_at"?\s+timestamptz\s+NOT NULL DEFAULT\s+(now\(\)|CURRENT_TIMESTAMP)/i
    )
    expect(sql).toMatch(
      /ALTER TABLE\s+"?ticket_features"?\s+ADD COLUMN IF NOT EXISTS\s+"?updated_by"?\s+text/i
    )

    expect(sql).not.toMatch(
      /ALTER TABLE\s+"?ticket_features"?[\s\S]{0,400}ENABLE ROW LEVEL SECURITY/i
    )
    expect(sql).not.toMatch(
      /CREATE POLICY[\s\S]{0,200}ticket_features/i
    )
  })

  it("makes race_history RLS fail-closed on plain postgres without Supabase roles", () => {
    const file = numberedSqlFiles().find(name => name.startsWith("0007_"))
    expect(file).toBeTruthy()
    const sql = readFileSync(path.join(migrationsDir, file!), "utf8")

    expect(sql).toMatch(/ENABLE ROW LEVEL SECURITY/i)
    expect(sql).toMatch(/CREATE POLICY/i)
    expect(sql).toMatch(/FOR SELECT/i)
    expect(sql).toMatch(/USING\s*\(\s*true\s*\)/i)
    expect(sql).not.toMatch(/FOR INSERT/i)
    expect(sql).not.toMatch(/FOR UPDATE/i)
    expect(sql).not.toMatch(/FOR DELETE/i)
    expect(sql).not.toMatch(/auth\.uid/)
    expect(sql).not.toMatch(/raw_app_meta_data/)
  })
})
