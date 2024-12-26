import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { execSync } from 'child_process'

// Import types from a shared location
import {
  Race,
  DatabaseDump,
  CircuitInfo,
  ValidationError,
  Airport,
  LocalAttraction,
  SupportingSeries,
  PodiumResult
} from './types'

class MigrationGenerator {
  private sql: string = ''
  private dryRun: boolean = false

  constructor(private data: DatabaseDump, dryRun: boolean = false) {
    this.dryRun = dryRun
  }

  // Helper to clean numeric strings
  private cleanNumeric(str: string | null | undefined): string {
    if (!str) return 'NULL'
    const cleaned = str.replace(/[^\d.]/g, '')
    return cleaned ? cleaned : 'NULL'
  }

  // Helper to escape SQL strings
  private escapeSql(value: any): string {
    if (value === null || value === undefined) return 'NULL'
    if (typeof value === 'number') return value.toString()
    if (typeof value === 'boolean') return value.toString()
    return `'${String(value).replace(/'/g, "''")}'`
  }

  // Helper to validate and clean circuit info
  private validateCircuitInfo(info?: CircuitInfo) {
    if (!info) return null
    return {
      length: this.cleanNumeric(info.length),
      corners: info.corners || 0,
      drsZones: info.drsZones || 0,
      lapRecord: info.lapRecord || { time: null, year: null, driver: null }
    }
  }

  // Add SQL comment
  private addComment(comment: string): void {
    this.sql += `\n-- ${comment}\n`
  }

  // Start transaction
  private startTransaction(): void {
    this.sql += `BEGIN;

-- Disable triggers temporarily for faster inserts
SET session_replication_role = replica;

-- Create a temporary table to store the JSON content
CREATE TEMP TABLE temp_json_data (content jsonb);

-- Insert the JSON file content into the temporary table
INSERT INTO temp_json_data (content) VALUES (
  '${fs.readFileSync(path.join(process.cwd(), 'database_dump.json'), 'utf-8').replace(/'/g, "''")}'::jsonb
);

-- Add unique constraints
ALTER TABLE circuits ADD CONSTRAINT circuits_name_key UNIQUE (name);
ALTER TABLE circuit_details ADD CONSTRAINT circuit_details_circuit_id_key UNIQUE (circuit_id);
ALTER TABLE circuit_locations ADD CONSTRAINT circuit_locations_circuit_id_place_id_key UNIQUE (circuit_id, place_id);
ALTER TABLE transport_info ADD CONSTRAINT transport_info_circuit_id_type_key UNIQUE (circuit_id, type);
ALTER TABLE local_attractions ADD CONSTRAINT local_attractions_circuit_id_name_key UNIQUE (circuit_id, name);
ALTER TABLE races ADD CONSTRAINT races_circuit_id_date_key UNIQUE (circuit_id, date);
ALTER TABLE supporting_series ADD CONSTRAINT supporting_series_race_id_series_key UNIQUE (race_id, series);
ALTER TABLE podium_results ADD CONSTRAINT podium_results_circuit_id_year_position_key UNIQUE (circuit_id, year, position);

`
  }

  // End transaction
  private endTransaction(): void {
    this.sql += `
-- Clean up
DROP TABLE temp_json_data;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

COMMIT;`
  }

  // Generate circuits migration
  private generateCircuits(): void {
    this.addComment('Insert circuits')
    this.sql += `INSERT INTO circuits (id, name, location, country, latitude, longitude, image_url)
SELECT DISTINCT ON (races->>'circuit')
  gen_random_uuid(),
  races->>'circuit',
  COALESCE(races->>'city', races->>'circuit'),
  races->>'country',
  NULLIF(REGEXP_REPLACE(races->>'latitude', '[^0-9.-]', '', 'g'), '')::numeric,
  NULLIF(REGEXP_REPLACE(races->>'longitude', '[^0-9.-]', '', 'g'), '')::numeric,
  NULLIF(races->>'image_url', '')
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
WHERE races->>'circuit' IS NOT NULL
  AND races->>'country' IS NOT NULL;

`
  }

