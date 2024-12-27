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
import { Circle as CircuitIcon } from "lucide-react"

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
            <TableHead>Country</TableHead>
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
              <TableCell>{circuit.country}</TableCell>
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
