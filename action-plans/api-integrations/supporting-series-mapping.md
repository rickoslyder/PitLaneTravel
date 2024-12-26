# Supporting Series OpenF1 Integration

## Schema Update

```sql
-- Add OpenF1 reference columns to supporting_series table
ALTER TABLE "public"."supporting_series" 
ADD COLUMN IF NOT EXISTS "openf1_session_key" integer UNIQUE,
ADD COLUMN IF NOT EXISTS "session_type" text,
ADD COLUMN IF NOT EXISTS "start_time" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "end_time" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'scheduled',
ADD COLUMN IF NOT EXISTS "actual_start_time" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "actual_end_time" timestamp with time zone;

-- Add constraints
ALTER TABLE "public"."supporting_series"
ADD CONSTRAINT "valid_supporting_series_status" CHECK (
    status IN ('scheduled', 'live', 'completed', 'delayed', 'cancelled')
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_supporting_series_openf1_session_key 
ON "public"."supporting_series"("openf1_session_key");
```

## Type Updates

```typescript
// types/schema.ts
export interface SupportingSeries {
  id: string;
  race_id: string;
  series: string;
  round: number;
  openf1_session_key?: number;
  session_type?: string;
  start_time?: Date;
  end_time?: Date;
  status?: 'scheduled' | 'live' | 'completed' | 'delayed' | 'cancelled';
  actual_start_time?: Date;
  actual_end_time?: Date;
  created_at: Date;
  updated_at: Date;
}

// types/openf1-types.ts
export interface OpenF1SupportingSession extends OpenF1Base {
  session_name: string;
  session_type: string; // e.g., 'f2_practice', 'f2_qualifying', 'f2_sprint', 'f2_feature'
  status: 'upcoming' | 'in_progress' | 'finished' | 'delayed' | 'cancelled';
  series_key: number;
  series_name: string;
}
```

## Mapping Service

```typescript
// services/openf1/supporting-series-mapper.ts
export class SupportingSeriesMapper {
  static async initializeMappings(db: Database) {
    const openF1Client = new OpenF1Client();
    const supportingSeries = await db.query.supporting_series.findMany({
      where: isNull(supporting_series.openf1_session_key)
    });
    
    for (const series of supportingSeries) {
      try {
        // Get race's meeting key
        const race = await db.query.races.findFirst({
          where: eq(races.id, series.race_id),
          columns: { openf1_meeting_key: true }
        });
        
        if (!race?.openf1_meeting_key) continue;

        // Find matching sessions for this series
        const sessions = await openF1Client.getSessions({
          meeting_key: race.openf1_meeting_key,
          series_name: mapSeriesToOpenF1(series.series)
        });

        // Find the specific session based on type (feature race, sprint, etc)
        const session = findMatchingSession(sessions, series);
        if (!session) continue;

        // Update supporting series with OpenF1 data
        await db.update(supporting_series)
          .set({
            openf1_session_key: session.session_key,
            session_type: session.session_type,
            start_time: new Date(session.date),
            end_time: calculateEndTime(session),
            status: mapStatus(session.status)
          })
          .where(eq(supporting_series.id, series.id));

      } catch (error) {
        console.error(
          `Failed to map supporting series ${series.id} to OpenF1:`,
          error
        );
      }
    }
  }

  private static mapSeriesToOpenF1(series: string): string {
    const seriesMap: Record<string, string> = {
      'F2': 'formula2',
      'F3': 'formula3',
      'F1 Academy': 'f1academy',
      'Porsche Supercup': 'porsche_supercup'
    };
    return seriesMap[series] || series;
  }

  private static findMatchingSession(
    sessions: OpenF1SupportingSession[],
    series: SupportingSeries
  ): OpenF1SupportingSession | undefined {
    // Logic to match the correct session based on series and round
    // This will need to be customized based on OpenF1's session naming
    return sessions.find(session => {
      // Example matching logic
      if (series.series === 'F2') {
        if (series.round % 2 === 0) {
          return session.session_type === 'f2_feature';
        } else {
          return session.session_type === 'f2_sprint';
        }
      }
      // Add logic for other series
      return false;
    });
  }

  private static calculateEndTime(session: OpenF1SupportingSession): Date {
    const durations: Record<string, number> = {
      'f2_practice': 45,
      'f2_qualifying': 30,
      'f2_sprint': 45,
      'f2_feature': 60,
      'f3_practice': 45,
      'f3_qualifying': 30,
      'f3_race': 45,
      'f1academy_practice': 30,
      'f1academy_qualifying': 30,
      'f1academy_race': 30
    };

    const startTime = new Date(session.date);
    const duration = durations[session.session_type] || 45;
    return new Date(startTime.getTime() + duration * 60000);
  }

  private static mapStatus(status: OpenF1SupportingSession['status']): SupportingSeries['status'] {
    const statusMap: Record<OpenF1SupportingSession['status'], SupportingSeries['status']> = {
      'upcoming': 'scheduled',
      'in_progress': 'live',
      'finished': 'completed',
      'delayed': 'delayed',
      'cancelled': 'cancelled'
    };
    return statusMap[status];
  }
}
```

## Usage Example

```typescript
// Example: Syncing supporting series data
async function syncSupportingSeriesData(raceId: string) {
  const client = new OpenF1Client();
  const race = await db.query.races.findFirst({
    where: eq(races.id, raceId),
    columns: { openf1_meeting_key: true }
  });

  if (!race?.openf1_meeting_key) {
    throw new Error(`No OpenF1 meeting mapping for race: ${raceId}`);
  }

  // Get all supporting series sessions for this meeting
  const sessions = await client.getSessions({
    meeting_key: race.openf1_meeting_key,
    series_type: ['formula2', 'formula3', 'f1academy']
  });

  // Update each supporting series
  for (const session of sessions) {
    await db.update(supporting_series)
      .set({
        status: SupportingSeriesMapper.mapStatus(session.status),
        actual_start_time: session.actual_start_time,
        actual_end_time: session.actual_end_time
      })
      .where(eq(supporting_series.openf1_session_key, session.session_key));
  }
}
```

## Migration Strategy

1. Add new columns with migration
2. Create indexes for performance
3. Run initial mapping for existing supporting series
4. Set up validation for new entries
5. Add error handling for unmapped sessions

## Validation & Maintenance

1. Regular validation of mappings
2. Monitoring for unmapped sessions
3. Update process for new sessions
4. Backup of mapping data

## Next Steps

1. Create migration for schema changes
2. Implement SupportingSeriesMapper class
3. Create initial mapping data
4. Add validation tests
5. Set up monitoring
6. Update sync manager to handle supporting series data 