  // Generate circuit details migration
  private generateCircuitDetails(): void {
    this.addComment('Insert circuit details')
    this.sql += `INSERT INTO circuit_details (id, circuit_id, length, corners, drs_zones, lap_record_time, lap_record_year, lap_record_driver)
SELECT
  gen_random_uuid(),
  c.id,
  NULLIF(REGEXP_REPLACE(ci->>'length', '[^0-9.]', '', 'g'), '')::numeric,
  NULLIF((ci->>'corners'), '')::integer,
  NULLIF((ci->>'drsZones'), '')::integer,
  NULLIF(ci->'lapRecord'->>'time', ''),
  NULLIF((ci->'lapRecord'->>'year'), '')::integer,
  NULLIF(ci->'lapRecord'->>'driver', '')
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
CROSS JOIN LATERAL jsonb_extract_path(races, 'circuit_info') AS ci
JOIN circuits c ON c.name = races->>'circuit'
WHERE ci IS NOT NULL;

`
  }

  // Generate airports migration
  private generateAirports(): void {
    this.addComment('Insert airports')
    this.sql += `INSERT INTO airports (id, circuit_id, code, name, distance, transfer_time)
SELECT
  gen_random_uuid(),
  c.id,
  NULLIF(a->>'code', ''),
  NULLIF(a->>'name', ''),
  NULLIF(REGEXP_REPLACE(a->>'distance', '[^0-9.]', '', 'g'), '')::numeric,
  COALESCE(NULLIF(a->>'transfer_time', ''), '1 hour')
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
CROSS JOIN LATERAL jsonb_array_elements(races->'nearest_airports') AS a
JOIN circuits c ON c.name = races->>'circuit'
WHERE races->'nearest_airports' IS NOT NULL
  AND a->>'name' IS NOT NULL
  AND a->>'code' IS NOT NULL;

`
  }

  // Generate circuit locations migration
  private generateCircuitLocations(): void {
    this.addComment('Insert circuit locations')
    this.sql += `INSERT INTO circuit_locations (id, circuit_id, type, name, description, distance_from_circuit, place_id, latitude, longitude)
SELECT
  gen_random_uuid(),
  c.id,
  'transport'::location_type,
  NULLIF(a->>'name', ''),
  NULL,
  NULLIF(REGEXP_REPLACE(a->>'distance', '[^0-9.]', '', 'g'), '')::numeric,
  NULLIF(a->>'code', ''),
  COALESCE(NULLIF(REGEXP_REPLACE(a->>'latitude', '[^0-9.-]', '', 'g'), '')::numeric, c.latitude),
  COALESCE(NULLIF(REGEXP_REPLACE(a->>'longitude', '[^0-9.-]', '', 'g'), '')::numeric, c.longitude)
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
CROSS JOIN LATERAL jsonb_array_elements(races->'nearest_airports') AS a
JOIN circuits c ON c.name = races->>'circuit'
WHERE races->'nearest_airports' IS NOT NULL
  AND a->>'name' IS NOT NULL;

`
  }

  // Generate transport info migration
  private generateTransportInfo(): void {
    this.addComment('Insert transport info')
    this.sql += `INSERT INTO transport_info (id, circuit_id, type, name, description)
SELECT
  gen_random_uuid(),
  c.id,
  t.key,
  t.key,
  t.value
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
CROSS JOIN LATERAL jsonb_each_text(races->'transport_info') AS t(key, value)
JOIN circuits c ON c.name = races->>'circuit'
WHERE races->'transport_info' IS NOT NULL
  AND t.key IS NOT NULL
  AND t.value IS NOT NULL;

`
  }

  // Generate local attractions migration
  private generateLocalAttractions(): void {
    this.addComment('Insert local attractions')
    this.sql += `INSERT INTO local_attractions (id, circuit_id, name, description)
SELECT
  gen_random_uuid(),
  c.id,
  NULLIF(a->>'name', ''),
  NULLIF(a->>'description', '')
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
CROSS JOIN LATERAL jsonb_array_elements(races->'local_attractions') AS a
JOIN circuits c ON c.name = races->>'circuit'
WHERE races->'local_attractions' IS NOT NULL
  AND a->>'name' IS NOT NULL
  AND a->>'description' IS NOT NULL;

`
  }

