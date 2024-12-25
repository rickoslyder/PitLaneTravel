import { db } from "@/db/db"
import { sql } from "drizzle-orm"
import * as dotenv from "dotenv"
import path from "path"

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

async function renameTables() {
  try {
    console.log("Creating and renaming tables...")

    // Drop all tables first
    await db.execute(sql`
      -- First drop tables that depend on other tables
      DROP TABLE IF EXISTS package_tickets CASCADE;
      DROP TABLE IF EXISTS ticket_feature_mappings CASCADE;
      DROP TABLE IF EXISTS ticket_pricing CASCADE;
      DROP TABLE IF EXISTS tickets CASCADE;
      DROP TABLE IF EXISTS ticket_packages CASCADE;
      DROP TABLE IF EXISTS ticket_features CASCADE;
      DROP TABLE IF EXISTS saved_itineraries CASCADE;
      DROP TABLE IF EXISTS saved_itineraries_old CASCADE;
      DROP TABLE IF EXISTS trips CASCADE;
      DROP TABLE IF EXISTS reviews CASCADE;
      DROP TABLE IF EXISTS tips CASCADE;
      DROP TABLE IF EXISTS meetups CASCADE;
      DROP TABLE IF EXISTS profiles CASCADE;

      -- Then drop tables that others depend on
      DROP TABLE IF EXISTS races CASCADE;
      DROP TABLE IF EXISTS races_old CASCADE;
      DROP TABLE IF EXISTS circuits CASCADE;

      -- Drop other tables
      DROP TABLE IF EXISTS circuit_info CASCADE;
      DROP TABLE IF EXISTS circuit_transport CASCADE;
      DROP TABLE IF EXISTS circuit_airports CASCADE;
      DROP TABLE IF EXISTS circuit_attractions CASCADE;
      DROP TABLE IF EXISTS race_sessions CASCADE;
      DROP TABLE IF EXISTS race_weather CASCADE;
      DROP TABLE IF EXISTS race_results CASCADE;
      DROP TABLE IF EXISTS race_supporting_series CASCADE;
      DROP TABLE IF EXISTS supporting_series CASCADE;

      -- Drop types
      DROP TYPE IF EXISTS membership CASCADE;
      DROP TYPE IF EXISTS trip_visibility CASCADE;
      DROP TYPE IF EXISTS ticket_availability CASCADE;
      DROP TYPE IF EXISTS review_type CASCADE;
    `)

    // Create races table
    await db.execute(sql`
      CREATE TABLE races (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        circuit_id uuid NOT NULL,
        name text NOT NULL,
        date timestamp NOT NULL,
        season integer NOT NULL,
        round integer NOT NULL,
        country text NOT NULL,
        created_at timestamp NOT NULL DEFAULT NOW(),
        updated_at timestamp NOT NULL DEFAULT NOW()
      );
    `)

    // Create saved_itineraries table
    await db.execute(sql`
      CREATE TABLE saved_itineraries (
        id serial PRIMARY KEY,
        user_id text NOT NULL,
        race_id uuid NOT NULL,
        itinerary jsonb NOT NULL,
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      );
    `)

    // Rename races table
    await db.execute(sql`
      ALTER TABLE races RENAME TO races_old;
    `)

    // Rename saved_itineraries table
    await db.execute(sql`
      ALTER TABLE saved_itineraries RENAME TO saved_itineraries_old;
    `)

    console.log("Tables created and renamed successfully")
  } catch (error) {
    console.error("Failed to create and rename tables:", error)
  }
}

renameTables()
