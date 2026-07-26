import { processXmlFeed } from "./parse-p1-tickets"
import { insertParsedData } from "./insert-parsed-data"
import path from "path"

async function main() {
  try {
    // Parse the XML feed
    console.log("Parsing XML feed...")
    const tickets = await processXmlFeed(
      path.join(process.cwd(), "data/seeds/p1-tickets-raw.xml"),
      path.join(process.cwd(), "data/seeds/parsed_tickets_2025-01-07.json")
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