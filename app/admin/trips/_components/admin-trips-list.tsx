"use client"

import { useState } from "react"
import { SelectTrip } from "@/db/schema"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { resyncTripFlightBookingsAction } from "@/actions/db/flight-bookings-actions"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface AdminTripsListProps {
  trips: SelectTrip[]
}

export function AdminTripsList({ trips }: AdminTripsListProps) {
  const [resyncingTrip, setResyncingTrip] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleResync = async (tripId: string) => {
    if (resyncingTrip) return // Prevent multiple clicks

    setResyncingTrip(tripId)
    try {
      const result = await resyncTripFlightBookingsAction(tripId)
      console.log("Resync result:", result)

      if (result.isSuccess) {
        toast({
          title: "Success",
          description: result.message,
          variant: "default"
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error resyncing flight bookings:", error)
      toast({
        title: "Error",
        description: "Failed to resync flight bookings",
        variant: "destructive"
      })
    } finally {
      // Small delay to prevent button flicker
      setTimeout(() => {
        setResyncingTrip(null)
      }, 500)
    }
  }

  return (
    <div className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trips.map(trip => (
            <TableRow key={trip.id}>
              <TableCell className="font-medium">{trip.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {trip.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {trip.visibility}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(trip.createdAt.toString())}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(trip.updatedAt.toString())}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResync(trip.id)}
                    disabled={resyncingTrip === trip.id}
                  >
                    {resyncingTrip === trip.id ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Resyncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 size-4" />
                        Resync Flights
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/trips/${trip.id}`)}
                  >
                    View
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
