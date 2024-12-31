-- Add timezone columns to circuits table
ALTER TABLE circuits
ADD COLUMN timezone_id text,
ADD COLUMN timezone_name text;

-- Update all race dates to 2pm UTC
UPDATE races
SET date = date_trunc('day', date) + interval '14 hours'
WHERE date IS NOT NULL;

-- Update weekend start/end times to 2pm UTC if they exist
UPDATE races
SET weekend_start = date_trunc('day', weekend_start) + interval '14 hours'
WHERE weekend_start IS NOT NULL;

UPDATE races
SET weekend_end = date_trunc('day', weekend_end) + interval '14 hours'
WHERE weekend_end IS NOT NULL; 