import { CircuitMapper } from "@/services/openf1/circuit-mapper"
import { RaceMapper } from "@/services/openf1/race-mapper"
import { SupportingSeriesMapper } from "@/services/openf1/supporting-series-mapper"

async function main() {
  try {
    const currentYear = new Date().getFullYear()
    const seasons = [currentYear, currentYear + 1]

    // Step 1: Initialize Circuit Mappings
    console.log("\n=== Initializing Circuit Mappings ===")
    const circuitMapper = new CircuitMapper()
    const circuitResults = await circuitMapper.initializeCircuitMappings()
    console.log(`Total circuits: ${circuitResults.totalCircuits}`)
    console.log(`Mapped circuits: ${circuitResults.mappedCircuits}`)

    const circuitVerification = await circuitMapper.verifyMappings()
    console.log("\nCircuit Verification Results:")
    console.log(`Total circuits: ${circuitVerification.total}`)
    console.log(`Mapped circuits: ${circuitVerification.mapped}`)
    console.log(`Unmapped circuits: ${circuitVerification.unmapped}`)
    console.log(`Verified circuits: ${circuitVerification.verified}`)
    console.log(`Failed circuits: ${circuitVerification.failed}`)

    if (circuitVerification.failures.length > 0) {
      console.log("\nCircuit Mapping Failures:")
      circuitVerification.failures.forEach(failure => {
        console.log(`- ${failure.name}: ${failure.reason}`)
      })
    }

    // Step 2: Initialize Race Mappings
    console.log("\n=== Initializing Race Mappings ===")
    const raceMapper = new RaceMapper()
    
    for (const season of seasons) {
      console.log(`\nProcessing season ${season}...`)
      const raceResults = await raceMapper.initializeRaceMappings(season)
      console.log(`Total races: ${raceResults.totalRaces}`)
      console.log(`Mapped races: ${raceResults.mappedRaces}`)

      const raceVerification = await raceMapper.verifyMappings(season)
      console.log("\nRace Verification Results:")
      console.log(`Total races: ${raceVerification.total}`)
      console.log(`Mapped races: ${raceVerification.mapped}`)
      console.log(`Unmapped races: ${raceVerification.unmapped}`)
      console.log(`Verified races: ${raceVerification.verified}`)
      console.log(`Failed races: ${raceVerification.failed}`)

      if (raceVerification.failures.length > 0) {
        console.log("\nRace Mapping Failures:")
        raceVerification.failures.forEach(failure => {
          console.log(`- ${failure.name}: ${failure.reason}`)
        })
      }
    }

    // Step 3: Initialize Supporting Series Mappings
    console.log("\n=== Initializing Supporting Series Mappings ===")
    const supportingSeriesMapper = new SupportingSeriesMapper()
    
    for (const season of seasons) {
      console.log(`\nProcessing season ${season}...`)
      const seriesResults = await supportingSeriesMapper.initializeSupportingSeriesMappings(season)
      console.log(`Total supporting series: ${seriesResults.totalSeries}`)
      console.log(`Mapped supporting series: ${seriesResults.mappedSeries}`)

      const seriesVerification = await supportingSeriesMapper.verifyMappings(season)
      console.log("\nSupporting Series Verification Results:")
      console.log(`Total series: ${seriesVerification.total}`)
      console.log(`Mapped series: ${seriesVerification.mapped}`)
      console.log(`Unmapped series: ${seriesVerification.unmapped}`)
      console.log(`Verified series: ${seriesVerification.verified}`)
      console.log(`Failed series: ${seriesVerification.failed}`)

      if (seriesVerification.failures.length > 0) {
        console.log("\nSupporting Series Mapping Failures:")
        seriesVerification.failures.forEach(failure => {
          console.log(`- ${failure.name}: ${failure.reason}`)
        })
      }
    }

    console.log("\n=== OpenF1 Mapping Initialization Complete ===")
  } catch (error) {
    console.error("Error during OpenF1 mapping initialization:", error)
    process.exit(1)
  }
}

main() 