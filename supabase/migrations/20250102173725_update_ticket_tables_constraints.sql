-- Add update trigger for ticket_packages.updated_at
DROP TRIGGER IF EXISTS "update_ticket_packages_updated_at" ON "public"."ticket_packages";
CREATE TRIGGER "update_ticket_packages_updated_at" 
BEFORE UPDATE ON "public"."ticket_packages"
FOR EACH ROW
EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Make description NOT NULL in ticket_packages
ALTER TABLE "public"."ticket_packages" 
ALTER COLUMN "description" SET NOT NULL;

-- Add foreign key constraints to ticket_feature_mappings if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_feature_mappings_ticket_id_fkey') THEN
        ALTER TABLE "public"."ticket_feature_mappings"
        ADD CONSTRAINT "ticket_feature_mappings_ticket_id_fkey" 
        FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_feature_mappings_feature_id_fkey') THEN
        ALTER TABLE "public"."ticket_feature_mappings"
        ADD CONSTRAINT "ticket_feature_mappings_feature_id_fkey"
        FOREIGN KEY ("feature_id") REFERENCES "public"."ticket_features"("id") ON DELETE CASCADE;
    END IF;
END $$;
