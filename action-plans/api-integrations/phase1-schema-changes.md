# Phase 1: Schema Changes for OpenF1 Integration

## New Table: session_schedules

```sql
CREATE TABLE IF NOT EXISTS "public"."session_schedules" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "race_id" uuid NOT NULL REFERENCES "public"."races"("id") ON DELETE CASCADE,
    "session_type" text NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "status" text NOT NULL DEFAULT 'scheduled',
    "actual_start_time" timestamp with time zone,
    "actual_end_time" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "valid_session_type" CHECK (
        session_type IN ('fp1', 'fp2', 'fp3', 'qualifying', 'sprint', 'race')
    ),
    CONSTRAINT "valid_status" CHECK (
        status IN ('scheduled', 'live', 'completed', 'delayed', 'cancelled')
    )
);

CREATE INDEX idx_session_schedules_race_id ON "public"."session_schedules"("race_id");
CREATE INDEX idx_session_schedules_start_time ON "public"."session_schedules"("start_time");
```

## Circuit Details Table Extension

```sql
-- Add new columns to circuit_details
ALTER TABLE "public"."circuit_details" 
ADD COLUMN IF NOT EXISTS "track_length_km" numeric(5,3),
ADD COLUMN IF NOT EXISTS "number_of_laps" integer,
ADD COLUMN IF NOT EXISTS "drs_zones" jsonb,
ADD COLUMN IF NOT EXISTS "circuit_map_url" text,
ADD COLUMN IF NOT EXISTS "pit_lane_side" text,
ADD COLUMN IF NOT EXISTS "pit_lane_length_km" numeric(5,3),
ADD COLUMN IF NOT EXISTS "track_width_m" numeric(5,2),
ADD COLUMN IF NOT EXISTS "elevation_change_m" numeric(6,2);

-- Add constraints
ALTER TABLE "public"."circuit_details"
ADD CONSTRAINT "valid_pit_lane_side" CHECK (
    pit_lane_side IN ('left', 'right')
);
```

## Implementation Notes

1. Session Schedules Table:
   - Stores all session times for race weekends
   - Tracks both scheduled and actual times
   - Includes status tracking for real-time updates
   - Links directly to races table

2. Circuit Details Extensions:
   - Adds technical circuit information
   - Stores DRS zones as JSONB for flexibility
   - Includes physical characteristics
   - Maintains existing relationships

## Migration Strategy

1. Create new tables and columns without breaking changes
2. Backfill data from OpenF1 API for:
   - Past race session schedules (2023 season)
   - Circuit technical details
3. Set up triggers for `updated_at` timestamps
4. Create necessary indexes for query optimization

## API Integration Points

1. Session Schedules:
   ```typescript
   interface SessionSchedule {
     raceId: string;
     sessionType: 'fp1' | 'fp2' | 'fp3' | 'qualifying' | 'sprint' | 'race';
     startTime: Date;
     endTime: Date;
     status: 'scheduled' | 'live' | 'completed' | 'delayed' | 'cancelled';
     actualStartTime?: Date;
     actualEndTime?: Date;
   }
   ```

2. Circuit Details:
   ```typescript
   interface CircuitDetails {
     trackLengthKm: number;
     numberOfLaps: number;
     drsZones: {
       zone: number;
       detectionPoint: number;
       activationPoint: number;
     }[];
     circuitMapUrl: string;
     pitLaneSide: 'left' | 'right';
     pitLaneLengthKm: number;
     trackWidthM: number;
     elevationChangeM: number;
   }
   ```

## Next Steps

1. Create migration files
2. Implement data fetching services
3. Set up caching layer
4. Create API endpoints
5. Update frontend components 