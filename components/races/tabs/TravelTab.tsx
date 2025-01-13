import { RaceWithDetails } from "@/types/race"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SelectCircuitLocation } from "@/db/schema"
import { FlightSearch } from "../travel/FlightSearch"

interface TravelTabProps {
  race: RaceWithDetails
}

export function TravelTab({ race }: TravelTabProps) {
  return (
    <div className="space-y-8">
      <FlightSearch
        race={race}
        nearestAirports={
          race.circuit?.locations?.filter(
            (loc): loc is SelectCircuitLocation =>
              (loc.type === "airport" && typeof loc.address === "string") ||
              loc.address === null
          ) || []
        }
        onSearch={async searchParams => {
          const response = await fetch("/api/flights/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(searchParams)
          })
          const data = await response.json()
          if (!response.ok)
            throw new Error(data.error || "Failed to search flights")
          return data.offers
        }}
      />
      <div className="grid gap-6 md:grid-cols-2">
        {race.circuit?.transport_info &&
          race.circuit.transport_info.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Transport Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {race.circuit.transport_info.map(transport => (
                    <div key={transport.id}>
                      <h4 className="font-medium">{transport.name}</h4>
                      {transport.description && (
                        <p className="text-muted-foreground">
                          {transport.description}
                        </p>
                      )}
                      {transport.options && transport.options.length > 0 && (
                        <ul className="text-muted-foreground mt-2 list-inside list-disc">
                          {transport.options.map((option, index) => (
                            <li key={index}>{option}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {race.circuit?.locations &&
          race.circuit.locations.filter(loc => loc.type === "airport").length >
            0 && (
            <Card>
              <CardHeader>
                <CardTitle>Nearest Airports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {race.circuit.locations
                    .filter(
                      (loc): loc is SelectCircuitLocation =>
                        (loc.type === "airport" &&
                          typeof loc.address === "string") ||
                        loc.address === null
                    )
                    .map(airport => (
                      <div key={airport.placeId || airport.id}>
                        <h4 className="font-medium">{airport.name}</h4>
                        <div className="text-muted-foreground space-y-1">
                          <p>Distance: {airport.distanceFromCircuit}km</p>
                          <p>Transfer Time: {airport.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  )
}
