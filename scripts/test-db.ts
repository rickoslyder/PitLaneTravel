import postgres from "postgres"
import * as dotenv from "dotenv"
import path from "path"

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

async function testConnection() {
  try {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL is not defined in environment variables")
    }

    console.log("Connecting to database...")

    const sql = postgres(connectionString)
    const result = await sql`SELECT NOW()`

    console.log("Successfully connected to database!")
    console.log("Current time:", result[0].now)

    await sql.end()
  } catch (error) {
    console.error("Failed to connect to database:", error)
  }
}

testConnection()
