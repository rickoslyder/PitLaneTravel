import { CircuitMapper } from "@/services/openf1/circuit-mapper"

async function main() {
  try {
    console.log("Starting circuit mapping initialization...")
    
    const mapper = new CircuitMapper()
    const results = await mapper.initializeCircuitMappings()
    
    console.log("Circuit mapping initialization complete!")
    console.log(`Total circuits: ${results.totalCircuits}`)
    console.log(`Mapped circuits: ${results.mappedCircuits}`)
    
    // Verify the mappings
    console.log("\nVerifying mappings...")
    const verificationResults = await mapper.verifyMappings()
    
    console.log("\nVerification Results:")
    console.log(`Total circuits: ${verificationResults.total}`)
    console.log(`Mapped circuits: ${verificationResults.mapped}`)
    console.log(`Unmapped circuits: ${verificationResults.unmapped}`)
    console.log(`Verified circuits: ${verificationResults.verified}`)
    console.log(`Failed circuits: ${verificationResults.failed}`)
    
    if (verificationResults.failures.length > 0) {
      console.log("\nFailures:")
      verificationResults.failures.forEach(failure => {
        console.log(`- ${failure.name}: ${failure.reason}`)
      })
    }
  } catch (error) {
    console.error("Error during circuit mapping initialization:", error)
    process.exit(1)
  }
}

main() 