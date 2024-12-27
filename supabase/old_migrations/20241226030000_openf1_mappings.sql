-- Add OpenF1 fields to circuits table
ALTER TABLE "public"."circuits"
ADD COLUMN IF NOT EXISTS "openf1_key" integer UNIQUE,
ADD COLUMN IF NOT EXISTS "openf1_short_name" text;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS "idx_circuits_openf1_key" ON "public"."circuits"("openf1_key");

-- Add OpenF1 fields to races table
ALTER TABLE "public"."races"
ADD COLUMN IF NOT EXISTS "openf1_meeting_key" integer UNIQUE,
ADD COLUMN IF NOT EXISTS "openf1_session_key" integer UNIQUE;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS "idx_races_openf1_meeting_key" ON "public"."races"("openf1_meeting_key");
CREATE INDEX IF NOT EXISTS "idx_races_openf1_session_key" ON "public"."races"("openf1_session_key");

-- Create supporting series status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "public"."supporting_series_status" AS ENUM (
        'scheduled',
        'live',
        'completed',
        'delayed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add OpenF1 fields to supporting_series table
ALTER TABLE "public"."supporting_series"
ADD COLUMN IF NOT EXISTS "openf1_session_key" integer UNIQUE,
ADD COLUMN IF NOT EXISTS "start_time" timestamptz,
ADD COLUMN IF NOT EXISTS "end_time" timestamptz,
ADD COLUMN IF NOT EXISTS "status" "public"."supporting_series_status" DEFAULT 'scheduled'::supporting_series_status;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS "idx_supporting_series_openf1_session_key" ON "public"."supporting_series"("openf1_session_key");
CREATE INDEX IF NOT EXISTS "idx_supporting_series_start_time" ON "public"."supporting_series"("start_time");
CREATE INDEX IF NOT EXISTS "idx_supporting_series_status" ON "public"."supporting_series"("status"); 