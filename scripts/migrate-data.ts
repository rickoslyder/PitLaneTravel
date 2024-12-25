import { migrateDataAction } from "@/actions/db/migrate-data-actions"

async function main() {
  try {
    const result = await migrateDataAction()
    if (result.isSuccess) {
      console.log("✅", result.message)
    } else {
      console.error("❌", result.message)
      process.exit(1)
    }
  } catch (error) {
    console.error("Error running migration:", error)
    process.exit(1)
  }
}

main()
