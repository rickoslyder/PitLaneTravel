const projectId = process.env.SUPABASE_PROJECT_ID || "vsszkzazjhvlecyryzon"

/**
 * Public object URL. The Storage image-transform endpoint
 * (`/storage/v1/render/image/...`) is not enabled on this project: it returns
 * 403 FeatureNotEnabled, and next/image then surfaces that as a 502
 * (OPTIMIZED_EXTERNAL_IMAGE_REQUEST_UNAUTHORIZED). Width, height, and quality
 * are ignored here; next/image resizes the object itself.
 *
 * @param {{ src: string, width?: number, height?: number, quality?: number }} params
 */
export default function supabaseLoader({ src, width, height, quality }) {
  void width
  void height
  void quality
  return `https://${projectId}.supabase.co/storage/v1/object/public/${src}`
}
