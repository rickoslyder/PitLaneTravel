import { parseStringPromise } from "xml2js"
import fs from "fs/promises"
import path from "path"
import { db } from "@/db/db"
import { InsertTicket, ticketsTable, ticketTypeEnum } from "@/db/schema"
import { eq } from "drizzle-orm"

interface P1Product {
  brand: string[]
  categories: string[]
  categoryPath: string[]
  country: string[]
  date_start: string[]
  date_string_local_time: string[]
  description: string[]
  descriptionLong: string[]
  extraInfo: string[]
  has_hotel_option: string[]
  hotel_mandatory: string[]
  id: string[]
  imageURL: string[]
  name: string[]
  price: string[]
  price_ticket_hotel: string[]
  productURL: string[]
  subcategories: string[]
  venue_city: string[]
  venue_name: string[]
}

interface P1Feed {
  products: {
    product: P1Product[]
  }
}

interface ParsedPackage {
  type: "weekend" | "vip" | "hospitality" | "custom"
  name: string
  description: string
  basePrice: string
  currency: string
  maxQuantity: number
  tickets: Array<{
    ticketId: string // This will be filled in after ticket creation
    quantity: number
    discountPercentage?: number
  }>
  validFrom: Date
  validTo?: Date
  termsAndConditions: string
  isFeatured: boolean
}

interface ParsedTicket {
  // Ticket table fields
  raceId: string
  title: string
  description: string
  ticketType: string
  seatingDetails?: string
  availability: string
  daysIncluded: Record<string, boolean>
  isChildTicket: boolean
  resellerUrl: string
  
  // Ticket pricing fields
  pricing: {
    price: string
    currency: string
    validFrom: Date
    validTo?: Date
  }

  // Extracted features
  features: Array<{
    name: string
    category: "access" | "hospitality" | "experience"
    type: "included" | "optional" | "upgrade"
  }>

  // Modified package field to reference package ID
  packageId?: string // This will be filled in after package creation
  isMainPackageTicket?: boolean // True if this is the primary ticket in a package

  // Package grouping key (used to group related tickets)
  packageGroupKey?: string

  // Metadata (for mapping, not stored)
  venue: string
  country: string
  date: string
  time: string
}

interface RaceData {
  id: string
  name: string
  country: string
  date: string
  weekendStart: string
  weekendEnd: string
  round: number
  season: number
}

function normalizeCountry(country: string): string {
  const countryMap: Record<string, string> = {
    "United States": "USA",
    "UAE": "United Arab Emirates",
    "United Arab Emirates": "UAE",
    "The Netherlands": "Netherlands",
    "Holland": "Netherlands",
    "Brasil": "Brazil",
    "Kingdom of Saudi Arabia": "Saudi Arabia",
    "KSA": "Saudi Arabia",
    "People's Republic of China": "China",
    "Republic of Singapore": "Singapore",
    "Bahrain": "Kingdom of Bahrain",
    "Kingdom of Bahrain": "Bahrain"
  }
  return countryMap[country] || country
}

function extractGrandPrixName(title: string): string {
  // Remove year and common prefixes/suffixes
  return title
    .replace(/\d{4}/, "")
    .replace(/GP( –|-|\s)?/i, "")
    .replace(/Grand Prix( –|-|\s)?/i, "")
    .replace(/Formula 1/i, "")
    .replace(/F1/i, "")
    .trim()
}

