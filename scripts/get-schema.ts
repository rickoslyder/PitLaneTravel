import { db } from "@/db/db"
import { sql } from "drizzle-orm"
import * as dotenv from "dotenv"
import path from "path"

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

async function getSchema() {
  try {
    console.log("Getting current schema...")

    // Get all tables
    console.log("\nAll tables in database:")
    const tables = await db.execute(sql`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `)
    console.log(JSON.stringify(tables, null, 2))

    // Get circuits table structure
    console.log("\nCircuits table structure:")
    const circuitsColumns = await db.execute(sql`
      SELECT 
        column_name,
        data_type,
        column_default,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'circuits'
      ORDER BY ordinal_position;
    `)
    console.log(JSON.stringify(circuitsColumns, null, 2))

    // Get sample data from old races table
    console.log("\nSample from races_old table:")
    const races = await db.execute(sql`
      SELECT * FROM races_old LIMIT 1;
    `)
    console.log(JSON.stringify(races, null, 2))

    // Get column info for old tables
    console.log("\nColumn info for old tables:")
    const columns = await db.execute(sql`
      SELECT 
        table_name,
        column_name,
        data_type,
        column_default,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('races_old', 'saved_itineraries_old')
      ORDER BY table_name, ordinal_position;
    `)
    console.log(JSON.stringify(columns, null, 2))
  } catch (error) {
    console.error("Failed to get schema:", error)
  }
}

getSchema()
