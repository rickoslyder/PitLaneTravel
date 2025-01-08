import { db } from "@/db/db"
import { createTicketAction } from "@/actions/db/tickets-actions"
import { createTicketPackageAction } from "@/actions/db/ticket-packages-actions"
import { 
  getAllTicketFeaturesAction,
  addFeatureToTicketAction
} from "@/actions/db/ticket-features-actions"
import { 
  ticketFeaturesTable,
  packageTicketsTable,
  ticketFeatureMappingsTable,
  packageTypeEnum,
  ticketTypeEnum
} from "@/db/schema"
import { eq } from "drizzle-orm"
import { ParsedTicket, ParsedPackage } from "./parse-p1-tickets"
import fs from "fs/promises"

interface FeatureMap {
  [key: string]: number // Maps feature name to feature ID
}

const ADMIN_USER_ID = "user_2qf9oR94QeVLf8Wf4T0tPRljN3P"

// Helper function to determine if a package should be featured based on its features
function shouldFeaturePackage(tickets: ParsedTicket[]): boolean {
  const uniqueFeatures = new Set(tickets.flatMap(t => t.features.map(f => f.name)))
  const premiumFeatures = [
    "VIP Access",
    "Paddock Access",
    "Pit Lane Access",
    "Behind-the-Scenes Access",
    "Driver Interaction",
    "Private Suite",
    "Gourmet Dining",
    "Champagne Service"
  ]
  return premiumFeatures.some(f => uniqueFeatures.has(f))
}

// Helper function to generate a comprehensive package description
function generatePackageDescription(tickets: ParsedTicket[]): string {
  // Get unique features across all tickets
  const uniqueFeatures = new Set(tickets.flatMap(t => t.features.map(f => f.name)))
  
  // Group features by category
  const featuresByCategory = {
    access: [] as string[],
    hospitality: [] as string[],
    experience: [] as string[]
  }
  
  tickets.flatMap(t => t.features).forEach(feature => {
    if (!featuresByCategory[feature.category].includes(feature.name)) {
      featuresByCategory[feature.category].push(feature.name)
    }
  })
  
  // Build description
  const parts = []
  
  // Add base ticket info
  const mainTicket = tickets.find(t => t.isMainPackageTicket) || tickets[0]
  parts.push(mainTicket.description.split('\n')[0]) // First line of main description
  
  // Add feature highlights
  if (featuresByCategory.access.length > 0) {
    parts.push("\n\nAccess Features:")
    parts.push(featuresByCategory.access.map(f => `- ${f}`).join('\n'))
  }
  
  if (featuresByCategory.hospitality.length > 0) {
    parts.push("\n\nHospitality Features:")
    parts.push(featuresByCategory.hospitality.map(f => `- ${f}`).join('\n'))
  }
  
  if (featuresByCategory.experience.length > 0) {
    parts.push("\n\nExperience Features:")
    parts.push(featuresByCategory.experience.map(f => `- ${f}`).join('\n'))
  }
  
  return parts.join('\n')
}

// Helper function to determine package type
function determinePackageType(tickets: ParsedTicket[]): typeof packageTypeEnum.enumValues[number] {
  const hasHotel = tickets.some(t => t.packageGroupKey?.includes("hotel"))
  const hasTransfer = tickets.some(t => t.packageGroupKey?.includes("transfer"))
  const isPaddockClub = tickets.some(t => 
    t.description.toLowerCase().includes("paddock club™") || 
    t.description.toLowerCase().includes("paddock club")
  )
  const hasVIP = tickets.some(t => t.ticketType === "vip")
  
  // Check for Paddock Club first as it's the most premium and specific
  if (isPaddockClub) return "paddock_club"
  
  // Then check for hotel + transfer packages
  if (hasHotel && hasTransfer) return "hotel_and_transfer"
  
  // Then VIP packages
  if (hasVIP) return "vip"
  
  // Then hospitality packages (might include either hotel or transfer)
  if (hasHotel || hasTransfer) return "hospitality"
  
  // If none of the above, it's either a custom package or a weekend package
  return tickets.some(t => t.packageGroupKey?.includes("custom")) ? "custom" : "weekend"
}

// Helper function to calculate total package price
function calculatePackagePrice(tickets: ParsedTicket[]): string {
  const total = tickets
    .reduce((sum, ticket) => sum + parseFloat(ticket.pricing.price), 0)
  return total.toString()
}

async function ensureFeaturesExist(tickets: ParsedTicket[]): Promise<FeatureMap> {
  // Get all unique features from tickets
  const uniqueFeatures = new Set<string>()
  tickets.forEach(ticket => {
    ticket.features.forEach(feature => {
      uniqueFeatures.add(feature.name)
    })
  })

  // Get existing features from database
  const result = await getAllTicketFeaturesAction()
  if (!result.isSuccess || !result.data) {
    throw new Error("Failed to get existing features")
  }
  
  const featureMap: FeatureMap = {}
  
  // Map existing features
  result.data.forEach(feature => {
    featureMap[feature.name] = feature.id
  })

  // Create missing features
  for (const featureName of uniqueFeatures) {
    if (!featureMap[featureName]) {
      // Find the feature in any ticket to get its category
      const featureInfo = tickets.flatMap(t => t.features).find(f => f.name === featureName)
      if (!featureInfo) continue

      const [newFeature] = await db.insert(ticketFeaturesTable)
        .values({
          name: featureName,
          description: featureInfo.name,
          category: featureInfo.category,
          isActive: true,
          updatedBy: ADMIN_USER_ID
        })
        .returning()

      featureMap[featureName] = newFeature.id
      console.log(`Created new feature: ${featureName}`)
    }
  }

  return featureMap
}

