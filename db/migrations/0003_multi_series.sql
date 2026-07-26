-- Multi-series foundation (SPEC.md Phase C)
-- Hand-authored: the drizzle migration journal predates schema drift, so apply this
-- directly (psql) or rely on `npm run db:push` to sync the schema. Idempotent.

-- 1. Series (top-level championships — distinct from supporting_series, which is
--    support races within a race weekend).
CREATE TABLE IF NOT EXISTS "series" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "short_name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "governing_body" text,
  "event_noun" text NOT NULL DEFAULT 'Grand Prix',
  "season_label" text,
  "logo_url" text,
  "accent_color" text,
  "description" text,
  "data_provider" text NOT NULL DEFAULT 'manual',
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- 2. Seed the five launch series.
INSERT INTO "series" (name, short_name, slug, governing_body, event_noun, season_label, accent_color, data_provider, sort_order, description) VALUES
  ('Formula 1', 'F1', 'f1', 'FIA', 'Grand Prix', 'FIA Formula One World Championship', '#e10600', 'openf1', 0, 'The pinnacle of single-seater motorsport, visiting iconic circuits across the globe.'),
  ('Formula E', 'FE', 'formula-e', 'FIA', 'E-Prix', 'FIA Formula E World Championship', '#00b1eb', 'manual', 1, 'All-electric single-seaters racing on street circuits in the heart of major cities.'),
  ('MotoGP', 'MotoGP', 'motogp', 'FIM', 'Grand Prix', 'FIM MotoGP World Championship', '#cc0000', 'manual', 2, 'The premier class of motorcycle road racing, with grand prix events worldwide.'),
  ('IndyCar', 'IndyCar', 'indycar', 'IndyCar', 'Grand Prix', 'NTT IndyCar Series', '#0033a0', 'manual', 3, 'North America''s premier open-wheel series, mixing ovals, road courses and street circuits.'),
  ('World Endurance Championship', 'WEC', 'wec', 'FIA / ACO', 'Round', 'FIA World Endurance Championship', '#00843d', 'manual', 4, 'Endurance sportscar racing, home of the 24 Hours of Le Mans and the Hypercar class.')
ON CONFLICT (slug) DO NOTHING;

-- 3. races.series_id — nullable, backfill everything to F1, then enforce NOT NULL.
ALTER TABLE "races" ADD COLUMN IF NOT EXISTS "series_id" uuid REFERENCES "series"("id") ON DELETE RESTRICT;
UPDATE "races" SET "series_id" = (SELECT id FROM "series" WHERE slug = 'f1') WHERE "series_id" IS NULL;
ALTER TABLE "races" ALTER COLUMN "series_id" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "races_series_id_idx" ON "races" ("series_id");
-- Round numbers are unique per series-season, not globally.
-- Round numbers are unique per series-season among races that actually run. Cancelled
-- races are excluded so they can keep the slot they were meant to occupy (see 0005);
-- this is created in its final partial form so a fresh database provisions correctly.
CREATE UNIQUE INDEX IF NOT EXISTS "races_series_season_round_active_idx"
  ON "races" ("series_id", "season", "round")
  WHERE "status" <> 'cancelled';

-- 4. Provider-keyed external ids (replaces provider-specific columns on core tables).
CREATE TABLE IF NOT EXISTS "race_external_ids" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "race_id" uuid NOT NULL REFERENCES "races"("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "kind" text NOT NULL DEFAULT 'event',
  "external_key" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("provider", "kind", "external_key")
);

CREATE TABLE IF NOT EXISTS "circuit_external_ids" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "circuit_id" uuid NOT NULL REFERENCES "circuits"("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "external_key" text NOT NULL,
  "external_name" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("provider", "external_key")
);

-- 5. Backfill external ids from the legacy openf1 columns (kept for one release).
INSERT INTO "race_external_ids" (race_id, provider, kind, external_key)
  SELECT id, 'openf1', 'meeting', openf1_meeting_key::text FROM "races" WHERE openf1_meeting_key IS NOT NULL
ON CONFLICT DO NOTHING;
INSERT INTO "race_external_ids" (race_id, provider, kind, external_key)
  SELECT id, 'openf1', 'session', openf1_session_key::text FROM "races" WHERE openf1_session_key IS NOT NULL
ON CONFLICT DO NOTHING;
INSERT INTO "circuit_external_ids" (circuit_id, provider, external_key, external_name)
  SELECT id, 'openf1', openf1_key::text, openf1_short_name FROM "circuits" WHERE openf1_key IS NOT NULL
ON CONFLICT DO NOTHING;

-- 6. (Deferred to a later release, after the OpenF1 mappers read external_ids:)
-- ALTER TABLE "races" DROP COLUMN "openf1_meeting_key";
-- ALTER TABLE "races" DROP COLUMN "openf1_session_key";
-- ALTER TABLE "circuits" DROP COLUMN "openf1_key";
-- ALTER TABLE "circuits" DROP COLUMN "openf1_short_name";
