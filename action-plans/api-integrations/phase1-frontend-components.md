# Phase 1: Frontend Components for OpenF1 Integration

## Component Structure

```typescript
// components/race-weekend/session-schedule.tsx
interface SessionScheduleProps {
  raceId: string;
  showCountdown?: boolean;
}

// components/race-weekend/circuit-details.tsx
interface CircuitDetailsProps {
  circuitId: string;
  showTechnicalData?: boolean;
}

// components/race-weekend/session-status.tsx
interface SessionStatusProps {
  sessionId: string;
  showLiveUpdates?: boolean;
}
```

## Component Implementations

### 1. Session Schedule Component

```tsx
// components/race-weekend/session-schedule.tsx
"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SessionSchedule } from "@/types"

export function SessionScheduleCard({ raceId, showCountdown = true }: SessionScheduleProps) {
  const [sessions, setSessions] = useState<SessionSchedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      const response = await fetch(`/api/races/${raceId}/sessions`)
      const data = await response.json()
      setSessions(data)
      setLoading(false)
    }

    fetchSessions()
  }, [raceId])

  if (loading) {
    return <SessionScheduleSkeleton />
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{session.sessionType.toUpperCase()}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(session.startTime), "EEE MMM d, h:mm a")}
                </p>
              </div>
              
              <Badge variant={getStatusVariant(session.status)}>
                {session.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SessionScheduleSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div>
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-32 mt-1" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function getStatusVariant(status: string) {
  switch (status) {
    case "live":
      return "destructive"
    case "completed":
      return "secondary"
    case "delayed":
      return "warning"
    case "cancelled":
      return "outline"
    default:
      return "default"
  }
}
```

### 2. Circuit Details Component

```tsx
// components/race-weekend/circuit-details.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircuitDetails } from "@/types"
import { 
  Track, 
  MapPin, 
  Ruler, 
  Flag,
  Timer 
} from "lucide-react"

export function CircuitDetailsCard({ 
  circuitId,
  showTechnicalData = true 
}: CircuitDetailsProps) {
  const [details, setDetails] = useState<CircuitDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      const response = await fetch(`/api/circuits/${circuitId}/details`)
      const data = await response.json()
      setDetails(data)
      setLoading(false)
    }

    fetchDetails()
  }, [circuitId])

  if (loading) {
    return <CircuitDetailsSkeleton />
  }

  if (!details) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Track className="h-5 w-5" />
          Circuit Details
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Track Length</p>
              <p className="text-sm text-muted-foreground">
                {details.trackLengthKm} km
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Race Laps</p>
              <p className="text-sm text-muted-foreground">
                {details.numberOfLaps} laps
              </p>
            </div>
          </div>

          {showTechnicalData && (
            <>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Pit Lane</p>
                  <p className="text-sm text-muted-foreground">
                    {details.pitLaneLengthKm} km ({details.pitLaneSide} side)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">DRS Zones</p>
                  <p className="text-sm text-muted-foreground">
                    {details.drsZones?.length || 0} zones
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CircuitDetailsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-40" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 3. Session Status Component

```tsx
// components/race-weekend/session-status.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SessionStatus } from "@/types"

export function SessionStatusCard({ 
  sessionId,
  showLiveUpdates = true 
}: SessionStatusProps) {
  const [status, setStatus] = useState<SessionStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      const response = await fetch(`/api/sessions/${sessionId}/status`)
      const data = await response.json()
      setStatus(data)
      setLoading(false)
    }

    fetchStatus()

    if (showLiveUpdates) {
      const interval = setInterval(fetchStatus, 30000) // Update every 30s
      return () => clearInterval(interval)
    }
  }, [sessionId, showLiveUpdates])

  if (loading) {
    return <SessionStatusSkeleton />
  }

  if (!status) {
    return null
  }

  return (
    <Card>
      <CardContent className="p-4">
        <Alert variant={getAlertVariant(status.status)}>
          <AlertDescription>
            {getStatusMessage(status)}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

function getAlertVariant(status: string) {
  switch (status) {
    case "live":
      return "default"
    case "delayed":
      return "warning"
    case "cancelled":
      return "destructive"
    default:
      return "default"
  }
}

function getStatusMessage(status: SessionStatus): string {
  switch (status.status) {
    case "live":
      return "Session is currently live"
    case "delayed":
      return `Session delayed: ${status.message}`
    case "cancelled":
      return `Session cancelled: ${status.message}`
    case "scheduled":
      return "Session scheduled to start soon"
    default:
      return "Session status unknown"
  }
}
```

## Usage Example

```tsx
// app/races/[id]/page.tsx
export default async function RaceWeekendPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return (
    <div className="space-y-6">
      <SessionScheduleCard 
        raceId={params.id}
        showCountdown={true}
      />
      
      <div className="grid md:grid-cols-2 gap-6">
        <CircuitDetailsCard 
          circuitId={params.id}
          showTechnicalData={true}
        />
        
        <SessionStatusCard 
          sessionId={params.id}
          showLiveUpdates={true}
        />
      </div>
    </div>
  )
}
```

## Component Features

1. Session Schedule:
   - Display all weekend sessions
   - Show session status
   - Optional countdown timer
   - Responsive layout
   - Loading states

2. Circuit Details:
   - Technical circuit information
   - DRS zone visualization
   - Circuit characteristics
   - Toggle technical data

3. Session Status:
   - Real-time status updates
   - Status-based styling
   - Auto-refresh capability
   - Error handling

## Next Steps

1. Implement components
2. Add unit tests
3. Create Storybook stories
4. Add E2E tests
5. Document usage
6. Create demo page 