async function mapTicketToRace(ticket: ParsedTicket, races: RaceData[]): Promise<string | null> {
  // Normalize the ticket date to match race weekend
  const ticketDate = new Date(ticket.date)
  
  // Find races that match the country and are within a week of the ticket date
  const matchingRaces = races.filter(race => {
    const raceDate = new Date(race.date)
    const daysDiff = Math.abs(ticketDate.getTime() - raceDate.getTime()) / (1000 * 60 * 60 * 24)
    
    // Check if countries match (normalized)
    const countriesMatch = normalizeCountry(race.country) === normalizeCountry(ticket.country)
    
    // Match if within 7 days and countries match
    return daysDiff <= 7 && countriesMatch
  })

  if (matchingRaces.length === 1) {
    // Perfect match found
    return matchingRaces[0].id
  }

  if (matchingRaces.length > 1) {
    // If multiple matches, try to find the closest date
    matchingRaces.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return Math.abs(ticketDate.getTime() - dateA.getTime()) - 
             Math.abs(ticketDate.getTime() - dateB.getTime())
    })
    
    console.warn(`Multiple races found for ticket: ${ticket.title}`)
    console.warn("Using closest match:", matchingRaces[0].name)
    return matchingRaces[0].id
  }

  // If no match found, try fuzzy matching on venue name
  const fuzzyMatches = races.filter(race => {
    const normalizedVenue = ticket.venue.toLowerCase()
      .replace(/grand prix/i, "")
      .replace(/circuit/i, "")
      .trim()
    
    const normalizedRaceName = race.name.toLowerCase()
      .replace(/grand prix/i, "")
      .replace(/circuit/i, "")
      .trim()
    
    return normalizedRaceName.includes(normalizedVenue) ||
           normalizedVenue.includes(normalizedRaceName)
  })

  if (fuzzyMatches.length === 1) {
    console.warn(`Found fuzzy match for ticket: ${ticket.title}`)
    console.warn("Matched with race:", fuzzyMatches[0].name)
    return fuzzyMatches[0].id
  }

  console.warn(`No race found for ticket: ${ticket.title}`)
  console.warn("Ticket details:", {
    country: ticket.country,
    date: ticket.date,
    venue: ticket.venue
  })

  return null
}

async function parseXmlFile(filePath: string): Promise<P1Feed> {
  const xmlContent = await fs.readFile(filePath, "utf-8")
  const result = await parseStringPromise(xmlContent)
  
  // Log unique brands
  const brands = new Set<string>()
  result.products.product.forEach((product: P1Product) => {
    if (product.brand?.[0]) {
      brands.add(product.brand[0])
    }
  })
  console.log("Available brands:", Array.from(brands).sort())
  
  return result as P1Feed
}

function extractDaysFromDescription(description: string): Record<string, boolean> {
  const days = {
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  }

  const desc = description.toLowerCase()
  
  // First check for explicit day mentions
  const dayPatterns = {
    thursday: /\b(?:thur(?:s|sday)?|pit\s*lane\s*walk)\b/i,
    friday: /\b(?:fri(?:day)?)\b/i,
    saturday: /\b(?:sat(?:urday)?)\b/i,
    sunday: /\b(?:sun(?:day)?)\b/i
  }

  // Check each day pattern
  Object.entries(dayPatterns).forEach(([day, pattern]) => {
    if (pattern.test(desc)) {
      days[day as keyof typeof days] = true
    }
  })

  // Handle special cases and combinations
  if (desc.includes("3-day") || desc.includes("three day") || desc.includes("3 day")) {
    // Most 3-day tickets are Fri-Sun
    days.friday = true
    days.saturday = true
    days.sunday = true
  } else if (desc.includes("4-day") || desc.includes("four day") || desc.includes("4 day")) {
    // 4-day tickets include Thursday
    days.thursday = true
    days.friday = true
    days.saturday = true
    days.sunday = true
  }

  // Handle ranges like "friday - sunday" or "friday to sunday"
  const rangeMatches = desc.match(/(?:from\s+)?(\w+)(?:\s*[-–—]\s*|\s+to\s+)(\w+)/i)
  if (rangeMatches) {
    const startDay = rangeMatches[1].toLowerCase()
    const endDay = rangeMatches[2].toLowerCase()
    
    const dayOrder = ["thursday", "friday", "saturday", "sunday"]
    const startIndex = dayOrder.findIndex(d => startDay.includes(d))
    const endIndex = dayOrder.findIndex(d => endDay.includes(d))
    
    if (startIndex !== -1 && endIndex !== -1) {
      for (let i = startIndex; i <= endIndex; i++) {
        days[dayOrder[i] as keyof typeof days] = true
      }
    }
  }

  // Handle comma-separated lists like "friday, saturday and sunday"
  const listMatch = desc.match(/\b((?:(?:mon|tues|wednes|thurs|fri|satur|sun)(?:day)?(?:\s*,\s*|\s+and\s+|\s+&\s+))+(?:(?:mon|tues|wednes|thurs|fri|satur|sun)(?:day)?))\b/i)
  if (listMatch) {
    const dayList = listMatch[1].toLowerCase()
    Object.keys(days).forEach(day => {
      if (dayList.includes(day.substring(0, 3))) {
        days[day as keyof typeof days] = true
      }
    })
  }

  // Special case: If description mentions "pit lane walk" or "pitlane walk" on Thursday
  if (desc.match(/(?:pit\s*lane\s*walk|pitlane\s*walk).*thursday/i) || 
      desc.match(/thursday.*(?:pit\s*lane\s*walk|pitlane\s*walk)/i)) {
    days.thursday = true
  }

  // Validation: If no days are set but we know it's a race ticket, default to 3-day
  const hasAnyDay = Object.values(days).some(v => v)
  if (!hasAnyDay && (
    desc.includes("grand prix") || 
    desc.includes("formula 1") || 
    desc.includes("f1") ||
    desc.includes("gp")
  )) {
    days.friday = true
    days.saturday = true
    days.sunday = true
  }

  return days
}

