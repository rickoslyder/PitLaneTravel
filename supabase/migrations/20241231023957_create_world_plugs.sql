-- Create the set_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the world_plugs table
CREATE TABLE IF NOT EXISTS world_plugs (
  id SERIAL PRIMARY KEY,
  country_code text NOT NULL,
  frequency text NOT NULL,
  name text NOT NULL,
  plug_type text NOT NULL,
  voltage text NOT NULL,
  image_url text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create an index on the name column for faster lookups
CREATE INDEX IF NOT EXISTS idx_world_plugs_name ON world_plugs(name);

-- Add a comment to the table
COMMENT ON TABLE world_plugs IS 'Stores information about electrical plug types, voltages, and frequencies for different countries.';

-- Create a trigger to update the updated_at column
DROP TRIGGER IF EXISTS set_updated_at ON world_plugs;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON world_plugs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
