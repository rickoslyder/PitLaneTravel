import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createStorage() {
  try {
    // Create assets bucket if it doesn't exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      throw bucketsError
    }

    const assetsBucket = buckets.find(b => b.name === "assets")
    if (!assetsBucket) {
      const { error: createError } = await supabase.storage.createBucket("assets", {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png"],
        fileSizeLimit: 5242880 // 5MB
      })

      if (createError) {
        throw createError
      }
      console.log("Created assets bucket")
    } else {
      console.log("Assets bucket already exists")
    }

    // Create an empty file to establish the plug-type-images folder
    const { error: uploadError } = await supabase.storage
      .from("assets")
      .upload("plug-type-images/.keep", new Uint8Array(0), {
        upsert: true
      })

    if (uploadError && uploadError.message !== "The resource already exists") {
      throw uploadError
    }
    console.log("Created plug-type-images folder")

    console.log("Storage setup completed successfully")
  } catch (error) {
    console.error("Error setting up storage:", error)
  }
}

// Run the script
createStorage() 