function extractSeatingDetails(description: string, extraInfo: string): string | undefined {
  console.log("Extracting seating details from:", {
    description,
    extraInfo
  })

  // Try to extract from extraInfo first as it's more structured
  const seatingMatch = extraInfo.match(/Seating plan: ([^|]+)/)
  if (seatingMatch) {
    console.log("Found seating details in extraInfo:", seatingMatch[1].trim())
    return seatingMatch[1].trim()
  }

  // Try to extract from description
  const desc = description.toLowerCase()
  
  // Look for specific grandstand mentions
  const grandstandMatch = desc.match(/(?:grandstand|stand|tribune)\s+([a-z0-9\s]+?)(?:\s+(?:section|block|row|seat|area|level)|[,\.]|$)/i)
  if (grandstandMatch) {
    console.log("Found grandstand details:", grandstandMatch[1].trim())
    return grandstandMatch[1].trim()
  }

  // Look for specific VIP area mentions
  const vipMatch = desc.match(/(?:vip|club)\s+([a-z0-9\s]+?)(?:\s+(?:lounge|suite|box|area|level)|[,\.]|$)/i)
  if (vipMatch) {
    console.log("Found VIP area details:", vipMatch[1].trim())
    return vipMatch[1].trim()
  }

  // Look for specific section mentions
  const sectionMatch = desc.match(/(?:section|block|area)\s+([a-z0-9\s]+?)(?:\s+(?:row|seat|level)|[,\.]|$)/i)
  if (sectionMatch) {
    console.log("Found section details:", sectionMatch[1].trim())
    return sectionMatch[1].trim()
  }

  console.log("No seating details found")
  return undefined
}

function extractTicketType(description: string, extraInfo: string): typeof ticketTypeEnum.enumValues[number] {
  const desc = description.toLowerCase()
  const extra = extraInfo.toLowerCase()
  const fullText = `${desc} ${extra}`

  // Check for VIP tickets first (most specific)
  if (
    fullText.includes("paddock club") || 
    fullText.includes("vip hospitality") || 
    fullText.includes("vip lounge") ||
    fullText.includes("vip suite") ||
    fullText.includes("vip terrace") ||
    fullText.includes("vip package") ||
    // Check for combinations of VIP indicators
    (fullText.includes("vip") && (
      fullText.includes("hospitality") ||
      fullText.includes("access") ||
      fullText.includes("exclusive")
    ))
  ) {
    return "vip"
  }

  // Check for grandstand tickets
  if (
    fullText.includes("grandstand") || 
    fullText.includes("tribune") || 
    fullText.includes("covered seating") ||
    fullText.includes("numbered seat") ||
    // Look for specific grandstand indicators
    /(?:stand|tribune)\s+[a-z0-9]+/i.test(fullText) ||
    // Check for section/block indicators that imply grandstand
    /(?:section|block)\s+[a-z0-9]+/i.test(fullText) ||
    // Check for row/seat numbers
    /(?:row|seat)\s+[a-z0-9]+/i.test(fullText)
  ) {
    return "grandstand"
  }

  // Default to general admission
  // This includes standing areas, general access, and any ticket
  // that doesn't explicitly mention grandstand or VIP features
  return "general_admission"
}

