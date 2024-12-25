import { DatabaseDump } from "@/actions/db/migrate-data-actions"

const databaseDump: DatabaseDump = require("../database_dump.json")

function printObject(obj: any, indent = 0) {
  const spaces = " ".repeat(indent)
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "object" && value !== null) {
      console.log(`${spaces}${key}:`)
      printObject(value, indent + 2)
    } else {
      console.log(`${spaces}${key}: ${value}`)
    }
  }
}

console.log("\nRaces:", databaseDump.races.length)
console.log("\nFirst race:")
printObject(databaseDump.races[0])

console.log("\nSaved Itineraries:", databaseDump.saved_itineraries.length)
console.log("\nSaved Itinerary IDs:", databaseDump.saved_itineraries.map(i => i.id).sort((a, b) => a - b))
console.log("\nFirst saved itinerary:")
printObject(databaseDump.saved_itineraries[0])

console.log("\nTickets:", databaseDump.tickets.length)
console.log("\nFirst ticket:")
printObject(databaseDump.tickets[0]) 