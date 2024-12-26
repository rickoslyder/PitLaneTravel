# Circuit Mapping System

## Schema Update

```sql
ALTER TABLE "public"."circuits" 
ADD COLUMN IF NOT EXISTS "openf1_key" integer UNIQUE,
ADD COLUMN IF NOT EXISTS "openf1_short_name" text;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_circuits_openf1_key ON "public"."circuits"("openf1_key");
```

## Mapping Service

```typescript
// services/openf1/circuit-mapper.ts
export class CircuitMapper {
  private static readonly CIRCUIT_MAPPINGS: Record<string, number> = {
    // Manual mappings based on circuit names
    'albert_park': 1,
    'red_bull_ring': 2,
    'baku': 3,
    // ... add all circuits
  };

  static async initializeCircuitMappings(db: Database) {
    const openF1Client = new OpenF1Client();
    const circuits = await db.query.circuits.findMany();
    
    for (const circuit of circuits) {
      // Try to find matching OpenF1 circuit
      const openF1Circuit = await openF1Client.findCircuitByName(circuit.name);
      
      if (openF1Circuit) {
        await db.update(circuits)
          .set({
            openf1_key: openF1Circuit.circuit_key,
            openf1_short_name: openF1Circuit.circuit_short_name
          })
          .where(eq(circuits.id, circuit.id));
      }
    }
  }

  static async getOpenF1Key(circuitId: string): Promise<number | null> {
    const circuit = await db.query.circuits.findFirst({
      where: eq(circuits.id, circuitId),
      columns: { openf1_key: true }
    });
    
    return circuit?.openf1_key ?? null;
  }

  static async getCircuitId(openF1Key: number): Promise<string | null> {
    const circuit = await db.query.circuits.findFirst({
      where: eq(circuits.openf1_key, openF1Key),
      columns: { id: true }
    });
    
    return circuit?.id ?? null;
  }
}
```

## Migration Strategy

1. Create initial mapping table with known circuits
2. Add verification step to ensure all circuits are mapped
3. Set up error handling for unmapped circuits
4. Add logging for mapping mismatches

## Usage Example

```typescript
// Example: Fetching circuit details
async function getCircuitDetails(circuitId: string) {
  const openF1Key = await CircuitMapper.getOpenF1Key(circuitId);
  if (!openF1Key) {
    throw new Error(`No OpenF1 mapping for circuit: ${circuitId}`);
  }
  
  const client = new OpenF1Client();
  return client.getCircuitDetails(openF1Key);
}

// Example: Syncing session data
async function syncSessionData(openF1Session: OpenF1Session) {
  const circuitId = await CircuitMapper.getCircuitId(openF1Session.circuit_key);
  if (!circuitId) {
    throw new Error(`No circuit mapping for OpenF1 key: ${openF1Session.circuit_key}`);
  }
  
  // Proceed with session data sync
}
```

## Validation & Maintenance

1. Regular validation of mappings
2. Monitoring for unmapped circuits
3. Update process for new circuits
4. Backup of mapping data

## Next Steps

1. Create migration for schema changes
2. Implement CircuitMapper class
3. Create initial mapping data
4. Add validation tests
5. Set up monitoring 