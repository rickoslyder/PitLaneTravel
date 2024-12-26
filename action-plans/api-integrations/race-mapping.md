# Race Mapping for OpenF1 Integration

## Schema Update

```sql
-- Add OpenF1 reference columns to races table
ALTER TABLE "public"."races" 
ADD COLUMN IF NOT EXISTS "openf1_meeting_key" integer UNIQUE,
ADD COLUMN IF NOT EXISTS "openf1_session_key" integer UNIQUE;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_races_openf1_meeting_key ON "public"."races"("openf1_meeting_key");
CREATE INDEX IF NOT EXISTS idx_races_openf1_session_key ON "public"."races"("openf1_session_key");
```

## Type Updates

```typescript
// types/schema.ts
export interface Race {
  // ... existing fields ...
  openf1_meeting_key?: number;
  openf1_session_key?: number;
}

// types/openf1-types.ts
export interface OpenF1Meeting extends OpenF1Base {
  meeting_name: string;
  meeting_official_name: string;
  country_key: number;
  country_code: string;
  country_name: string;
  circuit_key: number;
  circuit_short_name: string;
  date_start: string;
  gmt_offset: string;
  session_count: number;
}
```

## Mapping Service

```typescript
// services/openf1/race-mapper.ts
export class RaceMapper {
  static async initializeRaceMappings(db: Database) {
    const openF1Client = new OpenF1Client();
    const races = await db.query.races.findMany({
      where: and(
        isNull(races.openf1_meeting_key),
        isNull(races.openf1_session_key)
      )
    });
    
    for (const race of races) {
      try {
        // Find matching meeting based on circuit and date
        const circuitKey = await CircuitMapper.getOpenF1Key(race.circuit_id);
        if (!circuitKey) continue;

        const meetings = await openF1Client.getMeetings({
          circuit_key: circuitKey,
          date_start: format(race.date, 'yyyy-MM-dd')
        });

        const meeting = meetings[0]; // Should only be one meeting per date/circuit
        if (!meeting) continue;

        // Find the main race session for this meeting
        const sessions = await openF1Client.getSessions({
          meeting_key: meeting.meeting_key,
          session_type: 'race'
        });

        const session = sessions[0]; // Should only be one race session per meeting
        if (!session) continue;

        // Update race with OpenF1 keys
        await db.update(races)
          .set({
            openf1_meeting_key: meeting.meeting_key,
            openf1_session_key: session.session_key
          })
          .where(eq(races.id, race.id));

      } catch (error) {
        console.error(
          `Failed to map race ${race.id} to OpenF1 meeting:`,
          error
        );
      }
    }
  }

  static async getMeetingKey(raceId: string): Promise<number | null> {
    const race = await db.query.races.findFirst({
      where: eq(races.id, raceId),
      columns: { openf1_meeting_key: true }
    });
    
    return race?.openf1_meeting_key ?? null;
  }

  static async getSessionKey(raceId: string): Promise<number | null> {
    const race = await db.query.races.findFirst({
      where: eq(races.id, raceId),
      columns: { openf1_session_key: true }
    });
    
    return race?.openf1_session_key ?? null;
  }

  static async getRaceId(meetingKey: number): Promise<string | null> {
    const race = await db.query.races.findFirst({
      where: eq(races.openf1_meeting_key, meetingKey),
      columns: { id: true }
    });
    
    return race?.id ?? null;
  }
}
```

## Usage Example

```typescript
// Example: Fetching race data
async function getRaceData(raceId: string) {
  const meetingKey = await RaceMapper.getMeetingKey(raceId);
  if (!meetingKey) {
    throw new Error(`No OpenF1 meeting mapping for race: ${raceId}`);
  }
  
  const client = new OpenF1Client();
  return client.getMeetingDetails(meetingKey);
}

// Example: Syncing session data
async function syncRaceSessionData(raceId: string) {
  const sessionKey = await RaceMapper.getSessionKey(raceId);
  if (!sessionKey) {
    throw new Error(`No OpenF1 session mapping for race: ${raceId}`);
  }
  
  const client = new OpenF1Client();
  const sessionData = await client.getSessionDetails(sessionKey);
  
  // Process session data...
}
```

## Migration Strategy

1. Add new columns with migration
2. Create indexes for performance
3. Run initial mapping for existing races
4. Set up validation for new races
5. Add error handling for unmapped races

## Validation & Maintenance

1. Regular validation of mappings
2. Monitoring for unmapped races
3. Update process for new races
4. Backup of mapping data

## Next Steps

1. Create migration for schema changes
2. Implement RaceMapper class
3. Create initial mapping data
4. Add validation tests
5. Set up monitoring
6. Update sync manager to handle race-specific data 