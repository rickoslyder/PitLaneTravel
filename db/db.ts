/*
<ai_context>
Initializes the database connection and schema for the app.
Uses a robust singleton pattern with proper connection management.
</ai_context>
*/

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Global declarations
declare global {
  var _db: ReturnType<typeof drizzle> | undefined
  var _client: ReturnType<typeof postgres> | undefined
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required")
}

const connectionString = process.env.DATABASE_URL

// Connection function with pooling
function createConnection() {
  // In production, use the global singleton
  if (process.env.NODE_ENV === "production") {
    if (!global._db) {
      console.log("[DB] Initializing production database connection...")
      global._client = postgres(connectionString, {
        max: 5,
        idle_timeout: 20,
        connect_timeout: 10
      })
      global._db = drizzle(global._client, { schema })
    }
    return global._db
  }

  // In development, use module-level singleton
  if (!global._db) {
    console.log("[DB] Initializing development database connection...")
    global._client = postgres(connectionString, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10
    })
    global._db = drizzle(global._client, { schema })
  }
  return global._db
}

// Handle cleanup
if (process.env.NODE_ENV !== "production") {
  process.on("beforeExit", async () => {
    if (global._client) {
      await global._client.end()
      global._client = undefined
      global._db = undefined
      console.log("[DB] Closed database connection")
    }
  })
}
export const db = createConnection()