  // Generate races migration
  private generateRaces(): void {
    this.addComment('Insert races')
    this.sql += `INSERT INTO races (id, circuit_id, name, date, season, round, country, status, slug, is_sprint_weekend, description, weekend_start, weekend_end)
SELECT
  gen_random_uuid(),
  c.id,
  NULLIF(races->>'name', ''),
  (races->>'date')::timestamp with time zone,
  EXTRACT(YEAR FROM (races->>'date')::timestamp),
  ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM (races->>'date')::timestamp) ORDER BY (races->>'date')::timestamp),
  races->>'country',
  COALESCE(NULLIF(races->>'status', ''), 'upcoming')::race_status,
  NULLIF(races->>'slug', ''),
  COALESCE((races->>'is_sprint_weekend')::boolean, false),
  NULLIF(races->>'description', ''),
  NULLIF(races->>'weekend_start', '')::timestamp with time zone,
  NULLIF(races->>'weekend_end', '')::timestamp with time zone
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
JOIN circuits c ON c.name = races->>'circuit'
WHERE races->>'date' IS NOT NULL
  AND races->>'country' IS NOT NULL;

`
  }

  // Generate supporting series migration
  private generateSupportingSeries(): void {
    this.addComment('Insert supporting series')
    this.sql += `INSERT INTO supporting_series (id, race_id, series, round)
SELECT
  gen_random_uuid(),
  r.id,
  NULLIF(s->>'series', ''),
  NULLIF((s->>'round'), '')::integer
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
CROSS JOIN LATERAL jsonb_array_elements(races->'supporting_series') AS s
JOIN circuits c ON c.name = races->>'circuit'
JOIN races r ON r.circuit_id = c.id AND r.name = races->>'name'
WHERE races->'supporting_series' IS NOT NULL
  AND s->>'series' IS NOT NULL;

`
  }

  // Generate podium results migration
  private generatePodiumResults(): void {
    this.addComment('Insert podium results')
    this.sql += `INSERT INTO podium_results (id, circuit_id, position, driver, team, year)
SELECT
  gen_random_uuid(),
  c.id,
  NULLIF((p->>'position'), '')::integer,
  NULLIF(p->>'driver', ''),
  NULLIF(p->>'team', ''),
  EXTRACT(YEAR FROM (races->>'date')::timestamp) - 1
FROM temp_json_data,
jsonb_array_elements(content->'races') AS races
CROSS JOIN LATERAL jsonb_array_elements(races->'last_year_podium') AS p
JOIN circuits c ON c.name = races->>'circuit'
WHERE races->'last_year_podium' IS NOT NULL
  AND jsonb_typeof(races->'last_year_podium') = 'array'
  AND p->>'driver' IS NOT NULL
  AND p->>'team' IS NOT NULL
  AND p->>'position' IS NOT NULL;

`
  }

  // Generate saved itineraries migration
  private generateSavedItineraries(): void {
    this.addComment('Insert saved itineraries')
    this.sql += `INSERT INTO saved_itineraries (id, user_id, race_id, itinerary, created_at, updated_at)
SELECT
  (i->>'id')::integer,
  (i->>'user_id')::text,
  r.id as race_id,
  jsonb_build_object(
    'name', i->>'name',
    'date', i->>'date',
    'share_token', i->>'share_token',
    'activities', i->'activities'
  ) as itinerary,
  (i->>'created_at')::timestamp with time zone,
  (i->>'created_at')::timestamp with time zone as updated_at
FROM temp_json_data,
jsonb_array_elements(content->'saved_itineraries') AS i
JOIN races r ON r.id = (
  SELECT id FROM races 
  WHERE round = (i->>'race_id')::integer 
  LIMIT 1
);

`
  }

