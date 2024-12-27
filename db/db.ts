/*
<ai_context>
Initializes the database connection and schema for the app.
</ai_context>
*/

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

let _db: ReturnType<typeof drizzle> | null = null

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required")
}

const connectionString = process.env.DATABASE_URL

// Connection function with pooling
function createConnection() {
  if (_db) return _db

  console.log("[DB] Initializing database connection...")
  const client = postgres(connectionString, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10
  })

  _db = drizzle(client, { schema })
  return _db
}

export const db = createConnection()
