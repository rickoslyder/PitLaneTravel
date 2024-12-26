# Phase 1: OpenF1 Data Fetching Service

## Service Structure

```typescript
// services/openf1/types.ts
export interface OpenF1Session {
  date: string;
  session_key: number;
  meeting_key: number;
  session_name: string;
  session_type: string;
  status: string;
}

export interface OpenF1Circuit {
  circuit_key: number;
  circuit_name: string;
  circuit_short_name: string;
  country_name: string;
  location: {
    lat: number;
    lng: number;
  };
  track_length: number;
}

// services/openf1/client.ts
export class OpenF1Client {
  private baseUrl = 'https://api.openf1.org/v1';
  private cache: Map<string, any>;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.cache = new Map();
  }

  private async fetchWithCache(endpoint: string): Promise<any> {
    const cacheKey = `${endpoint}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`);
    const data = await response.json();
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  async getSessions(year: number): Promise<OpenF1Session[]> {
    return this.fetchWithCache(`/sessions?year=${year}`);
  }

  async getCircuitDetails(circuitKey: number): Promise<OpenF1Circuit> {
    return this.fetchWithCache(`/circuits?circuit_key=${circuitKey}`);
  }
}

// services/openf1/transformer.ts
export class OpenF1Transformer {
  static toSessionSchedule(openF1Session: OpenF1Session): Partial<SessionSchedule> {
    return {
      sessionType: this.mapSessionType(openF1Session.session_type),
      startTime: new Date(openF1Session.date),
      endTime: this.calculateEndTime(openF1Session),
      status: this.mapStatus(openF1Session.status)
    };
  }

  static toCircuitDetails(openF1Circuit: OpenF1Circuit): Partial<CircuitDetails> {
    return {
      trackLengthKm: openF1Circuit.track_length / 1000,
      // Other mappings...
    };
  }

  private static mapSessionType(type: string): string {
    const typeMap: Record<string, string> = {
      'practice_1': 'fp1',
      'practice_2': 'fp2',
      'practice_3': 'fp3',
      'qualifying': 'qualifying',
      'sprint': 'sprint',
      'race': 'race'
    };
    return typeMap[type] || type;
  }

  private static mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'upcoming': 'scheduled',
      'in_progress': 'live',
      'finished': 'completed',
      'delayed': 'delayed',
      'cancelled': 'cancelled'
    };
    return statusMap[status] || 'scheduled';
  }

  private static calculateEndTime(session: OpenF1Session): Date {
    // Default durations in minutes
    const durations: Record<string, number> = {
      'fp1': 60,
      'fp2': 60,
      'fp3': 60,
      'qualifying': 60,
      'sprint': 30,
      'race': 120
    };

    const startTime = new Date(session.date);
    const duration = durations[this.mapSessionType(session.session_type)] || 60;
    return new Date(startTime.getTime() + duration * 60000);
  }
}
```

## Implementation Strategy

1. Data Fetching Service:
   - Implement caching to reduce API calls
   - Handle rate limiting
   - Implement error handling and retries
   - Log API usage for monitoring

2. Data Transformation:
   - Map OpenF1 data to our schema
   - Handle edge cases and data validation
   - Implement data normalization
   - Add data enrichment where needed

3. Database Integration:
   - Create database service layer
   - Implement upsert operations
   - Handle data conflicts
   - Maintain data consistency

## Usage Example

```typescript
// Example usage in a server action
async function updateSessionSchedules(year: number) {
  const client = new OpenF1Client();
  const sessions = await client.getSessions(year);
  
  for (const session of sessions) {
    const scheduleData = OpenF1Transformer.toSessionSchedule(session);
    
    await db.insert(sessionSchedules).values({
      ...scheduleData,
      raceId: await mapSessionToRaceId(session)
    }).onConflictDoUpdate({
      target: ['race_id', 'session_type'],
      set: scheduleData
    });
  }
}

// Example usage in a cron job
export async function syncCircuitDetails() {
  const client = new OpenF1Client();
  const circuits = await db.query.circuits.findMany();
  
  for (const circuit of circuits) {
    const openF1Circuit = await client.getCircuitDetails(circuit.openF1Key);
    const details = OpenF1Transformer.toCircuitDetails(openF1Circuit);
    
    await db.update(circuitDetails)
      .set(details)
      .where(eq(circuitDetails.circuitId, circuit.id));
  }
}
```

## Error Handling

```typescript
class OpenF1Error extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'OpenF1Error';
  }
}

// Enhanced client with error handling
private async fetchWithCache(endpoint: string): Promise<any> {
  try {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    
    if (!response.ok) {
      throw new OpenF1Error(
        `Failed to fetch data from OpenF1`,
        response.status,
        endpoint
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`OpenF1 API Error: ${error.message}`);
    throw error;
  }
}
```

## Monitoring and Logging

```typescript
interface ApiMetrics {
  endpoint: string;
  duration: number;
  status: number;
  timestamp: Date;
}

class OpenF1Monitor {
  private metrics: ApiMetrics[] = [];

  logRequest(metric: ApiMetrics) {
    this.metrics.push(metric);
    
    // Log to monitoring service
    console.log(
      `OpenF1 API: ${metric.endpoint} - ${metric.status} - ${metric.duration}ms`
    );
  }

  getAverageResponseTime(endpoint: string): number {
    const relevantMetrics = this.metrics.filter(m => m.endpoint === endpoint);
    const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / relevantMetrics.length;
  }
}
```

## Next Steps

1. Implement the OpenF1Client class
2. Set up monitoring and logging
3. Create database migration scripts
4. Write unit tests for transformers
5. Set up integration tests
6. Create deployment pipeline 