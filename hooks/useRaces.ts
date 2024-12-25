import { useQuery } from "@tanstack/react-query"
import type { Race } from "@/types/race"

async function fetchRaces(): Promise<Race[]> {
  const response = await fetch("/api/races")
  if (!response.ok) {
    throw new Error("Failed to fetch races")
  }
  const data = await response.json()
  return data.data
}

export function useRaces() {
  return useQuery<Race[], Error>({
    queryKey: ["races"],
    queryFn: fetchRaces,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  })
}
