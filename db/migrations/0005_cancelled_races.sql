-- Cancelled / rescheduled races (SPEC.md). Adds a planned-vs-actual round split and a
-- cancellation reason, and makes the per-season round uniqueness ignore cancelled races
-- so a cancelled race can keep its intended slot alongside the race that actually runs
-- there. Idempotent.

ALTER TABLE "races" ADD COLUMN IF NOT EXISTS "planned_round" integer;
ALTER TABLE "races" ADD COLUMN IF NOT EXISTS "cancellation_reason" text;

-- Replace the plain unique index from 0003 with one that excludes cancelled races.
DROP INDEX IF EXISTS "races_series_season_round_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "races_series_season_round_active_idx"
  ON "races" ("series_id", "season", "round")
  WHERE "status" <> 'cancelled';
