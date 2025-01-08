import { processXmlFeed } from "./parse-p1-tickets"
import path from "path"

async function main() {
  try {
    const inputFile = process.argv[2]
    if (!inputFile) {
      console.error("Please provide the path to the XML file as an argument")
      process.exit(1)
    }

    const outputFile = path.join(
      path.dirname(inputFile),
      `parsed_tickets_${new Date().toISOString().split("T")[0]}.json`
    )

    await processXmlFeed(inputFile, outputFile)
    console.log("Processing completed successfully!")
  } catch (error) {
    console.error("Error running parser:", error)
    process.exit(1)
  }
}

main() 