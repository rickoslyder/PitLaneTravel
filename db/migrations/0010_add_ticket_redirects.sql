-- public.ticket_redirects for fresh databases.
-- Source of truth: supabase/migrations/20250107051700_add_ticket_redirects.sql
-- and db/schema/ticket-redirects-schema.ts. The redirect route and
-- ticket-redirect actions read this table; the Supabase migration is not
-- applied by scripts/apply-sql-migrations.ts.
--
-- IF NOT EXISTS throughout: no-op where production already has the table
-- and its indexes (created 2025-01-07). No RLS, policies, or grants here.
--
-- Ordering: this filename sorts before
-- 0010_p0_rls_enable_and_revoke_stripe_fts.sql (PR 91, not merged). The
-- apply script sorts filenames, so a fresh database that contains both
-- creates the table and then enables RLS. The recorded tag is the full
-- filename, so the two 0010 files do not collide.

CREATE TABLE IF NOT EXISTS "public"."ticket_redirects" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "ticket_id" integer NOT NULL REFERENCES "public"."tickets"("id") ON DELETE CASCADE,
  "slug" text NOT NULL,
  "destination_url" text NOT NULL,
  "clicks" integer NOT NULL DEFAULT 0,
  "last_clicked_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "ticket_redirects_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ticket_redirects_slug_key" UNIQUE ("slug")
);

CREATE INDEX IF NOT EXISTS "ticket_redirects_slug_idx"
  ON "public"."ticket_redirects" ("slug");

CREATE INDEX IF NOT EXISTS "ticket_redirects_ticket_id_idx"
  ON "public"."ticket_redirects" ("ticket_id");
