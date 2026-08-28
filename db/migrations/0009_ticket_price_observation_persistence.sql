|-- Immutable ticket price observation persistence (provider-neutral).
|-- Attempts and successful observations are append-only: UPDATE and DELETE are
|-- rejected by trigger. Latest-known-good is derived from immutable successful
|-- rows by source-offer identity (provider + source URL + the comparable offer
|-- dimensions); no mutable latest state is stored. Additive and idempotent.
|-- Preserve existing rows. No drops, resets, or backfills. Reversible only via
|-- a future additive inverse migration.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'ticket_price_observation_attempt_status'
  ) THEN
    CREATE TYPE "ticket_price_observation_attempt_status" AS ENUM (
      'observed',
      'failed'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'ticket_price_observation_failure_reason'
  ) THEN
    CREATE TYPE "ticket_price_observation_failure_reason" AS ENUM (
      'auth',
      'rate_limited',
      'unavailable',
      'invalid_payload',
      'network',
      'unknown'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'ticket_price_source_method'
  ) THEN
    CREATE TYPE "ticket_price_source_method" AS ENUM (
      'api',
      'feed',
      'official_page',
      'authenticated_portal'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'ticket_price_session_scope'
  ) THEN
    CREATE TYPE "ticket_price_session_scope" AS ENUM (
      'race_day',
      'saturday',
      'weekend',
      'multi_day',
      'hospitality'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'ticket_price_availability'
  ) THEN
    CREATE TYPE "ticket_price_availability" AS ENUM (
      'available',
      'low_stock',
      'sold_out',
      'unknown'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'ticket_price_authorisation_tier'
  ) THEN
    CREATE TYPE "ticket_price_authorisation_tier" AS ENUM (
      'official',
      'authorised_reseller',
      'bonded_package_operator',
      'unverified_secondary'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'ticket_price_confidence'
  ) THEN
    CREATE TYPE "ticket_price_confidence" AS ENUM (
      'high',
      'medium',
      'low'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ticket_price_observation_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "status" "ticket_price_observation_attempt_status" NOT NULL,
  "provider" text NOT NULL,
  "source_url" text NOT NULL,
  "attempted_at" timestamptz NOT NULL,
  "failure_reason" "ticket_price_observation_failure_reason",
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "ticket_price_observation_attempts_id_status_unique"
    UNIQUE ("id", "status"),
  CONSTRAINT "ticket_price_observation_attempts_status_failure_consistency" CHECK (
    ("status" = 'observed' AND "failure_reason" IS NULL)
    OR ("status" = 'failed' AND "failure_reason" IS NOT NULL)
  ),
  CONSTRAINT "ticket_price_observation_attempts_source_url_https" CHECK (
    starts_with("source_url", 'https://')
  )
);

CREATE TABLE IF NOT EXISTS "ticket_price_observations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "attempt_id" uuid NOT NULL,
  "attempt_status" "ticket_price_observation_attempt_status" NOT NULL DEFAULT 'observed',
  "provider" text NOT NULL,
  "source_url" text NOT NULL,
  "source_method" "ticket_price_source_method" NOT NULL,
  "observed_at" timestamptz NOT NULL,
  "race_id" text NOT NULL,
  "session_scope" "ticket_price_session_scope" NOT NULL,
  "grandstand_id" text,
  "zone" text,
  "ticket_class" text NOT NULL,
  "quantity" bigint NOT NULL,
  "currency" text NOT NULL,
  "base_price_minor" bigint NOT NULL,
  "mandatory_fees_minor" bigint,
  "all_in_total_minor" bigint,
  "availability" "ticket_price_availability" NOT NULL,
  "fulfilment_restrictions" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "refund_terms_summary" text,
  "authorisation_tier" "ticket_price_authorisation_tier" NOT NULL,
  "confidence" "ticket_price_confidence" NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "ticket_price_observations_attempt_id_unique"
    UNIQUE ("attempt_id"),
  CONSTRAINT "ticket_price_observations_attempt_fk"
    FOREIGN KEY ("attempt_id", "attempt_status")
    REFERENCES "ticket_price_observation_attempts" ("id", "status"),
  CONSTRAINT "ticket_price_observations_attempt_status_observed" CHECK (
    "attempt_status" = 'observed'
  ),
  CONSTRAINT "ticket_price_observations_source_url_https" CHECK (
    starts_with("source_url", 'https://')
  ),
  CONSTRAINT "ticket_price_observations_currency_format" CHECK (
    "currency" ~ '^[A-Z]{3}$'
  ),
  CONSTRAINT "ticket_price_observations_quantity_positive" CHECK (
    "quantity" > 0 AND "quantity" <= 9007199254740991
  ),
  CONSTRAINT "ticket_price_observations_base_price_minor_range" CHECK (
    "base_price_minor" >= 0 AND "base_price_minor" <= 9007199254740991
  ),
  CONSTRAINT "ticket_price_observations_mandatory_fees_minor_range" CHECK (
    "mandatory_fees_minor" IS NULL
    OR ("mandatory_fees_minor" >= 0 AND "mandatory_fees_minor" <= 9007199254740991)
  ),
  CONSTRAINT "ticket_price_observations_all_in_total_minor_range" CHECK (
    "all_in_total_minor" IS NULL
    OR ("all_in_total_minor" >= 0 AND "all_in_total_minor" <= 9007199254740991)
  ),
  -- Both null, or both non-null with total = base + fees. The explicit
  -- IS NOT NULL arm is required: without it a mixed-null row (fees set,
  -- total null, or vice versa) makes the comparison UNKNOWN and PostgreSQL
  -- CHECK constraints admit UNKNOWN.
  CONSTRAINT "ticket_price_observations_all_in_total_consistency" CHECK (
    ("mandatory_fees_minor" IS NULL AND "all_in_total_minor" IS NULL)
    OR (
      "mandatory_fees_minor" IS NOT NULL
      AND "all_in_total_minor" IS NOT NULL
      AND "all_in_total_minor" = "base_price_minor" + "mandatory_fees_minor"
    )
  )
);

CREATE INDEX IF NOT EXISTS "ticket_price_observations_identity_observed_idx"
  ON "ticket_price_observations" (
    "provider",
    "source_url",
    "race_id",
    "session_scope",
    "grandstand_id",
    "zone",
    "ticket_class",
    "quantity",
    "observed_at"
  );

CREATE OR REPLACE FUNCTION "reject_append_only_mutation"()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
BEGIN
  RAISE EXCEPTION 'append-only relation: UPDATE and DELETE are rejected';
END;
$fn$;

CREATE OR REPLACE TRIGGER "ticket_price_observation_attempts_append_only"
BEFORE UPDATE OR DELETE ON "ticket_price_observation_attempts"
FOR EACH ROW EXECUTE FUNCTION "reject_append_only_mutation"();

CREATE OR REPLACE TRIGGER "ticket_price_observations_append_only"
BEFORE UPDATE OR DELETE ON "ticket_price_observations"
FOR EACH ROW EXECUTE FUNCTION "reject_append_only_mutation"();
