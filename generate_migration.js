const fs = require("fs")
const crypto = require("crypto")

// Read the database dump
const dumpData = JSON.parse(fs.readFileSync("database_dump.json", "utf8"))

// Extract races data
const races = dumpData.races

// Helper function to escape SQL strings
function escapeSql(str) {
  if (str === null || str === undefined) return "'unknown'"
  return `'${str.toString().replace(/'/g, "''")}'`
}

// Helper function to handle null values for numbers
function handleNull(value) {
  return value === null || value === undefined ? "NULL" : value
}

// Helper function to generate deterministic UUIDs
function generateUUID(key) {
  const hash = crypto.createHash("sha1").update(key).digest("hex")
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`
}

// Generate SQL commands
let sql = ""

// Insert circuits first
const circuits = new Map()
races.forEach(race => {
  const circuitId = generateUUID(`circuit_${race.id}`)
  if (!circuits.has(circuitId)) {
    circuits.set(circuitId, {
      id: circuitId,
      name: race.circuit,
      location: `${race.city || race.circuit}, ${race.country}`,
      country: race.country,
      latitude: parseFloat(race.latitude),
      longitude: parseFloat(race.longitude),
      image_url: race.image_url
    })
  }
})

circuits.forEach(circuit => {
  sql += `INSERT INTO "public"."circuits" ("id", "name", "location", "country", "latitude", "longitude", "image_url") VALUES (${escapeSql(circuit.id)}, ${escapeSql(circuit.name)}, ${escapeSql(circuit.location)}, ${escapeSql(circuit.country)}, ${circuit.latitude}, ${circuit.longitude}, ${escapeSql(circuit.image_url)});\n`
})

// Insert races
races.forEach(race => {
  const circuitId = generateUUID(`circuit_${race.id}`)
  const raceId = generateUUID(`race_${race.id}`)
  sql += `INSERT INTO "public"."races" ("id", "circuit_id", "name", "date", "season", "round", "country", "status", "slug", "is_sprint_weekend", "description", "weekend_start", "weekend_end") VALUES (${escapeSql(raceId)}, ${escapeSql(circuitId)}, ${escapeSql(race.name)}, ${escapeSql(race.date)}, ${race.date.split("-")[0]}, ${race.id}, ${escapeSql(race.country)}, ${escapeSql(race.status || "upcoming")}, ${escapeSql(race.slug)}, ${race.is_sprint_weekend}, ${escapeSql(race.description)}, ${escapeSql(race.weekend_start)}, ${escapeSql(race.weekend_end)});\n`

  // Insert circuit details if available
  if (race.circuit_info) {
    const length = parseFloat(race.circuit_info.length.replace(" km", ""))
    sql += `INSERT INTO "public"."circuit_details" ("id", "circuit_id", "length", "corners", "drs_zones", "lap_record_time", "lap_record_year", "lap_record_driver") VALUES (${escapeSql(generateUUID(`circuit_details_${race.id}`))}, ${escapeSql(circuitId)}, ${length}, ${race.circuit_info.corners}, ${race.circuit_info.drsZones}, ${escapeSql(race.circuit_info.lapRecord?.time)}, ${handleNull(race.circuit_info.lapRecord?.year)}, ${escapeSql(race.circuit_info.lapRecord?.driver)});\n`
  }

  // Insert local attractions if available
  if (race.local_attractions && race.local_attractions.length > 0) {
    race.local_attractions.forEach((attraction, index) => {
      sql += `INSERT INTO "public"."local_attractions" ("id", "circuit_id", "name", "description") VALUES (${escapeSql(generateUUID(`local_attraction_${race.id}_${index}`))}, ${escapeSql(circuitId)}, ${escapeSql(attraction.name)}, ${escapeSql(attraction.description)});\n`
    })
  }

  // Insert transport info if available
  if (race.transport_info) {
    Object.entries(race.transport_info).forEach(([type, info], index) => {
      sql += `INSERT INTO "public"."transport_info" ("id", "circuit_id", "type", "name", "description") VALUES (${escapeSql(generateUUID(`transport_info_${race.id}_${index}`))}, ${escapeSql(circuitId)}, ${escapeSql(type)}, ${escapeSql(type)}, ${escapeSql(info)});\n`
    })
  }

  // Insert airports if available
  if (race.nearest_airports && race.nearest_airports.length > 0) {
    race.nearest_airports.forEach((airport, index) => {
      const distance = parseFloat(airport.distance.replace("km", ""))
      sql += `INSERT INTO "public"."airports" ("id", "circuit_id", "code", "name", "distance", "transfer_time") VALUES (${escapeSql(generateUUID(`airport_${race.id}_${index}`))}, ${escapeSql(circuitId)}, ${escapeSql(airport.code)}, ${escapeSql(airport.name)}, ${distance}, ${escapeSql(airport.transferTime || "30-45 minutes")});\n`
    })
  }

  // Insert supporting series if available
  if (race.supporting_series && race.supporting_series.length > 0) {
    race.supporting_series.forEach((series, index) => {
      sql += `INSERT INTO "public"."supporting_series" ("id", "race_id", "series", "round") VALUES (${escapeSql(generateUUID(`supporting_series_${race.id}_${index}`))}, ${escapeSql(raceId)}, ${escapeSql(series.series)}, ${series.round});\n`
    })
  }

  // Insert podium results if available
  if (race.last_year_podium && race.last_year_podium.length > 0) {
    race.last_year_podium.forEach((result, index) => {
      sql += `INSERT INTO "public"."podium_results" ("id", "circuit_id", "position", "driver", "team", "year") VALUES (${escapeSql(generateUUID(`podium_result_${race.id}_${index}`))}, ${escapeSql(circuitId)}, ${result.position}, ${escapeSql(result.driver)}, ${escapeSql(result.team)}, ${race.date.split("-")[0] - 1});\n`
    })
  }
})

// Write the SQL to a migration file
fs.writeFileSync("supabase/migrations/20241226013906_insert_circuits.sql", sql)
