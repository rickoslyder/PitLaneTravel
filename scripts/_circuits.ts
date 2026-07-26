/*
Shared circuit resolver for seed scripts. Resolves a seed circuit name to an existing
circuit row (via data/seeds/circuit-aliases.json + case/whitespace-insensitive match)
before creating a new one, so seeds reuse the DB's canonical circuits instead of spawning
near-duplicates for the same venue.
*/

import { readFileSync } from "node:fs"
import { join } from "node:path"
import { db } from "@/db/db"
import { circuitsTable } from "@/db/schema"
import { eq, sql } from "drizzle-orm"

const aliases: Record<string, string> = JSON.parse(
  readFileSync(join(process.cwd(), "data/seeds/circuit-aliases.json"), "utf8")
).aliases

export interface CircuitSeed {
  circuit: string
  location: string
  country: string
  latitude: number
  longitude: number
}

/** Resolve to an existing circuit id, or create one. Returns { id, created, name }. */
export async function findOrCreateCircuit(
  r: CircuitSeed
): Promise<{ id: string; created: boolean; name: string }> {
  const canonical = aliases[r.circuit] ?? r.circuit

  // 1. exact match on canonical name
  const [exact] = await db
    .select({ id: circuitsTable.id, name: circuitsTable.name })
    .from(circuitsTable)
    .where(eq(circuitsTable.name, canonical))
    .limit(1)
  if (exact) return { id: exact.id, created: false, name: exact.name }

  // 2. case/whitespace-insensitive match (guards against stray casing)
  const [ci] = await db
    .select({ id: circuitsTable.id, name: circuitsTable.name })
    .from(circuitsTable)
    .where(sql`lower(btrim(${circuitsTable.name})) = lower(btrim(${canonical}))`)
    .limit(1)
  if (ci) return { id: ci.id, created: false, name: ci.name }

  // 3. create
  const [created] = await db
    .insert(circuitsTable)
    .values({
      name: canonical,
      location: r.location,
      country: r.country,
      latitude: r.latitude.toString(),
      longitude: r.longitude.toString()
    })
    .returning({ id: circuitsTable.id, name: circuitsTable.name })
  return { id: created.id, created: true, name: created.name }
}

/**
 * Resolve a circuit name to an existing row WITHOUT ever creating one.
 *
 * Use this when a missing circuit should be an error: findOrCreateCircuit commits its
 * placeholder before returning `created`, so checking that flag afterwards still leaves
 * a junk row behind. Applies the same alias + case-insensitive matching.
 */
export async function findExistingCircuitId(
  circuitName: string
): Promise<string | null> {
  const canonical = aliases[circuitName] ?? circuitName

  const [exact] = await db
    .select({ id: circuitsTable.id })
    .from(circuitsTable)
    .where(eq(circuitsTable.name, canonical))
    .limit(1)
  if (exact) return exact.id

  const [ci] = await db
    .select({ id: circuitsTable.id })
    .from(circuitsTable)
    .where(sql`lower(btrim(${circuitsTable.name})) = lower(btrim(${canonical}))`)
    .limit(1)
  return ci?.id ?? null
}
