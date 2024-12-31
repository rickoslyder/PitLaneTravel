import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import { parse } from "csv-parse"
import axios from "axios"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Create temp directory for downloads if it doesn't exist
const tempDir = path.join(process.cwd(), "temp")
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir)
}

function formatPlugType(plugType: string): string {
  // Convert "Type A" to "type-A"
  const matches = plugType.match(/Type\s+([A-Z])/i)
  if (!matches) return plugType.toLowerCase()
  return `type-${matches[1]}`
}

async function downloadImage(plugType: string): Promise<string> {
  const formattedType = formatPlugType(plugType)
  const imageUrl = `https://www.worldstandards.eu/wp-content/uploads/electricity-tiles-${formattedType}.jpg`
  const response = await axios({
    url: imageUrl,
    method: "GET",
    responseType: "stream"
  })

  const filePath = path.join(tempDir, `${formattedType}.jpg`)
  const writer = fs.createWriteStream(filePath)

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(filePath))
    writer.on("error", reject)
  })
}

async function uploadToSupabase(filePath: string, fileName: string) {
  const fileBuffer = fs.readFileSync(filePath)
  
  const { error } = await supabase.storage
    .from("assets")
    .upload(`plug-type-images/${fileName}`, fileBuffer, {
      contentType: "image/jpeg",
      upsert: true
    })

  if (error) {
    throw error
  }

  console.log(`Successfully uploaded ${fileName}`)
}

async function processPlugTypes() {
  try {
    // Read the CSV file
    const csvFilePath = path.join(process.cwd(), "world-plugs.csv")
    const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" })

    // Parse CSV data
    const records: Set<string> = new Set()
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    // Get unique plug types
    for await (const record of parser) {
      records.add(record.plug_type)
    }

    // Process each unique plug type
    for (const plugType of records) {
      try {
        console.log(`Processing plug type ${plugType}...`)
        const filePath = await downloadImage(plugType)
        const formattedType = formatPlugType(plugType)
        await uploadToSupabase(filePath, `${formattedType}.jpg`)
        
        // Clean up temp file
        fs.unlinkSync(filePath)
      } catch (error) {
        console.error(`Error processing plug type ${plugType}:`, error)
      }
    }

    // Clean up temp directory
    fs.rmdirSync(tempDir)
    
    console.log("All plug type images processed successfully")
  } catch (error) {
    console.error("Error processing plug types:", error)
  }
}

// Run the script
processPlugTypes() 