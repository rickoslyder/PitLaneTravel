-- Add race_id column to ticket_packages table
ALTER TABLE "public"."ticket_packages" 
ADD COLUMN "race_id" uuid NOT NULL REFERENCES "public"."races"("id") ON DELETE CASCADE;

-- Create index for race_id
CREATE INDEX "idx_ticket_packages_race_id" ON "public"."ticket_packages" ("race_id");
