import { db } from "@/db/db"
import { sql } from "drizzle-orm"
import * as dotenv from "dotenv"
import path from "path"

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

async function dropTables() {
  try {
    console.log("Dropping all tables...")

    // Drop tables in order of dependencies
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

    console.log("All tables dropped successfully!")
  } catch (error) {
    console.error("Failed to drop tables:", error)
    throw error
  }
}

dropTables()