function isF1Product(product: P1Product): boolean {
  const brand = product.brand?.[0] || ""
  return (
    brand.includes("Grand Prix") || // Matches "Grand Prix Bahrain", etc.
    brand.includes("FORMULA 1") || // Matches "FORMULA 1 AUSTRALIAN GRAND PRIX 2025"
    (product.subcategories?.[0] || "").toLowerCase().includes("formula 1") // Check subcategories
  )
}

function extractFeatures(description: string): ParsedTicket["features"] {
  const features: ParsedTicket["features"] = []
  const desc = description.toLowerCase()

  // Access Features
  if (desc.includes("trackside view") || desc.includes("track view")) {
    features.push({
      name: "Trackside Views",
      category: "access",
      type: "included"
    })
  }
  
  if (desc.includes("paddock")) {
    features.push({
      name: "Paddock Access",
      category: "access",
      type: "included"
    })
  }

  if (desc.includes("pit lane")) {
    features.push({
      name: "Pit Lane Access",
      category: "access",
      type: "included"
    })
  }

  if (desc.includes("vip")) {
    features.push({
      name: "VIP Access",
      category: "access",
      type: "included"
    })
  }

  if (desc.includes("giant screen") || desc.includes("big screen")) {
    features.push({
      name: "Giant Screen Views",
      category: "access",
      type: "included"
    })
  }

  if (desc.includes("reserved seat") || desc.includes("assigned seat")) {
    features.push({
      name: "Reserved Seating",
      category: "access",
      type: "included"
    })
  }

  if (desc.includes("covered") || desc.includes("roofed") || desc.includes("shelter")) {
    features.push({
      name: "Covered Seating",
      category: "access",
      type: "included"
    })
  }

  if (desc.includes("rooftop") || desc.includes("roof top")) {
    features.push({
      name: "Rooftop Views",
      category: "access",
      type: "included"
    })
  }

  if (desc.includes("start/finish") || desc.includes("start-finish") || desc.includes("starting grid")) {
    features.push({
      name: "Start/Finish Line Views",
      category: "access",
      type: "included"
    })
  }

  if (desc.includes("elevated") || desc.includes("raised") || desc.includes("upper")) {
    features.push({
      name: "Elevated Views",
      category: "access",
      type: "included"
    })
  }

  if (desc.includes("corner view") || desc.includes("turn view")) {
    features.push({
      name: "Corner Views",
      category: "access",
      type: "included"
    })
  }

  if (desc.includes("straight view") || desc.includes("straight line")) {
    features.push({
      name: "Straight Views",
      category: "access",
      type: "included"
    })
  }

  // Hospitality Features
  if (desc.includes("open bar") || desc.includes("drinks included") || desc.includes("complimentary drink")) {
    features.push({
      name: "Open Bar",
      category: "hospitality",
      type: "included"
    })
  }

  if (desc.includes("gourmet") || desc.includes("cuisine") || desc.includes("catering") || desc.includes("fine dining")) {
    features.push({
      name: "Gourmet Dining",
      category: "hospitality",
      type: "included"
    })
  }

  if (desc.includes("lounge")) {
    features.push({
      name: "Lounge Access",
      category: "hospitality",
      type: "included"
    })
  }

  if (desc.includes("suite") || desc.includes("box")) {
    features.push({
      name: "Private Suite",
      category: "hospitality",
      type: "included"
    })
  }

  if (desc.includes("air condition") || desc.includes("climate control")) {
    features.push({
      name: "Air Conditioning",
      category: "hospitality",
      type: "included"
    })
  }

  if (desc.includes("dedicated host") || desc.includes("personal host") || desc.includes("dedicated staff")) {
    features.push({
      name: "Dedicated Host",
      category: "hospitality",
      type: "included"
    })
  }

  if (desc.includes("welcome gift") || desc.includes("gift pack") || desc.includes("merchandise pack")) {
    features.push({
      name: "Welcome Gift",
      category: "hospitality",
      type: "included"
    })
  }

  if (desc.includes("breakfast") || desc.includes("lunch") || desc.includes("dinner")) {
    features.push({
      name: "Meal Service",
      category: "hospitality",
      type: "included"
    })
  }

  if (desc.includes("wifi") || desc.includes("internet") || desc.includes("wi-fi")) {
    features.push({
      name: "WiFi Access",
      category: "hospitality",
      type: "included"
    })
  }

  if (desc.includes("champagne") || desc.includes("prosecco") || desc.includes("sparkling wine")) {
    features.push({
      name: "Champagne Service",
      category: "hospitality",
      type: "included"
    })
  }

  if (desc.includes("premium seat") || desc.includes("luxury seat") || desc.includes("comfort seat")) {
    features.push({
      name: "Premium Seating",
      category: "hospitality",
      type: "included"
    })
  }

  // Experience Features
  if (desc.includes("garage tour") || desc.includes("garage visit")) {
    features.push({
      name: "Garage Tour",
      category: "experience",
      type: "included"
    })
  }

  if (desc.includes("driver") && (desc.includes("meet") || desc.includes("interaction") || desc.includes("appearance"))) {
    features.push({
      name: "Driver Interaction",
      category: "experience",
      type: "included"
    })
  }

  if (desc.includes("photo") || desc.includes("photograph")) {
    features.push({
      name: "Photo Opportunities",
      category: "experience",
      type: "included"
    })
  }

  if (desc.includes("team merch") || desc.includes("team gear") || desc.includes("official merchandise")) {
    features.push({
      name: "Team Merchandise",
      category: "experience",
      type: "included"
    })
  }

  if (desc.includes("commentary") || desc.includes("expert insight") || desc.includes("technical insight")) {
    features.push({
      name: "Expert Commentary",
      category: "experience",
      type: "included"
    })
  }

  if (desc.includes("transfer") || desc.includes("shuttle") || desc.includes("transport")) {
    features.push({
      name: "Transfer Service",
      category: "experience",
      type: "included"
    })
  }

  if (desc.includes("exclusive access") || desc.includes("behind the scenes")) {
    features.push({
      name: "Behind-the-Scenes Access",
      category: "experience",
      type: "included"
    })
  }

  if (desc.includes("pit walk") || desc.includes("pitlane walk")) {
    features.push({
      name: "Pit Walk",
      category: "experience",
      type: "included"
    })
  }

  if (desc.includes("q&a") || desc.includes("question and answer") || desc.includes("q & a")) {
    features.push({
      name: "Q&A Sessions",
      category: "experience",
      type: "included"
    })
  }

  if (desc.includes("trophy") || desc.includes("podium") || desc.includes("victory ceremony")) {
    features.push({
      name: "Podium View",
      category: "experience",
      type: "included"
    })
  }

  if (desc.includes("live timing") || desc.includes("race data") || desc.includes("telemetry")) {
    features.push({
      name: "Live Race Data",
      category: "experience",
      type: "included"
    })
  }

  return features
}