  // Generate activities migration
  private generateActivities(): void {
    this.addComment('Insert activities')
    this.sql += `INSERT INTO activities (id, itinerary_id, type, category, title, description, start_time, end_time, location, notes)
WITH parsed_times AS (
  SELECT
    si.id as itinerary_id,
    a,
    CASE 
      WHEN a->>'timeSlot' ~ '(\\d{1,2}):(\\d{2})\\s*(AM|PM)' THEN
        (si.itinerary->>'date')::timestamp with time zone + 
        make_interval(
          hours := (
            CASE 
              WHEN a->>'timeSlot' ~ 'PM' AND substring(a->>'timeSlot' from '(\\d{1,2}):')::int < 12 THEN
                substring(a->>'timeSlot' from '(\\d{1,2}):')::int + 12
              WHEN a->>'timeSlot' ~ 'AM' AND substring(a->>'timeSlot' from '(\\d{1,2}):')::int = 12 THEN
                0
              ELSE
                substring(a->>'timeSlot' from '(\\d{1,2}):')::int
            END
          ),
          mins := substring(a->>'timeSlot' from ':(\\d{2})')::int
        )
      ELSE
        (si.itinerary->>'date')::timestamp with time zone + '9:00'::interval
    END as start_time
  FROM saved_itineraries si,
  jsonb_array_elements(si.itinerary->'activities') as a
  WHERE a->>'name' IS NOT NULL
)
SELECT
  gen_random_uuid(),
  itinerary_id,
  COALESCE(a->>'type', 'activity'),
  COALESCE(a->>'category', 'other'),
  a->>'name' as title,
  a->>'description',
  start_time,
  start_time + COALESCE(
    CASE 
      WHEN a->>'duration' ~ '(\\d+(\\.\\d+)?)(\\s*hr)' THEN
        (substring(a->>'duration' from '(\\d+(\\.\\d+)?)')::numeric || ' hours')::interval
      ELSE
        '2 hours'::interval
    END,
    '2 hours'::interval
  ) as end_time,
  COALESCE(a->>'distance', '') || CASE WHEN a->>'distance' IS NOT NULL THEN ' from circuit' ELSE '' END as location,
  jsonb_build_object(
    'price', a->'price',
    'rating', a->'rating',
    'location', a->'location',
    'travelTime', a->'travelTime'
  )::text as notes
FROM parsed_times;

`
  }

  // Generate the complete migration
  public generate(): string {
    this.startTransaction()
    this.generateCircuits()
    this.generateCircuitDetails()
    this.generateAirports()
    this.generateCircuitLocations()
    this.generateTransportInfo()
    this.generateLocalAttractions()
    this.generateRaces()
    this.generateSupportingSeries()
    this.generatePodiumResults()
    this.generateSavedItineraries()
    this.generateActivities()
    this.endTransaction()
    return this.sql
  }

  // Save migration to file
  public save(): void {
    const migrationPath = path.join(
      process.cwd(),
      'supabase/migrations/20241226024747_restore_data.sql'
    )
    fs.writeFileSync(migrationPath, this.sql)
    console.log(chalk.green('\n✓ Migration file generated successfully!\n'))

    if (this.dryRun) {
      console.log(chalk.yellow('\nDry run - migration file content:\n'))
      console.log(this.sql)
    }
  }
}

// Main execution
async function main() {
  try {
    // First, validate the data
    console.log(chalk.blue('\nStep 1: Validating data...'))
    execSync('npx tsx scripts/validate-migration-data.ts', { stdio: 'inherit' })

    // Then, verify the schema
    console.log(chalk.blue('\nStep 2: Verifying schema...'))
    execSync('npx tsx scripts/verify-schema-constraints.ts', { stdio: 'inherit' })

    // Finally, generate the migration
    console.log(chalk.blue('\nStep 3: Generating migration...'))
    const rawData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'database_dump.json'), 'utf-8')
    )

    // Extract only the races data, ignoring users, price_alerts, and saved_searches
    const data: DatabaseDump = { 
      races: rawData.races.filter((race: any) => race && race.circuit && race.country && race.date) 
    }

    const generator = new MigrationGenerator(data, process.argv.includes('--dry-run'))
    generator.generate()
    generator.save()

  } catch (error) {
    console.error(chalk.red('\n✗ Failed to generate migration:'), error)
    process.exit(1)
  }
}

main() 