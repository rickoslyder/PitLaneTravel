/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    DUFFEL_ACCESS_TOKEN: process.env.DUFFEL_ACCESS_TOKEN
  }
}

module.exports = nextConfig

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vsszkzazjhvlecyryzon.supabase.co",
        pathname: "/storage/v1/render/image/public/**"
      }
    ]
  }
}
