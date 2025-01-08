import { processXmlFeed } from "./parse-p1-tickets"
import { insertParsedData } from "./insert-parsed-data"
import path from "path"

async function main() {
  try {
    // Parse the XML feed
    console.log("Parsing XML feed...")
    const tickets = await processXmlFeed(
      path.join(process.cwd(), "36e68b7b500770cf7b8b7379ce094fca.xml"),
      path.join(process.cwd(), "parsed_tickets_2025-01-07.json")
    )

    // Insert the parsed data
    console.log("\nInserting parsed data...")
    await insertParsedData(tickets)

    console.log("\nProcess completed successfully!")
  } catch (error) {
    console.error("Error in main process:", error)
    process.exit(1)
  }
}

main() 