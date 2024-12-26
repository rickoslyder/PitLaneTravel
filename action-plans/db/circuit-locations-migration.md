# Circuit Locations Migration Plan

## Overview
This plan outlines the steps needed to:
1. Migrate to the Places API (New)
2. Create and populate the new `circuit_locations` table with enhanced location data
3. Update existing code to use the new location structure

## 1. Database Changes

### 1.1 Create Location Type Enum
```sql
CREATE TYPE "public"."location_type" AS ENUM (
  'circuit',
  'city_center',
  'parking',
  'fan_zone',
  'transport_hub'
);
```

### 1.2 Create Circuit Locations Table
```sql
CREATE TABLE IF NOT EXISTS "public"."circuit_locations" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "circuit_id" uuid NOT NULL REFERENCES circuits(id) ON DELETE CASCADE,
    "type" location_type NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "address" text,
    "place_id" text,
    "latitude" numeric(10,7) NOT NULL,
    "longitude" numeric(10,7) NOT NULL,
    "distance_from_circuit" numeric(10,2),
    "timezone" text,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
);

CREATE INDEX idx_circuit_locations_circuit_id ON circuit_locations(circuit_id);
CREATE INDEX idx_circuit_locations_type ON circuit_locations(type);
CREATE INDEX idx_circuit_locations_place_id ON circuit_locations(place_id);
```

### 1.3 Migrate Existing Circuit Coordinates
The migration script (`scripts/migrate-circuit-locations.ts`) will:
1. Get all circuits from the `circuits` table
2. For each circuit:
   - Create a 'circuit' type location with basic info
   - Use Places API (New) to find city center
   - Get additional data (timezone, formatted address, place_id)
   - Calculate distance from circuit
   - Store city center as a separate location

## 2. Code Updates

### 2.1 Update Places API Integration
1. Created utility functions in `lib/google-places.ts`:
   - `searchNearbyPlaces`: Find places near coordinates
   - `searchPlaces`: Text-based place search
   - `getPlaceDetails`: Get detailed place information
   - `geocodeLocation`: Convert addresses to coordinates

2. Updated `local-attractions-actions.ts` to use new API endpoints

### 2.2 Update Types and Schemas

1. Created `circuit-locations-schema.ts` with:
   - Location type enum
   - Circuit locations table definition
   - Type exports for insert/select operations

2. Update `RaceWithCircuit` type to include location data:
```typescript
interface CircuitLocation {
  id: string
  type: LocationType
  name: string
  description?: string
  address?: string
  placeId?: string
  latitude: string
  longitude: string
  distanceFromCircuit?: string
  timezone?: string
}

interface CircuitWithLocations extends Circuit {
  locations: CircuitLocation[]
}

interface RaceWithCircuit extends Race {
  circuit: CircuitWithLocations
}
```

### 2.3 Update Components

1. Update `LocalAttractions.tsx`:
   - Use new Places API endpoints
   - Calculate distances from both circuit and city center
   - Show distance from city center in UI
   - Add timezone information where relevant

2. Update `RaceDetailsPage.tsx`:
   - Show both circuit and city center on map
   - Add city information section
   - Display timezone information

3. Update any components using circuit coordinates to use the new location structure

## 3. Migration Process

1. **Preparation**:
   - Create backup of current database
   - Test migration script in staging environment
   - Verify Places API (New) quotas and billing
   - Check timezone API access

2. **Execution**:
   ```bash
   # Run in order:
   1. Create location_type enum
   2. Create circuit_locations table
   3. Run circuit locations migration script
   4. Deploy code updates
   5. Verify data integrity
   ```

3. **Verification**:
   - Check all circuit locations are migrated
   - Verify city centers are correctly identified
   - Confirm timezone data is accurate
   - Test distance calculations
   - Verify place IDs are stored correctly
   - Test local attractions functionality
   - Monitor for any errors or performance issues

## 4. Rollback Plan

If issues occur:
1. Revert code changes
2. Keep circuit_locations table (no harm in extra data)
3. Switch back to old Places API endpoints
4. Update documentation with issues encountered

## 5. Future Improvements

Consider:
- Caching Places API responses
- Adding more location types (parking, fan zones, etc.)
- Implementing location update mechanism
- Adding validation for coordinate ranges
- Periodic refresh of place details
- Bulk operations for updating multiple locations
- Geofencing features using location data
- Integration with other location-based services 