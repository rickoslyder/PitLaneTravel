"use client"

import { Card } from "@/components/ui/card"
import { SelectCircuit } from "@/db/schema"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Circle as CircuitIcon, MapPin, Clock, Globe2 } from "lucide-react"
import { format } from "date-fns"

interface CircuitsTableProps {
  circuits: SelectCircuit[]
}

export default function CircuitsTable({ circuits }: CircuitsTableProps) {
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Coordinates</TableHead>
            <TableHead>Timezone</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {circuits.map(circuit => (
            <TableRow key={circuit.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <CircuitIcon className="size-4 text-blue-500" />
                  <span className="font-medium">{circuit.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-gray-500" />
                  <div className="flex flex-col">
                    <span>{circuit.location}</span>
                    <span className="text-muted-foreground text-sm">
                      {circuit.country}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Globe2 className="size-4 text-gray-500" />
                  <div className="flex flex-col">
                    <span>Lat: {circuit.latitude}°</span>
                    <span>Long: {circuit.longitude}°</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-gray-500" />
                  <div className="flex flex-col">
                    <span>{circuit.timezoneName || "Not set"}</span>
                    <span className="text-muted-foreground text-sm">
                      {circuit.timezoneId || "—"}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground text-sm">
                  {format(new Date(circuit.updatedAt), "MMM d, yyyy HH:mm")}
                </span>
              </TableCell>
              <TableCell>
                <Button variant="ghost" asChild>
                  <Link href={`/admin/circuits/${circuit.id}`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
