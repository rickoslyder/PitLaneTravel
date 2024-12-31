import { updateAllCircuitTimezonesAction } from "@/actions/db/circuits-actions"

async function main() {
  console.log("Starting timezone update for all circuits...")
  
  const result = await updateAllCircuitTimezonesAction()
  
  if (result.isSuccess) {
    console.log("Successfully updated all circuit timezones")
  } else {
    console.error("Failed to update circuit timezones:", result.message)
    process.exit(1)
  }
}

main().catch(error => {
  console.error("Error running script:", error)
  process.exit(1)
}) 