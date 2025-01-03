-- Add updated_at and updated_by columns to ticket_packages
ALTER TABLE "public"."ticket_packages"
ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
ADD COLUMN IF NOT EXISTS "updated_by" text;

-- Create or replace the trigger function for updated_at
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_ticket_packages_updated_at ON "public"."ticket_packages";
CREATE TRIGGER set_ticket_packages_updated_at
    BEFORE UPDATE ON "public"."ticket_packages"
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Add race_id column if it doesn't exist
ALTER TABLE "public"."ticket_packages"
ADD COLUMN IF NOT EXISTS "race_id" uuid REFERENCES "public"."races"("id") ON DELETE CASCADE;

-- Make description NOT NULL
ALTER TABLE "public"."ticket_packages"
ALTER COLUMN "description" SET NOT NULL;

-- Update foreign key constraints for package_tickets if they don't exist
DO $$ BEGIN
    -- Drop existing constraints if they exist
    ALTER TABLE "public"."package_tickets"
    DROP CONSTRAINT IF EXISTS "package_tickets_package_id_fkey",
    DROP CONSTRAINT IF EXISTS "package_tickets_ticket_id_fkey";

    -- Add new constraints with ON DELETE CASCADE
    ALTER TABLE "public"."package_tickets"
    ADD CONSTRAINT "package_tickets_package_id_fkey"
    FOREIGN KEY ("package_id")
    REFERENCES "public"."ticket_packages"("id")
    ON DELETE CASCADE;

    ALTER TABLE "public"."package_tickets"
    ADD CONSTRAINT "package_tickets_ticket_id_fkey"
    FOREIGN KEY ("ticket_id")
    REFERENCES "public"."tickets"("id")
    ON DELETE CASCADE;
END $$;
