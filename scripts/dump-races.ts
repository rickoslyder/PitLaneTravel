import { db } from "@/db/db"
import { racesTable } from "@/db/schema"
import fs from "fs/promises"
import path from "path"

async function main() {
  try {
    console.log("Fetching races from database...")
    const races = await db.select().from(racesTable)
    
    // Save to JSON
    const jsonPath = path.join(process.cwd(), "race-mapping-data.json")
    await fs.writeFile(
      jsonPath,
      JSON.stringify(races, null, 2),
      "utf-8"
    )

    console.log(`Found ${races.length} races`)
    console.log(`Race data written to ${jsonPath}`)
  } catch (error) {
    console.error("Error dumping race data:", error)
    process.exit(1)
  }
}

main() 