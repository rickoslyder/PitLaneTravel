const projectId = process.env.SUPABASE_PROJECT_ID || "vsszkzazjhvlecyryzon"

export default function supabaseLoader({ src, width, height, quality }) {
  if (height && width) {
    return `https://${projectId}.supabase.co/storage/v1/render/image/public/${src}?height=${height}&width=${width}&quality=${quality || 75}`
  } else if (height) {
    return `https://${projectId}.supabase.co/storage/v1/render/image/public/${src}?height=${height}&quality=${quality || 75}`
  } else if (width) {
    return `https://${projectId}.supabase.co/storage/v1/render/image/public/${src}?width=${width}&quality=${quality || 75}`
  } else {
    return `https://${projectId}.supabase.co/storage/v1/object/public/${src}`
  }
}
