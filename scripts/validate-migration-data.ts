import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { DatabaseDump, Race, ValidationError } from './types'

class DataValidator {
  private errors: ValidationError[] = []

  constructor(private data: DatabaseDump) {}

  private addError(message: string, details?: any) {
    this.errors.push({
      type: 'error',
      message,
      details
    })
  }

  private addWarning(message: string, details?: any) {
    this.errors.push({
      type: 'warning',
      message,
      details
    })
  }

  private validateRace(race: Race) {
    // Required fields
    if (!race.name) this.addError(`Race missing name`, { id: race.id })
    if (!race.circuit) this.addError(`Race missing circuit`, { id: race.id })
    if (!race.country) this.addError(`Race missing country`, { id: race.id })
    if (!race.date) this.addError(`Race missing date`, { id: race.id })
    if (!race.city) this.addError(`Race missing city`, { id: race.id })
    if (!race.latitude) this.addError(`Race missing latitude`, { id: race.id })
    if (!race.longitude) this.addError(`Race missing longitude`, { id: race.id })

    // Date format
    try {
      new Date(race.date).toISOString()
      if (race.weekend_start) new Date(race.weekend_start).toISOString()
      if (race.weekend_end) new Date(race.weekend_end).toISOString()
    } catch (e) {
      this.addError(`Invalid date format`, { id: race.id })
    }

    // Coordinates
    const lat = parseFloat(race.latitude)
    const lon = parseFloat(race.longitude)
    if (isNaN(lat) || lat < -90 || lat > 90) {
      this.addError(`Invalid latitude: ${race.latitude}`, { id: race.id })
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      this.addError(`Invalid longitude: ${race.longitude}`, { id: race.id })
    }

    // Circuit info
    if (race.circuit_info) {
      const { length, corners, drsZones } = race.circuit_info
      if (!length) {
        this.addWarning(`Circuit missing length`, { id: race.id })
      }
      if (typeof corners !== 'number' || corners < 0) {
        this.addError(`Invalid corners count: ${corners}`, { id: race.id })
      }
      if (typeof drsZones !== 'number' || drsZones < 0) {
        this.addError(`Invalid DRS zones count: ${drsZones}`, { id: race.id })
      }
    }

    // Airports
    if (race.nearest_airports?.length) {
      race.nearest_airports.forEach(airport => {
        if (!airport.code) this.addError(`Airport missing code`, { id: race.id })
        if (!airport.name) this.addError(`Airport missing name`, { id: race.id })
        if (!airport.distance) this.addWarning(`Airport missing distance`, { id: race.id })
      })
    }

    // Local attractions
    if (race.local_attractions?.length) {
      race.local_attractions.forEach(attraction => {
        if (!attraction.name) this.addError(`Attraction missing name`, { id: race.id })
        if (!attraction.description) this.addWarning(`Attraction missing description`, { id: race.id })
      })
    }

    // Supporting series
    if (race.supporting_series?.length) {
      race.supporting_series.forEach(series => {
        if (!series.series) this.addError(`Supporting series missing name`, { id: race.id })
        if (typeof series.round !== 'number' || series.round < 1) {
          this.addError(`Invalid supporting series round: ${series.round}`, { id: race.id })
        }
      })
    }

    // Podium results
    if (race.last_year_podium?.length) {
      race.last_year_podium.forEach(podium => {
        if (!podium.driver) this.addError(`Podium missing driver`, { id: race.id })
        if (!podium.team) this.addError(`Podium missing team`, { id: race.id })
        if (typeof podium.position !== 'number' || podium.position < 1 || podium.position > 3) {
          this.addError(`Invalid podium position: ${podium.position}`, { id: race.id })
        }
      })
    }

    // Status
    if (!['upcoming', 'in_progress', 'completed', 'cancelled'].includes(race.status)) {
      this.addError(`Invalid status: ${race.status}`, { id: race.id })
    }
  }

  public validate() {
    // Check if races array exists
    if (!Array.isArray(this.data.races)) {
      this.addError('Invalid data: races must be an array')
      return this.errors
    }

    // Check if races array is empty
    if (this.data.races.length === 0) {
      this.addError('No races found in data')
      return this.errors
    }

    // Validate each race
    this.data.races.forEach(this.validateRace.bind(this))

    return this.errors
  }

  public printResults() {
    const errors = this.errors.filter(e => e.type === 'error')
    const warnings = this.errors.filter(e => e.type === 'warning')

    if (errors.length > 0) {
      console.log(chalk.red('\n✗ Found validation errors:'))
      errors.forEach(error => {
        console.log(chalk.red(`  • ${error.message}`))
        if (error.details) {
          console.log(chalk.gray(`    ${JSON.stringify(error.details)}`))
        }
      })
    }

    if (warnings.length > 0) {
      console.log(chalk.yellow('\n⚠ Found validation warnings:'))
      warnings.forEach(warning => {
        console.log(chalk.yellow(`  • ${warning.message}`))
        if (warning.details) {
          console.log(chalk.gray(`    ${JSON.stringify(warning.details)}`))
        }
      })
    }

    if (errors.length === 0 && warnings.length === 0) {
      console.log(chalk.green('\n✓ All validation checks passed!\n'))
    }

    return errors.length === 0
  }
}

// Main execution
try {
  const rawData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'database_dump.json'), 'utf-8')
  )

  // Extract only the races data, ignoring users, price_alerts, and saved_searches
  const data: DatabaseDump = { 
    races: rawData.races.filter((race: any) => race && race.circuit && race.city) 
  }

  const validator = new DataValidator(data)
  validator.validate()
  const passed = validator.printResults()

  if (!passed) {
    process.exit(1)
  }
} catch (error) {
  console.error(chalk.red('\n✗ Failed to validate data:'), error)
  process.exit(1)
} 