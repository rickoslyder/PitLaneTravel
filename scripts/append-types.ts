import fs from 'fs'
import path from 'path'

const databaseTypesPath = path.join(process.cwd(), 'types', 'database.ts')

// List of imports to prepend
const imports = [
  'import { SelectCircuitLocation } from "@/db/schema/circuit-locations-schema"'
]

try {
  const stats = fs.statSync(databaseTypesPath)
  const now = new Date()
  const modifiedTime = new Date(stats.mtime)
  const timeDiff = now.getTime() - modifiedTime.getTime()
  
  // Only proceed if file was modified in the last 5 seconds
  if (timeDiff > 5000) {
    console.error('❌ Error: database.ts was not recently updated. Supabase sync may have failed.')
    process.exit(1)
  }

  console.log('✨ Supabase types generated successfully')

  // Read the existing file content
  const existingContent = fs.readFileSync(databaseTypesPath, 'utf8')

  // Prepare the new content with imports
  const newContent = `${imports.join('\n')}\n\n${existingContent}`

  // Write the combined content back to the file
  fs.writeFileSync(databaseTypesPath, newContent)
  console.log('✨ Imports prepended successfully')

  const customTypes = `
export type RaceWithCircuit = Database["public"]["Tables"]["races"]["Row"] & {
  circuit: Database["public"]["Tables"]["circuits"]["Row"] | null
}

export interface RaceWithCircuitAndSeries {
  id: string
  circuit_id: string
  name: string
  date: string
  season: number
  round: number
  country: string
  description: string | null
  weekend_start: string | null
  weekend_end: string | null
  status: "in_progress" | "upcoming" | "completed" | "cancelled"
  slug: string | null
  is_sprint_weekend: boolean
  openf1_meeting_key: number | null
  openf1_session_key: number | null
  created_at: string
  updated_at: string
  circuit: {
    id: string
    name: string
    country: string
    location: string
    latitude: number
    longitude: number
    image_url: string | null
    track_map_url: string | null
    openf1_key: number | null
    openf1_short_name: string | null
    timezone_id: string | null
    timezone_name: string | null
    website_url: string | null
    created_at: string
    updated_at: string
    locations?: SelectCircuitLocation[]
  } | null
  supporting_series: Array<{
    id: string
    race_id: string
    series: string
    round: number
    created_at: string
    updated_at: string
    start_time: string | null
    end_time: string | null
    openf1_session_key: number | null
  }>
}
`

  fs.appendFileSync(databaseTypesPath, customTypes)
  console.log('✨ Custom types appended successfully')

} catch (error) {
  console.error('❌ Error: Could not find or access database.ts file')
  process.exit(1)
} 