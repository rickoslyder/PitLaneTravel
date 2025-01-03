-- Create enums for feature categories and types
DO $$ BEGIN
    CREATE TYPE "public"."feature_category" AS ENUM ('access', 'hospitality', 'experience');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."feature_type" AS ENUM ('included', 'optional', 'upgrade');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to ticket_features table
ALTER TABLE "public"."ticket_features"
ADD COLUMN IF NOT EXISTS "category" feature_category NOT NULL DEFAULT 'access',
ADD COLUMN IF NOT EXISTS "feature_type" feature_type NOT NULL DEFAULT 'included',
ADD COLUMN IF NOT EXISTS "icon" text,
ADD COLUMN IF NOT EXISTS "display_priority" integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updated_by" text;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS set_ticket_features_updated_at ON "public"."ticket_features";
CREATE TRIGGER set_ticket_features_updated_at
    BEFORE UPDATE ON "public"."ticket_features"
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Update foreign key constraints for package_tickets
ALTER TABLE "public"."package_tickets"
DROP CONSTRAINT IF EXISTS "package_tickets_package_id_fkey",
DROP CONSTRAINT IF EXISTS "package_tickets_ticket_id_fkey",
ADD CONSTRAINT "package_tickets_package_id_fkey"
    FOREIGN KEY ("package_id")
    REFERENCES "public"."ticket_packages"("id")
    ON DELETE CASCADE,
ADD CONSTRAINT "package_tickets_ticket_id_fkey"
    FOREIGN KEY ("ticket_id")
    REFERENCES "public"."tickets"("id")
    ON DELETE CASCADE;

-- Update foreign key constraints for ticket_feature_mappings
ALTER TABLE "public"."ticket_feature_mappings"
DROP CONSTRAINT IF EXISTS "ticket_feature_mappings_ticket_id_fkey",
DROP CONSTRAINT IF EXISTS "ticket_feature_mappings_feature_id_fkey",
ADD CONSTRAINT "ticket_feature_mappings_ticket_id_fkey"
    FOREIGN KEY ("ticket_id")
    REFERENCES "public"."tickets"("id")
    ON DELETE CASCADE,
ADD CONSTRAINT "ticket_feature_mappings_feature_id_fkey"
    FOREIGN KEY ("feature_id")
    REFERENCES "public"."ticket_features"("id")
    ON DELETE CASCADE; 