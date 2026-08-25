-- Additive schema parity for declared Drizzle fields used by tested public routes.
-- Journalled 0002 never added circuits.track_map_url. The legacy Supabase
-- race_history file is not part of db:migrate:all and is not executed here.
--
-- Idempotent. Preserve existing rows. No drops, resets, or backfills.
--
-- RLS: enable on race_history with a public SELECT policy only. No write
-- policies and owner bypass left intact, so the table-owner DATABASE_URL
-- role can still manage rows while non-owner roles are fail-closed for writes.
-- Compatible with plain PostgreSQL.

ALTER TABLE "circuits" ADD COLUMN IF NOT EXISTS "track_map_url" text;
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "seating_details" text;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'feature_category'
  ) THEN
    CREATE TYPE "feature_category" AS ENUM ('access', 'hospitality', 'experience');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'feature_type'
  ) THEN
    CREATE TYPE "feature_type" AS ENUM ('included', 'optional', 'upgrade');
  END IF;
END $$;

ALTER TABLE "ticket_features" ADD COLUMN IF NOT EXISTS "category" "feature_category" NOT NULL DEFAULT 'access';
ALTER TABLE "ticket_features" ADD COLUMN IF NOT EXISTS "feature_type" "feature_type" NOT NULL DEFAULT 'included';
ALTER TABLE "ticket_features" ADD COLUMN IF NOT EXISTS "icon" text;
ALTER TABLE "ticket_features" ADD COLUMN IF NOT EXISTS "display_priority" integer NOT NULL DEFAULT 0;
ALTER TABLE "ticket_features" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true;
ALTER TABLE "ticket_features" ADD COLUMN IF NOT EXISTS "created_at" timestamptz NOT NULL DEFAULT now();
ALTER TABLE "ticket_features" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz NOT NULL DEFAULT now();
ALTER TABLE "ticket_features" ADD COLUMN IF NOT EXISTS "updated_by" text;

DO $$ BEGIN
  ALTER TABLE "circuits"
    ADD CONSTRAINT "circuits_track_map_url_unique" UNIQUE ("track_map_url");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "race_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "race_id" uuid NOT NULL REFERENCES "races"("id") ON DELETE CASCADE,
  "timeline" jsonb NOT NULL,
  "record_breakers" jsonb NOT NULL,
  "memorable_moments" jsonb NOT NULL,
  "full_history" text NOT NULL,
  "meta_title" text,
  "meta_description" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "race_history_race_id_idx"
  ON "race_history" ("race_id");

ALTER TABLE "race_history" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "race_history_public_read"
    ON "race_history"
    FOR SELECT
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
