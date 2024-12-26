BEGIN;

-- Add transfer_time and airport_code columns to circuit_locations
ALTER TABLE circuit_locations ADD COLUMN IF NOT EXISTS transfer_time text;
ALTER TABLE circuit_locations ADD COLUMN IF NOT EXISTS airport_code text;

-- Lock the table to prevent concurrent modifications
LOCK TABLE circuit_locations IN EXCLUSIVE MODE;

-- Insert data from airports table into circuit_locations
INSERT INTO circuit_locations (
    circuit_id,
    type,
    name,
    description,
    place_id,
    latitude,
    longitude,
    distance_from_circuit,
    transfer_time,
    airport_code
)
SELECT 
    a.circuit_id,
    'airport'::"public"."location_type" as type,
    a.name,
    'Airport code: ' || a.code as description,
    null as place_id, -- We'll need to update this with Google Places API
    0 as latitude,  -- We'll need to update these later with the Duffel API
    0 as longitude, -- We'll need to update these later with the Duffel API
    a.distance as distance_from_circuit,
    a.transfer_time,
    a.code as airport_code
FROM airports a
LEFT JOIN circuit_locations cl ON cl.circuit_id = a.circuit_id AND cl.airport_code = a.code
WHERE cl.id IS NULL;

-- Drop the airports table
DROP TABLE IF EXISTS airports;

COMMIT; 