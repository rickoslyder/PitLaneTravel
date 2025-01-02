-- Create the unit_group enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE unit_group AS ENUM ('us', 'metric');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the race_weather table if it doesn't exist
CREATE TABLE IF NOT EXISTS race_weather (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    race_id uuid NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    date timestamp with time zone NOT NULL,
    temp_max numeric(4,1) NOT NULL,
    temp_min numeric(4,1) NOT NULL,
    temp numeric(4,1) NOT NULL,
    feels_like numeric(4,1) NOT NULL,
    dew numeric(4,1),
    humidity numeric(4,1) NOT NULL,
    precip numeric(4,1) NOT NULL,
    precip_prob numeric(4,1) NOT NULL,
    wind_speed numeric(4,1) NOT NULL,
    wind_dir numeric(4,1),
    pressure numeric(6,1),
    cloud_cover numeric(4,1),
    visibility numeric(4,1),
    uv_index numeric(2,0),
    sunrise text,
    sunset text,
    conditions text NOT NULL,
    icon text NOT NULL,
    unit_group unit_group NOT NULL DEFAULT 'metric',
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create an index on the unit_group column for better query performance
CREATE INDEX IF NOT EXISTS idx_race_weather_unit_group ON race_weather (unit_group);

-- Add the updated_at trigger using the existing update_updated_at_column function
DO $$ BEGIN
    CREATE TRIGGER update_race_weather_updated_at
        BEFORE UPDATE ON race_weather
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;