function cleanDescription(description: string): string {
  return description
    .replace(/P1 Travel gives you the chance to visit your favorite sports or music event anywhere in the world\. We assure you of the best experience possible, thanks to our official partnerships with the largest international football clubs, event venues and sporting tournaments\. By offering a wide variety of official tickets and travel packages, we will bring you to the event of your dreams!?/g, "")
    .trim()
}

function generatePackageGroupKey(product: P1Product): string | undefined {
  const title = (product.name?.[0] || "").toLowerCase()
  const description = (product.description?.[0] || "").toLowerCase()
  const fullText = `${title} ${description}`

  // Skip if this is a Paddock Club ticket
  if (fullText.includes("paddock club™") || fullText.includes("paddock club")) {
    return undefined
  }

  // Must include hotel OR transfer to be considered a package
  const hasHotel = /(?:hotel|accommodation|nights?\s+stay|overnight)/i.test(fullText)
  const hasTransfer = /(?:transfer|shuttle|coach)\s+(?:service|included|to.*circuit)/i.test(fullText)
  
  if (!hasHotel && !hasTransfer) {
    return undefined
  }

  // Generate key based on included services
  const services: string[] = []
  if (hasHotel) services.push("hotel")
  if (hasTransfer) services.push("transfer")
  
  // Include the hotel name if available for more specific grouping
  const hotelMatch = fullText.match(/(?:hotel|stay at)\s+([^,\.]+)/i)
  const hotelName = hotelMatch ? hotelMatch[1].trim() : ""
  
  return `${product.venue_name?.[0]}_${product.date_start?.[0]}_${hotelName}_${services.join("_")}`.toLowerCase()
}

