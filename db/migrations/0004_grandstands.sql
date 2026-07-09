-- Grandstand guides (SPEC.md Phase D1). Idempotent.
CREATE TABLE IF NOT EXISTS "grandstands" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "circuit_id" uuid NOT NULL REFERENCES "circuits"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "view_rating" integer,
  "covered" boolean NOT NULL DEFAULT false,
  "has_big_screen" boolean NOT NULL DEFAULT false,
  "price_tier" text,
  "typical_price" numeric(10, 2),
  "price_currency" text DEFAULT 'GBP',
  "best_for" text,
  "pros" text[],
  "cons" text[],
  "views_of" text[],
  "sun_exposure" text,
  "image_url" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "grandstands_circuit_id_idx" ON "grandstands" ("circuit_id");
