import { writeFileSync } from "fs"
import { join } from "path"
import { db } from "@/db/db"
import { racesTable } from "@/db/schema"
import { desc, isNotNull } from "drizzle-orm"

// Static routes with their configurations
const staticRoutes = [
  { path: "", changefreq: "daily", priority: "1.0" },
  { path: "about", changefreq: "monthly", priority: "0.8" },
  { path: "contact", changefreq: "monthly", priority: "0.7" },
  { path: "help", changefreq: "weekly", priority: "0.8" },
  { path: "privacy", changefreq: "monthly", priority: "0.5" },
  { path: "terms", changefreq: "monthly", priority: "0.5" },
  { path: "races", changefreq: "daily", priority: "1.0" },
  { path: "races/map", changefreq: "daily", priority: "0.9" },
  { path: "flights", changefreq: "daily", priority: "0.9" }
]

function generateSitemapXML(
  baseUrl: string,
  staticRoutes: Array<{
    path: string
    changefreq: string
    priority: string
  }>,
  races: Array<{ slug: string }>
) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  // Add static routes
  for (const route of staticRoutes) {
    xml += "  <url>\n"
    xml += `    <loc>${baseUrl}/${route.path}</loc>\n`
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`
    xml += `    <priority>${route.priority}</priority>\n`
    xml += "  </url>\n"
  }

  // Add dynamic race routes
  for (const race of races) {
    // Main race page
    xml += "  <url>\n"
    xml += `    <loc>${baseUrl}/races/${race.slug}</loc>\n`
    xml += "    <changefreq>weekly</changefreq>\n"
    xml += "    <priority>0.9</priority>\n"
    xml += "  </url>\n"

    // Race history page
    xml += "  <url>\n"
    xml += `    <loc>${baseUrl}/races/${race.slug}/history</loc>\n`
    xml += "    <changefreq>monthly</changefreq>\n"
    xml += "    <priority>0.8</priority>\n"
    xml += "  </url>\n"
  }

  xml += "</urlset>"
  return xml
}

async function main() {
  try {
    // Get all races with non-null slugs
    const queryResult = await db
      .select({
        slug: racesTable.slug
      })
      .from(racesTable)
      .where(isNotNull(racesTable.slug))
      .orderBy(desc(racesTable.date))

    // Filter out any potential null slugs and cast to the correct type
    const races = queryResult.filter((race): race is { slug: string } => 
      typeof race.slug === "string"
    )

    // Generate sitemap XML
    const baseUrl = "https://pitlanetravel.com" // Change this to your actual domain
    const xml = generateSitemapXML(baseUrl, staticRoutes, races)

    // Write to file
    const filePath = join(process.cwd(), "public", "sitemap.xml")
    writeFileSync(filePath, xml)

    console.log("✅ Successfully generated sitemap.xml")
  } catch (error) {
    console.error("❌ Error generating sitemap:", error)
    process.exit(1)
  }
}

// Only run if called directly (not imported)
if (require.main === module) {
  main()
} 