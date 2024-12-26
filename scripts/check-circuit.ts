import { db } from "@/db/db"
import { circuitsTable } from "@/db/schema"
import { eq } from "drizzle-orm"

async function main() {
  const circuit = await db
    .select()
    .from(circuitsTable)
    .where(eq(circuitsTable.name, "Jeddah Corniche Circuit"))
    .limit(1)

  console.log("Circuit data:", circuit[0])
}

main().catch(console.error) 