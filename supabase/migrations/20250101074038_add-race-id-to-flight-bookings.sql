-- Add race_id column to flight_bookings table
ALTER TABLE "public"."flight_bookings"
ADD COLUMN "race_id" uuid NOT NULL;

-- Add foreign key constraint
ALTER TABLE "public"."flight_bookings"
ADD CONSTRAINT "flight_bookings_race_id_fkey"
FOREIGN KEY ("race_id")
REFERENCES "public"."races"("id")
ON DELETE CASCADE;

-- Add index for race_id
CREATE INDEX "idx_flight_bookings_race_id" ON "public"."flight_bookings" ("race_id");