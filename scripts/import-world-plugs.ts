import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import { parse } from "csv-parse"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface WorldPlug {
  country_code: string
  frequency: string
  name: string
  plug_type: string
  voltage: string
  image_url: string
}

function formatPlugType(plugType: string): string {
  // Convert "Type A" to "type-A"
  const matches = plugType.match(/Type\s+([A-Z])/i)
  if (!matches) return plugType.toLowerCase()
  return `type-${matches[1]}`
}

async function importWorldPlugs() {
  try {
    // Read the CSV file
    const csvFilePath = path.join(process.cwd(), "world-plugs.csv")
    const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" })

    // Parse CSV data
    const records: WorldPlug[] = []
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    // Get the public URL for the assets bucket
    const { data: { publicUrl } } = supabase.storage
      .from("assets")
      .getPublicUrl("plug-type-images/type-a.jpg") // Using type-a as a reference
    
    // Extract the base URL
    const baseUrl = publicUrl.split("plug-type-images/")[0] + "plug-type-images/"

    for await (const record of parser) {
      const formattedType = formatPlugType(record.plug_type)
      records.push({
        country_code: record.country_code,
        frequency: record.frequency,
        name: record.name,
        plug_type: record.plug_type,
        voltage: record.voltage,
        image_url: `${baseUrl}${formattedType}.jpg`
      })
    }

    // Insert data in batches
    const batchSize = 100
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      const { error } = await supabase.from("world_plugs").insert(batch)
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
      } else {
        console.log(`Successfully inserted batch ${i / batchSize + 1}`)
      }
    }

    console.log("Data import completed successfully")
  } catch (error) {
    console.error("Error importing data:", error)
  }
}

// Run the import
importWorldPlugs() 