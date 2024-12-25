/*
<ai_context>
Exports the database schema for the app.
</ai_context>
*/

// Activities
export * from "./activities-schema"

// Airports
export * from "./airports-schema"

// Circuit Details
export * from "./circuit-details-schema"

// Circuits
export * from "./circuits-schema"

// Local Attractions
export * from "./local-attractions-schema"

// Meetups
export * from "./meetups-schema"

// Package Tickets
export {
  packageTicketsTable,
  type InsertPackageTicket,
  type SelectPackageTicket
} from "./package-tickets-schema"

// Podium Results
export * from "./podium-results-schema"

// Profiles
export * from "./profiles-schema"

// Races
export * from "./races-schema"

// Reviews
export * from "./reviews-schema"

// Saved Itineraries
export * from "./saved-itineraries-schema"

// Supporting Series
export * from "./supporting-series-schema"

// Ticket Feature Mappings
export {
  ticketFeatureMappingsTable,
  type InsertTicketFeatureMapping,
  type SelectTicketFeatureMapping
} from "./ticket-feature-mappings-schema"

// Ticket Features
export * from "./ticket-features-schema"

// Ticket Packages
export * from "./ticket-packages-schema"

// Ticket Pricing
export * from "./ticket-pricing-schema"

// Tickets
export * from "./tickets-schema"

// Tips
export * from "./tips-schema"

// Trips
export * from "./trips-schema"

// Waitlist
export * from "./waitlist-schema"
