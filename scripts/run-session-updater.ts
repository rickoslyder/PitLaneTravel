import { SessionUpdater } from "@/services/openf1/session-updater"

// Handle process termination gracefully
let updater: SessionUpdater | null = null

function cleanup() {
  if (updater) {
    console.log("\nStopping session updater...")
    updater.stopPolling()
  }
  process.exit(0)
}

// Handle termination signals
process.on("SIGINT", cleanup)
process.on("SIGTERM", cleanup)
process.on("SIGUSR2", cleanup) // For nodemon

async function main() {
  try {
    console.log("Starting OpenF1 session updater...")
    
    // Create updater with 30 second polling interval
    updater = new SessionUpdater(30000)
    
    // Start polling
    await updater.startPolling()
  } catch (error) {
    console.error("Error in session updater:", error)
    cleanup()
  }
}

main() 