function detectPackage(product: P1Product): Partial<ParsedPackage> | undefined {
  const title = (product.name?.[0] || "").toLowerCase()
  const description = (product.description?.[0] || "").toLowerCase()
  const extraInfo = (product.extraInfo?.[0] || "").toLowerCase()
  const fullText = `${title} ${description} ${extraInfo}`

  // Skip if this is a Paddock Club ticket
  if (fullText.includes("paddock club™") || fullText.includes("paddock club")) {
    return undefined
  }

  // Must include hotel OR transfer to be considered a package
  const hasHotel = /(?:hotel|accommodation|nights?\s+stay|overnight)/i.test(fullText)
  const hasTransfer = /(?:transfer|shuttle|coach)\s+(?:service|included|to.*circuit)/i.test(fullText)
  
  if (!hasHotel && !hasTransfer) {
    return undefined
  }

  // Determine package type
  let packageType: ParsedPackage["type"]
  if (
    /vip\s+(?:package|experience|hospitality)/i.test(fullText) &&
    (hasHotel || hasTransfer)
  ) {
    packageType = "vip"
  } else if (hasHotel && hasTransfer) {
    packageType = "hospitality"
  } else {
    packageType = "custom"
  }

  return {
    type: packageType,
    name: product.name?.[0] || "",
    description: cleanDescription(product.description?.[0] || ""),
    basePrice: product.price?.[0] || "0",
    currency: "USD",
    maxQuantity: packageType === "vip" ? 50 : 100,
    tickets: [],
    validFrom: new Date(product.date_start?.[0] || ""),
    isFeatured: packageType === "vip",
    termsAndConditions: extraInfo || "Terms and conditions apply."
  }
}

function parseProduct(product: P1Product): ParsedTicket | null {
  try {
    // Skip if not an F1 product
    if (!isF1Product(product)) return null

    const description = product.description?.[0] || ""
    const extraInfo = product.extraInfo?.[0] || ""
    const date = product.date_start?.[0] || ""
    const fullDescription = cleanDescription(`${description}\n\n${product.descriptionLong?.[0] || ""}`)

    // Detect package information
    const packageInfo = detectPackage(product)
    const packageGroupKey = generatePackageGroupKey(product)

    // Extract ticket type and seating details
    const ticketType = extractTicketType(description, extraInfo)
    const seatingDetails = extractSeatingDetails(description, extraInfo)

    return {
      raceId: "", // This will be mapped later
      title: product.name?.[0] || "",
      description: fullDescription,
      ticketType,
      seatingDetails,
      availability: "available",
      daysIncluded: extractDaysFromDescription(description),
      isChildTicket: false,
      resellerUrl: product.productURL?.[0] || "",
      
      // Pricing information
      pricing: {
        price: product.price?.[0] || "0",
        currency: "USD", // Default value
        validFrom: new Date(date),
        validTo: undefined
      },

      // Extract features from description
      features: extractFeatures(fullDescription),

      // Package information
      packageId: undefined, // Will be set after package creation
      isMainPackageTicket: packageInfo !== undefined,
      packageGroupKey,

      // Metadata for mapping
      venue: product.venue_name?.[0] || "",
      country: product.country?.[0] || "",
      date,
      time: product.date_string_local_time?.[0] || ""
    }
  } catch (error) {
    console.error("Error parsing product:", error)
    console.error("Product data:", product)
    return null
  }
}

