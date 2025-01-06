import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function getFileName(url: string): Promise<string> {
  // Extract the last part of the URL after the last slash
  const parts = url.split("/")
  const lastPart = parts[parts.length - 1]
  
  // Clean the filename and ensure it ends with .png
  const cleanName = lastPart
    .replace(/[^a-zA-Z0-9-_]/g, "_") // Replace invalid characters with underscore
    .toLowerCase()
  
  return cleanName.endsWith(".png") ? cleanName : `${cleanName}.png`
}

interface Circuit {
  id: string
  track_map_url: string | null
}

async function migrateTrackMaps() {
  try {
    // Verify environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined")
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined")
    }

    // 1. Fetch all circuits with track map URLs
    const { data: circuits, error: fetchError } = await supabase
      .from("circuits")
      .select("id, track_map_url")
      .not("track_map_url", "is", null)

    if (fetchError) throw fetchError
    if (!circuits?.length) {
      console.log("No circuits with track maps found")
      return
    }

    console.log(`Found ${circuits.length} circuits with track maps`)

    // 2. Process each circuit
    for (const circuit of circuits as Circuit[]) {
      try {
        if (!circuit.track_map_url) continue

        console.log(`Processing circuit ${circuit.id}...`)
        console.log(`Current URL: ${circuit.track_map_url}`)

        // Download the image
        const imageBuffer = await downloadImage(circuit.track_map_url)
        const fileName = await getFileName(circuit.track_map_url)

        console.log(`Uploading as: ${fileName}`)

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("circuit_maps")
          .upload(fileName, imageBuffer, {
            contentType: "image/png",
            upsert: true
          })

        if (uploadError) throw uploadError

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from("circuit_maps")
          .getPublicUrl(fileName)

        // Update the circuit record with the new URL
        const { error: updateError } = await supabase
          .from("circuits")
          .update({ track_map_url: publicUrlData.publicUrl })
          .eq("id", circuit.id)

        if (updateError) throw updateError

        console.log(`Successfully processed ${fileName}`)
        console.log(`New URL: ${publicUrlData.publicUrl}`)
        console.log("---")
      } catch (error) {
        console.error(`Error processing circuit ${circuit.id}:`, error)
        console.error("---")
      }
    }

    console.log("Migration completed")
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

// Run the migration
migrateTrackMaps() 