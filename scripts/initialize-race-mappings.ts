import { RaceMapper } from "@/services/openf1/race-mapper"

async function main() {
  try {
    console.log("Starting race mapping initialization...")
    
    const mapper = new RaceMapper()
    const currentYear = new Date().getFullYear()
    
    // Map races for current year and next year
    for (const season of [currentYear, currentYear + 1]) {
      console.log(`\nProcessing season ${season}...`)
      
      const results = await mapper.initializeRaceMappings(season)
      console.log(`Total races: ${results.totalRaces}`)
      console.log(`Mapped races: ${results.mappedRaces}`)
      
      // Verify the mappings
      console.log("\nVerifying mappings...")
      const verificationResults = await mapper.verifyMappings(season)
      
      console.log("\nVerification Results:")
      console.log(`Total races: ${verificationResults.total}`)
      console.log(`Mapped races: ${verificationResults.mapped}`)
      console.log(`Unmapped races: ${verificationResults.unmapped}`)
      console.log(`Verified races: ${verificationResults.verified}`)
      console.log(`Failed races: ${verificationResults.failed}`)
      
      if (verificationResults.failures.length > 0) {
        console.log("\nFailures:")
        verificationResults.failures.forEach(failure => {
          console.log(`- ${failure.name}: ${failure.reason}`)
        })
      }
    }
  } catch (error) {
    console.error("Error during race mapping initialization:", error)
    process.exit(1)
  }
}

main() 