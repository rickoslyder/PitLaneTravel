-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at and updated_by columns to ticket_packages
ALTER TABLE "public"."ticket_packages"
ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
ADD COLUMN IF NOT EXISTS "updated_by" text;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_ticket_packages_updated_at ON "public"."ticket_packages";
CREATE TRIGGER set_ticket_packages_updated_at
    BEFORE UPDATE ON "public"."ticket_packages"
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Drop existing foreign key constraints if they exist
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ticket_feature_mappings_ticket_id_fkey') THEN
    ALTER TABLE "public"."ticket_feature_mappings" DROP CONSTRAINT "ticket_feature_mappings_ticket_id_fkey";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ticket_feature_mappings_feature_id_fkey') THEN
    ALTER TABLE "public"."ticket_feature_mappings" DROP CONSTRAINT "ticket_feature_mappings_feature_id_fkey";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'package_tickets_package_id_fkey') THEN
    ALTER TABLE "public"."package_tickets" DROP CONSTRAINT "package_tickets_package_id_fkey";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'package_tickets_ticket_id_fkey') THEN
    ALTER TABLE "public"."package_tickets" DROP CONSTRAINT "package_tickets_ticket_id_fkey";
  END IF;
END $$;

-- Add foreign key constraints with ON DELETE CASCADE
ALTER TABLE "public"."ticket_feature_mappings"
  ADD CONSTRAINT "ticket_feature_mappings_ticket_id_fkey" 
  FOREIGN KEY ("ticket_id") 
  REFERENCES "public"."tickets"("id") 
  ON DELETE CASCADE;

ALTER TABLE "public"."ticket_feature_mappings"
  ADD CONSTRAINT "ticket_feature_mappings_feature_id_fkey" 
  FOREIGN KEY ("feature_id") 
  REFERENCES "public"."ticket_features"("id") 
  ON DELETE CASCADE;

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