# OpenF1 Data Synchronization Strategy

## Sync Categories

1. **Static Data** (Daily Sync)
   - Circuit information
   - Track characteristics
   - Historical data

2. **Semi-Dynamic Data** (Hourly Sync)
   - Session schedules
   - Weather forecasts
   - Track conditions

3. **Real-time Data** (30-second intervals during sessions)
   - Session status
   - Weather conditions
   - Track status

## Implementation

```typescript
// services/openf1/sync-manager.ts
export class SyncManager {
  private static instance: SyncManager;
  private syncJobs: Map<string, NodeJS.Timeout>;
  private syncStatus: Map<string, boolean>;

  private constructor() {
    this.syncJobs = new Map();
    this.syncStatus = new Map();
  }

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  async startSync(type: 'static' | 'semi-dynamic' | 'real-time') {
    if (this.syncStatus.get(type)) {
      return;
    }

    const intervals = {
      'static': 24 * 60 * 60 * 1000, // Daily
      'semi-dynamic': 60 * 60 * 1000, // Hourly
      'real-time': 30 * 1000 // 30 seconds
    };

    const job = setInterval(
      () => this.sync(type),
      intervals[type]
    );

    this.syncJobs.set(type, job);
    this.syncStatus.set(type, true);
  }

  async stopSync(type: string) {
    const job = this.syncJobs.get(type);
    if (job) {
      clearInterval(job);
      this.syncJobs.delete(type);
      this.syncStatus.set(type, false);
    }
  }

  private async sync(type: string) {
    try {
      switch (type) {
        case 'static':
          await this.syncStaticData();
          break;
        case 'semi-dynamic':
          await this.syncSemiDynamicData();
          break;
        case 'real-time':
          await this.syncRealTimeData();
          break;
      }
    } catch (error) {
      console.error(`Sync failed for ${type}:`, error);
      // Implement retry logic
    }
  }

  private async syncStaticData() {
    const client = new OpenF1Client();
    await Promise.all([
      this.syncCircuitData(client),
      this.syncHistoricalData(client)
    ]);
  }

  private async syncSemiDynamicData() {
    const client = new OpenF1Client();
    await Promise.all([
      this.syncSchedules(client),
      this.syncWeatherForecasts(client)
    ]);
  }

  private async syncRealTimeData() {
    const client = new OpenF1Client();
    await Promise.all([
      this.syncSessionStatus(client),
      this.syncCurrentConditions(client)
    ]);
  }
}

// Usage in server startup
export async function initializeSync() {
  const syncManager = SyncManager.getInstance();
  
  // Start static sync
  await syncManager.startSync('static');
  
  // Start semi-dynamic sync during office hours
  if (isOfficeHours()) {
    await syncManager.startSync('semi-dynamic');
  }
  
  // Start real-time sync only during active sessions
  if (await isSessionActive()) {
    await syncManager.startSync('real-time');
  }
}
```

## Sync Triggers

1. **System Events**
   - Application startup
   - Server deployment
   - Error recovery

2. **Time-based Events**
   - Daily at midnight UTC (static data)
   - Hourly during office hours (semi-dynamic)
   - Every 30 seconds during sessions (real-time)

3. **User Events**
   - First user accessing race page
   - User requesting refresh
   - High traffic periods

## Error Handling

```typescript
// services/openf1/sync-error-handler.ts
export class SyncErrorHandler {
  private static readonly MAX_RETRIES = 3;
  private static readonly BACKOFF_MS = 1000;

  static async withRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < this.MAX_RETRIES; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        await this.handleError(error, context, i);
        await this.delay(i);
      }
    }
    
    throw new Error(
      `Sync failed after ${this.MAX_RETRIES} retries: ${lastError.message}`
    );
  }

  private static async handleError(
    error: Error,
    context: string,
    attempt: number
  ) {
    console.error(
      `Sync error in ${context} (attempt ${attempt + 1}):`,
      error
    );
    
    // Log to monitoring service
    await this.logToMonitoring({
      context,
      error,
      attempt,
      timestamp: new Date()
    });
  }

  private static delay(attempt: number): Promise<void> {
    const ms = this.BACKOFF_MS * Math.pow(2, attempt);
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Monitoring

1. **Metrics to Track**
   - Sync success rate
   - Data freshness
   - API response times
   - Error frequency
   - Cache hit rates

2. **Alerts**
   - Sync failures
   - API timeouts
   - Data inconsistencies
   - Rate limit warnings

## Next Steps

1. Implement SyncManager
2. Set up monitoring
3. Create error handling
4. Add retry logic
5. Test sync scenarios 