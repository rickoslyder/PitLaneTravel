-- Circuit OpenF1 Mappings
ALTER TABLE "public"."circuits" 
ADD COLUMN IF NOT EXISTS "openf1_key" integer UNIQUE,
ADD COLUMN IF NOT EXISTS "openf1_short_name" text;

CREATE INDEX IF NOT EXISTS idx_circuits_openf1_key 
ON "public"."circuits"("openf1_key");

-- Race OpenF1 Mappings
ALTER TABLE "public"."races" 
ADD COLUMN IF NOT EXISTS "openf1_meeting_key" integer UNIQUE,
ADD COLUMN IF NOT EXISTS "openf1_session_key" integer UNIQUE;

CREATE INDEX IF NOT EXISTS idx_races_openf1_meeting_key 
ON "public"."races"("openf1_meeting_key");

CREATE INDEX IF NOT EXISTS idx_races_openf1_session_key 
ON "public"."races"("openf1_session_key");

-- Supporting Series OpenF1 Mappings
ALTER TABLE "public"."supporting_series" 
ADD COLUMN IF NOT EXISTS "openf1_session_key" integer UNIQUE,
ADD COLUMN IF NOT EXISTS "session_type" text,
ADD COLUMN IF NOT EXISTS "start_time" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "end_time" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'scheduled',
ADD COLUMN IF NOT EXISTS "actual_start_time" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "actual_end_time" timestamp with time zone;

ALTER TABLE "public"."supporting_series"
ADD CONSTRAINT "valid_supporting_series_status" CHECK (
    status IN ('scheduled', 'live', 'completed', 'delayed', 'cancelled')
);

CREATE INDEX IF NOT EXISTS idx_supporting_series_openf1_session_key 
ON "public"."supporting_series"("openf1_session_key");

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_circuits_updated_at
    BEFORE UPDATE ON "public"."circuits"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_races_updated_at
    BEFORE UPDATE ON "public"."races"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supporting_series_updated_at
    BEFORE UPDATE ON "public"."supporting_series"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 