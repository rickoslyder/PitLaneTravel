-- Create the unit_group enum type
CREATE TYPE unit_group AS ENUM ('us', 'metric');

-- Add the unit_group column to the race_weather table
ALTER TABLE race_weather ADD COLUMN unit_group unit_group NOT NULL DEFAULT 'metric';

-- Create an index on the unit_group column for better query performance
CREATE INDEX idx_race_weather_unit_group ON race_weather (unit_group);