async function processXmlFeed(filePath: string, outputPath?: string): Promise<ParsedTicket[]> {
  try {
    const feed = await parseXmlFile(filePath)
    
    // Debug: Log the feed structure
    console.log("Feed structure:", {
      hasProducts: !!feed.products,
      productCount: feed.products?.product?.length || 0
    })
    
    if (!feed.products?.product) {
      throw new Error("Invalid feed structure - missing products array")
    }
    
    const tickets = feed.products.product
      .map(parseProduct)
      .filter((ticket): ticket is ParsedTicket => ticket !== null)

    console.log(`Found ${tickets.length} F1 tickets`)

    // Load race data for mapping
    const raceDataPath = path.join(process.cwd(), "race-mapping-data.json")
    const raceData: RaceData[] = JSON.parse(await fs.readFile(raceDataPath, "utf-8"))

    // Map tickets to races
    const mappedTickets = await Promise.all(
      tickets.map(async ticket => {
        const raceId = await mapTicketToRace(ticket, raceData)
        return {
          ...ticket,
          raceId: raceId || ""
        }
      })
    )

    // Group tickets by package
    const packageGroups = new Map<string, ParsedTicket[]>()
    mappedTickets.forEach(ticket => {
      if (ticket.packageGroupKey) {
        const key = `${ticket.raceId}:${ticket.packageGroupKey}`
        const group = packageGroups.get(key) || []
        group.push(ticket)
        packageGroups.set(key, group)
      }
    })

    // Log package groups
    console.log("\nPackage Groups:")
    packageGroups.forEach((tickets, key) => {
      console.log(`\nGroup: ${key}`)
      console.log(`Tickets: ${tickets.length}`)
      console.log("Titles:")
      tickets.forEach(t => console.log(`- ${t.title}`))
      console.log("Features:")
      const allFeatures = new Set(tickets.flatMap(t => t.features.map(f => f.name)))
      console.log([...allFeatures].map(f => `- ${f}`).join("\n"))
    })

    if (outputPath) {
      await fs.writeFile(
        outputPath,
        JSON.stringify(mappedTickets, null, 2),
        "utf-8"
      )
      console.log(`Output written to ${outputPath}`)

      // Log mapping statistics
      const mappedCount = mappedTickets.filter(t => t.raceId).length
      const packageCount = packageGroups.size
      console.log("\nMapping Statistics:")
      console.log(`Total tickets: ${mappedTickets.length}`)
      console.log(`Successfully mapped: ${mappedCount}`)
      console.log(`Failed to map: ${mappedTickets.length - mappedCount}`)
      console.log(`Package groups identified: ${packageCount}`)
      
      // Log package types
      const packageTypes = new Map<string, number>()
      mappedTickets.forEach(ticket => {
        if (ticket.packageGroupKey) {
          const type = ticket.ticketType
          packageTypes.set(type, (packageTypes.get(type) || 0) + 1)
        }
      })
      console.log("\nPackage Types:")
      packageTypes.forEach((count, type) => {
        console.log(`${type}: ${count}`)
      })
    }

    return mappedTickets
  } catch (error) {
    console.error("Error processing XML feed:", error)
    throw error
  }
}

// Main execution
async function main() {
  const [inputFile, outputFile] = process.argv.slice(2)
  
  if (!inputFile) {
    console.error("Please provide an input XML file path")
    process.exit(1)
  }

  try {
    await processXmlFeed(inputFile, outputFile)
  } catch (error) {
    console.error("Error:", error)
    process.exit(1)
  }
}

main()

export { processXmlFeed, type ParsedTicket, type ParsedPackage } 