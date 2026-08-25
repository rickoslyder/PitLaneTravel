-- Coverage evidence records (PLT-013). Derived tier is never stored.
-- Additive and idempotent. Preserve existing rows. No drops, resets, or backfills.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'coverage_evidence_kind'
  ) THEN
    CREATE TYPE "coverage_evidence_kind" AS ENUM (
      'calendar',
      'logistics',
      'decision_guide',
      'live_offer',
      'personalized_plan'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'coverage_review_state'
  ) THEN
    CREATE TYPE "coverage_review_state" AS ENUM (
      'pending',
      'verified',
      'rejected'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "coverage_evidence" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "race_id" uuid NOT NULL REFERENCES "races"("id") ON DELETE CASCADE,
  "kind" "coverage_evidence_kind" NOT NULL,
  "source_url" text NOT NULL,
  "source_label" text NOT NULL,
  "attributes" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "verified_at" timestamptz NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "review_state" "coverage_review_state" NOT NULL DEFAULT 'pending',
  "revoked_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "coverage_evidence_expires_after_verified" CHECK ("expires_at" > "verified_at"),
  CONSTRAINT "coverage_evidence_source_url_http" CHECK (
    (starts_with("source_url", 'https://') OR starts_with("source_url", 'http://'))
  )
);

CREATE INDEX IF NOT EXISTS "coverage_evidence_race_kind_review_idx"
  ON "coverage_evidence" ("race_id", "kind", "review_state");

CREATE INDEX IF NOT EXISTS "coverage_evidence_expires_at_idx"
  ON "coverage_evidence" ("expires_at");
