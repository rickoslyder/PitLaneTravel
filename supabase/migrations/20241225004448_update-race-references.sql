-- First, create temporary columns to store the converted UUIDs
ALTER TABLE meetups ADD COLUMN race_id_new uuid;
ALTER TABLE reviews ADD COLUMN race_id_new uuid;
ALTER TABLE tips ADD COLUMN race_id_new uuid;
ALTER TABLE trips ADD COLUMN race_id_new uuid;

-- Update the new columns with converted UUIDs from the races table
UPDATE meetups m
SET race_id_new = r.id
FROM races r
WHERE m.race_id = r.id::text;

UPDATE reviews rv
SET race_id_new = r.id
FROM races r
WHERE rv.race_id = r.id::text;

UPDATE tips t
SET race_id_new = r.id
FROM races r
WHERE t.race_id = r.id::text;

UPDATE trips tr
SET race_id_new = r.id
FROM races r
WHERE tr.race_id = r.id::text;

-- Drop the old columns and rename the new ones
ALTER TABLE meetups DROP COLUMN race_id;
ALTER TABLE meetups ALTER COLUMN race_id_new SET NOT NULL;
ALTER TABLE meetups RENAME COLUMN race_id_new TO race_id;

ALTER TABLE reviews DROP COLUMN race_id;
ALTER TABLE reviews ALTER COLUMN race_id_new SET NOT NULL;
ALTER TABLE reviews RENAME COLUMN race_id_new TO race_id;

ALTER TABLE tips DROP COLUMN race_id;
ALTER TABLE tips ALTER COLUMN race_id_new SET NOT NULL;
ALTER TABLE tips RENAME COLUMN race_id_new TO race_id;

ALTER TABLE trips DROP COLUMN race_id;
ALTER TABLE trips ALTER COLUMN race_id_new SET NOT NULL;
ALTER TABLE trips RENAME COLUMN race_id_new TO race_id;

-- Add foreign key constraints
ALTER TABLE meetups
ADD CONSTRAINT meetups_race_id_fkey
FOREIGN KEY (race_id)
REFERENCES races(id)
ON DELETE CASCADE;

ALTER TABLE reviews
ADD CONSTRAINT reviews_race_id_fkey
FOREIGN KEY (race_id)
REFERENCES races(id)
ON DELETE CASCADE;

ALTER TABLE tips
ADD CONSTRAINT tips_race_id_fkey
FOREIGN KEY (race_id)
REFERENCES races(id)
ON DELETE CASCADE;

ALTER TABLE trips
ADD CONSTRAINT trips_race_id_fkey
FOREIGN KEY (race_id)
REFERENCES races(id)
ON DELETE CASCADE;

---- ROLLBACK SECTION ----
/*
-- Drop foreign key constraints
ALTER TABLE meetups DROP CONSTRAINT IF EXISTS meetups_race_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_race_id_fkey;
ALTER TABLE tips DROP CONSTRAINT IF EXISTS tips_race_id_fkey;
ALTER TABLE trips DROP CONSTRAINT IF EXISTS trips_race_id_fkey;

-- Add temporary text columns
ALTER TABLE meetups ADD COLUMN race_id_old text;
ALTER TABLE reviews ADD COLUMN race_id_old text;
ALTER TABLE tips ADD COLUMN race_id_old text;
ALTER TABLE trips ADD COLUMN race_id_old text;

-- Convert UUIDs back to text
UPDATE meetups SET race_id_old = race_id::text;
UPDATE reviews SET race_id_old = race_id::text;
UPDATE tips SET race_id_old = race_id::text;
UPDATE trips SET race_id_old = race_id::text;

-- Drop UUID columns and rename text columns back
ALTER TABLE meetups DROP COLUMN race_id;
ALTER TABLE meetups ALTER COLUMN race_id_old SET NOT NULL;
ALTER TABLE meetups RENAME COLUMN race_id_old TO race_id;

ALTER TABLE reviews DROP COLUMN race_id;
ALTER TABLE reviews ALTER COLUMN race_id_old SET NOT NULL;
ALTER TABLE reviews RENAME COLUMN race_id_old TO race_id;

ALTER TABLE tips DROP COLUMN race_id;
ALTER TABLE tips ALTER COLUMN race_id_old SET NOT NULL;
ALTER TABLE tips RENAME COLUMN race_id_old TO race_id;

ALTER TABLE trips DROP COLUMN race_id;
ALTER TABLE trips ALTER COLUMN race_id_old SET NOT NULL;
ALTER TABLE trips RENAME COLUMN race_id_old TO race_id;
*/