async function createTicketWithFeatures(
  ticket: ParsedTicket,
  featureMap: FeatureMap
): Promise<number | null> {
  try {
    // Create the ticket first
    const result = await createTicketAction(
      {
        raceId: ticket.raceId,
        title: ticket.title,
        description: ticket.description,
        ticketType: ticket.ticketType as typeof ticketTypeEnum.enumValues[number],
        seatingDetails: ticket.seatingDetails,
        availability: ticket.availability,
        daysIncluded: ticket.daysIncluded,
        isChildTicket: ticket.isChildTicket,
        resellerUrl: ticket.resellerUrl,
        updatedBy: ADMIN_USER_ID
      },
      {
        price: ticket.pricing.price,
        currency: ticket.pricing.currency,
        validFrom: ticket.pricing.validFrom,
        validTo: ticket.pricing.validTo
      }
    )

    if (!result.isSuccess || !result.data) {
      console.error("Failed to create ticket:", ticket.title)
      return null
    }

    const ticketId = result.data.id

    // Add features to the ticket one by one
    for (const feature of ticket.features) {
      const featureId = featureMap[feature.name]
      if (!featureId) {
        console.warn(`Feature not found in map: ${feature.name}`)
        continue
      }

      try {
        await addFeatureToTicketAction(ticketId, featureId)
      } catch (error) {
        console.warn(`Failed to add feature ${feature.name} to ticket ${ticket.title}:`, error)
      }
    }

    return ticketId
  } catch (error) {
    console.error("Error creating ticket with features:", error)
    return null
  }
}

interface PackageGroup {
  id: string
  name: string
  tickets: ParsedTicket[]
}

async function createPackageWithTickets(
  packageGroup: PackageGroup,
  tickets: ParsedTicket[],
  userId: string,
  ticketIds: Map<string, number>
): Promise<void> {
  try {
    // Get ticket IDs for the package
    const ticketRelations = tickets
      .map(ticket => {
        const ticketId = ticketIds.get(ticket.title)
        if (!ticketId) return null
        return {
          ticketId,
          quantity: 1,
          discountPercentage: "0"
        }
      })
      .filter((rel): rel is NonNullable<typeof rel> => rel !== null)

    if (ticketRelations.length === 0) {
      console.error(`No valid tickets found for package: ${packageGroup.id}`)
      return
    }

    // Create the package with its tickets
    const packageResult = await createTicketPackageAction(
      {
        name: packageGroup.name,
        description: generatePackageDescription(tickets),
        packageType: determinePackageType(tickets),
        basePrice: calculatePackagePrice(tickets),
        currency: tickets[0].pricing.currency,
        maxQuantity: "10", // Default value
        validFrom: tickets[0].pricing.validFrom,
        raceId: tickets[0].raceId,
        isFeatured: shouldFeaturePackage(tickets),
        updatedBy: userId
      },
      ticketRelations
    )

    if (!packageResult.isSuccess) {
      console.error(`Failed to create package: ${packageGroup.id}`)
      return
    }

    console.log(`Created package: ${packageGroup.id} with ${tickets.length} tickets`)
    console.log(`Package type: ${determinePackageType(tickets)}`)
    console.log(`Featured: ${shouldFeaturePackage(tickets)}`)
    console.log(`Total price: ${calculatePackagePrice(tickets)}`)
  } catch (error) {
    console.error(`Error creating ticket package:`, error)
    console.error(`Failed to create package: ${packageGroup.id}`)
  }
}

export async function insertParsedData(tickets: ParsedTicket[]): Promise<void> {
  try {
    console.log("Starting data insertion process...")

    // Step 1: Ensure all features exist
    console.log("Ensuring features exist...")
    const featureMap = await ensureFeaturesExist(tickets)
    console.log(`Feature map created with ${Object.keys(featureMap).length} features`)

    // Step 2: Create all tickets with their features
    console.log("Creating tickets with features...")
    const ticketIds = new Map<string, number>()
    for (const ticket of tickets) {
      const ticketId = await createTicketWithFeatures(ticket, featureMap)
      if (ticketId) {
        ticketIds.set(ticket.title, ticketId)
      }
    }
    console.log(`Created ${ticketIds.size} tickets`)

    // Step 3: Group tickets by package
    const packageGroups = new Map<string, PackageGroup>()
    tickets.forEach(ticket => {
      if (ticket.packageGroupKey) {
        const key = `${ticket.raceId}:${ticket.packageGroupKey}`
        const existingGroup = packageGroups.get(key)
        if (existingGroup) {
          existingGroup.tickets.push(ticket)
        } else {
          packageGroups.set(key, {
            id: key,
            name: ticket.title,
            tickets: [ticket]
          })
        }
      }
    })

    // Step 4: Create packages and their relationships
    console.log("Creating packages...")
    for (const [_, group] of packageGroups) {
      await createPackageWithTickets(group, group.tickets, ADMIN_USER_ID, ticketIds)
    }
    console.log(`Created ${packageGroups.size} packages`)

    console.log("Data insertion completed successfully!")
  } catch (error) {
    console.error("Error in data insertion process:", error)
    throw error
  }
}

// Add main entry point
async function main() {
  try {
    // Get the JSON file path from command line arguments
    const jsonFilePath = process.argv[2]
    if (!jsonFilePath) {
      console.error("Please provide a JSON file path as an argument")
      process.exit(1)
    }

    // Read and parse the JSON file
    const jsonData = await fs.readFile(jsonFilePath, 'utf-8')
    const tickets = JSON.parse(jsonData) as ParsedTicket[]

    // Insert the data
    await insertParsedData(tickets)
  } catch (error) {
    console.error("Error in main:", error)
    process.exit(1)
  }
}

// Run the script
main() 