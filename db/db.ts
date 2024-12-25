/*
<ai_context>
Initializes the database connection and schema for the app.
</ai_context>
*/

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import {
  circuitsTable,
  racesTable,
  ticketsTable,
  ticketPricingTable,
  savedItinerariesTable,
  airportsTable,
  circuitDetailsTable,
  podiumResultsTable,
  localAttractionsTable,
  supportingSeriesTable,
  activitiesTable,
  profilesTable,
  reviewsTable,
  tipsTable,
  meetupsTable,
  tripsTable,
  membershipEnum,
  tripVisibilityEnum
} from "./schema"
import * as dotenv from "dotenv"
import path from "path"

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

console.log("[DB] Starting database initialization...")

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("[DB] DATABASE_URL is not defined!")
  throw new Error("DATABASE_URL is not defined in environment variables")
}

console.log("[DB] Database URL found, initializing connection...")

// Global is used here to maintain a cached connection across hot reloads in development
const globalForDb = globalThis as unknown as {
  pg: ReturnType<typeof postgres> | undefined
}

let db: ReturnType<typeof drizzle>

try {
  console.log("[DB] Creating postgres client...")
  const client =
    globalForDb.pg ??
    postgres(connectionString, {
      ssl: "require",
      max: 1,
      prepare: false,
      onnotice: notice => {
        console.log("[DB Notice]", notice)
      },
      onparameter: parameterStatus => {
        console.log("[DB Parameter]", parameterStatus)
      },
      connection: {
        application_name: "pit-lane-travel"
      }
    })

  if (process.env.NODE_ENV !== "production") {
    console.log("[DB] Development mode - caching database connection")
    globalForDb.pg = client
  }

  // Test the connection and schema access
  const testConnection = async () => {
    try {
      console.log("[DB] Testing connection...")

      // First, get connection info
      const info = await client`
        SELECT current_database() as db, 
               current_schema() as schema, 
               current_user as user,
               current_setting('search_path') as search_path
      `
      console.log("[DB] Connection info:", info)

      // Then, set search path explicitly and verify it
      await client`SET search_path TO public`
      const searchPath = await client`SHOW search_path`
      console.log("[DB] Search path set to:", searchPath)

      // Verify tables exist and get their schemas
      const tables = await client`
        SELECT table_name, table_schema 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      `
      console.log(
        "[DB] Available tables:",
        tables.map(t => t.table_name)
      )

      // Verify specific table structure with detailed info
      const profilesColumns = await client`
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
        ORDER BY ordinal_position
      `
      console.log("[DB] Profiles table structure:", profilesColumns)

      const racesColumns = await client`
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'races'
        ORDER BY ordinal_position
      `
      console.log("[DB] Races table structure:", racesColumns)

      // Test a simple query on each table
      const profilesTest = await client`SELECT COUNT(*) FROM profiles`
      console.log("[DB] Profiles count:", profilesTest[0].count)

      const racesTest = await client`SELECT COUNT(*) FROM races`
      console.log("[DB] Races count:", racesTest[0].count)
    } catch (error) {
      console.error("[DB] Connection test failed:", error)
      if (error instanceof Error) {
        console.error("[DB] Error name:", error.name)
        console.error("[DB] Error message:", error.message)
        console.error("[DB] Error stack:", error.stack)
      }
      throw error
    }
  }
  await testConnection()

  console.log("[DB] Initializing Drizzle ORM...")
  db = drizzle(client, {
    schema: {
      circuits: circuitsTable,
      races: racesTable,
      tickets: ticketsTable,
      ticketPricing: ticketPricingTable,
      savedItineraries: savedItinerariesTable,
      airports: airportsTable,
      circuitDetails: circuitDetailsTable,
      podiumResults: podiumResultsTable,
      localAttractions: localAttractionsTable,
      supportingSeries: supportingSeriesTable,
      activities: activitiesTable,
      profiles: profilesTable,
      reviews: reviewsTable,
      tips: tipsTable,
      meetups: meetupsTable,
      trips: tripsTable
    }
  })

  console.log("[DB] Database initialization complete!")
} catch (error) {
  console.error("[DB] Failed to initialize database:", error)
  throw error
}

export { db }
