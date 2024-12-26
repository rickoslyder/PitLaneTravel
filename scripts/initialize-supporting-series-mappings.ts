import { SupportingSeriesMapper } from "@/services/openf1/supporting-series-mapper"

async function main() {
  try {
    console.log("Starting supporting series mapping initialization...")
    
    const mapper = new SupportingSeriesMapper()
    const currentYear = new Date().getFullYear()
    
    // Map supporting series for current year and next year
    for (const season of [currentYear, currentYear + 1]) {
      console.log(`\nProcessing season ${season}...`)
      
      const results = await mapper.initializeSupportingSeriesMappings(season)
      console.log(`Total supporting series: ${results.totalSeries}`)
      console.log(`Mapped supporting series: ${results.mappedSeries}`)
      
      // Verify the mappings
      console.log("\nVerifying mappings...")
      const verificationResults = await mapper.verifyMappings(season)
      
      console.log("\nVerification Results:")
      console.log(`Total series: ${verificationResults.total}`)
      console.log(`Mapped series: ${verificationResults.mapped}`)
      console.log(`Unmapped series: ${verificationResults.unmapped}`)
      console.log(`Verified series: ${verificationResults.verified}`)
      console.log(`Failed series: ${verificationResults.failed}`)
      
      if (verificationResults.failures.length > 0) {
        console.log("\nFailures:")
        verificationResults.failures.forEach(failure => {
          console.log(`- ${failure.name}: ${failure.reason}`)
        })
      }
    }
  } catch (error) {
    console.error("Error during supporting series mapping initialization:", error)
    process.exit(1)
  }
}

main() 