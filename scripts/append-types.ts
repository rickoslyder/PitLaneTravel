import fs from 'fs'
import path from 'path'

const databaseTypesPath = path.join(process.cwd(), 'types', 'database.ts')

// Check if file exists and was modified in the last 5 seconds
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

  const customTypes = `
export type RaceWithCircuit = Database["public"]["Tables"]["races"]["Row"] & {
  circuit: Database["public"]["Tables"]["circuits"]["Row"] | null
}

export type RaceWithCircuitAndSeries = RaceWithCircuit & {
  supporting_series?: Database["public"]["Tables"]["supporting_series"]["Row"][]
}
`

  fs.appendFileSync(databaseTypesPath, customTypes)
  console.log('✨ Custom types appended successfully')

} catch (error) {
  console.error('❌ Error: Could not find or access database.ts file')
  process.exit(1)
} 