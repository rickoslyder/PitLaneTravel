-- Drop existing foreign key constraints
ALTER TABLE meetups DROP CONSTRAINT IF EXISTS meetups_race_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_race_id_fkey;
ALTER TABLE tips DROP CONSTRAINT IF EXISTS tips_race_id_fkey;
ALTER TABLE trips DROP CONSTRAINT IF EXISTS trips_race_id_fkey;

-- Convert race_id columns to UUID
DO $$
BEGIN
  ALTER TABLE meetups ALTER COLUMN race_id TYPE uuid USING race_id::uuid;
  ALTER TABLE reviews ALTER COLUMN race_id TYPE uuid USING race_id::uuid;
  ALTER TABLE tips ALTER COLUMN race_id TYPE uuid USING race_id::uuid;
  ALTER TABLE trips ALTER COLUMN race_id TYPE uuid USING race_id::uuid;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Add foreign key constraints
DO $$
BEGIN
  ALTER TABLE meetups ADD CONSTRAINT meetups_race_id_fkey FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE;
  ALTER TABLE reviews ADD CONSTRAINT reviews_race_id_fkey FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE;
  ALTER TABLE tips ADD CONSTRAINT tips_race_id_fkey FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE;
  ALTER TABLE trips ADD CONSTRAINT trips_race_id_fkey FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
