import { drizzle } from "drizzle-orm/postgres-js"
import { sql } from "drizzle-orm"
import postgres from "postgres"

// Get the database URL from environment variable
const DATABASE_URL = process.env.DATABASE_URL as string

async function main() {
  // Create the database connection
  const client = postgres(DATABASE_URL, { max: 1 })
  const db = drizzle(client)

  try {
    // Create tables in order of dependencies
    console.log("Creating circuits table...")
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS circuits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        country TEXT NOT NULL,
        latitude TEXT NOT NULL,
        longitude TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        transport_info JSONB,
        weather_info JSONB,
        nearest_airports JSONB,
        circuit_info JSONB,
        last_year_podium JSONB,
        track_map_url TEXT,
        local_attractions JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `)

    console.log("Creating races table...")
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS races (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        circuit_id UUID NOT NULL REFERENCES circuits(id),
        name TEXT NOT NULL,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        season INTEGER NOT NULL,
        round INTEGER NOT NULL,
        country TEXT NOT NULL,
        description TEXT,
        status TEXT,
        slug TEXT,
        availability TEXT,
        price DECIMAL(10,2),
        season_period TEXT,
        is_sprint_weekend BOOLEAN DEFAULT false,
        weekend_start TIMESTAMP WITH TIME ZONE,
        weekend_end TIMESTAMP WITH TIME ZONE,
        supporting_series JSONB,
        suggested_itineraries JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `)

    console.log("Creating saved_itineraries table...")
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS saved_itineraries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        race_id UUID NOT NULL REFERENCES races(id),
        itinerary JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `)

    console.log("Creating tickets table...")
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        race_id UUID NOT NULL REFERENCES races(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        ticket_type TEXT NOT NULL,
        availability TEXT NOT NULL,
        days_included JSONB NOT NULL,
        is_child_ticket BOOLEAN NOT NULL DEFAULT false,
        reseller_url TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `)

    console.log("Creating ticket_pricing table...")
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ticket_pricing (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID NOT NULL REFERENCES tickets(id),
        price TEXT NOT NULL,
        currency TEXT NOT NULL,
        valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
        valid_to TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `)

    console.log("✅ All tables created successfully!")
  } catch (error) {
    console.error("Error creating tables:", error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main() 