"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { X, Plus } from "lucide-react"
import { RaceWithCircuitAndSeries } from "@/types/database"
import { Button } from "@/components/ui/button"

const MAX = 3

export function RaceCompare({
  races
}: {
  races: RaceWithCircuitAndSeries[]
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [picking, setPicking] = useState(false)

  const selected = selectedIds
    .map(id => races.find(r => r.id === id))
    .filter(Boolean) as RaceWithCircuitAndSeries[]

  const add = (id: string) => {
    setSelectedIds(prev => (prev.length < MAX ? [...prev, id] : prev))
    setPicking(false)
  }
  const remove = (id: string) =>
    setSelectedIds(prev => prev.filter(x => x !== id))

  const available = races.filter(r => !selectedIds.includes(r.id))

  const rows: {
    label: string
    render: (r: RaceWithCircuitAndSeries) => React.ReactNode
  }[] = [
    { label: "Series", render: r => r.series?.name ?? "Formula 1" },
    {
      label: "Date",
      render: r => format(new Date(r.date), "d MMM yyyy")
    },
    { label: "Circuit", render: r => r.circuit?.name ?? "—" },
    {
      label: "Location",
      render: r => `${r.circuit?.location ?? ""}${r.country ? `, ${r.country}` : ""}`
    },
    { label: "Round", render: r => `Round ${r.round}` },
    {
      label: "Sprint weekend",
      render: r => (r.is_sprint_weekend ? "Yes" : "No")
    },
    { label: "Status", render: r => r.status }
  ]

  return (
    <div className="space-y-4">
      {picking && (
        <div className="rounded-lg border p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium">Add a race</h3>
            <Button variant="ghost" size="sm" onClick={() => setPicking(false)}>
              Cancel
            </Button>
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {available.map(r => (
              <button
                key={r.id}
                onClick={() => add(r.id)}
                className="hover:bg-muted flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm"
              >
                <span>{r.name}</span>
                <span className="text-muted-foreground">
                  {format(new Date(r.date), "d MMM")}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selected.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">
            No races selected yet. Add two or three to compare them.
          </p>
          <Button className="mt-4" onClick={() => setPicking(true)}>
            <Plus className="mr-2 size-4" /> Add a race
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-32" />
                {selected.map(r => (
                  <th key={r.id} className="min-w-48 border-b p-3 text-left align-top">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold">{r.name}</span>
                      <button
                        onClick={() => remove(r.id)}
                        aria-label="Remove"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </th>
                ))}
                {selected.length < MAX && (
                  <th className="p-3 align-top">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPicking(true)}
                    >
                      <Plus className="mr-1 size-4" /> Add
                    </Button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.label} className="border-b">
                  <td className="text-muted-foreground p-3 font-medium">
                    {row.label}
                  </td>
                  {selected.map(r => (
                    <td key={r.id} className="p-3">
                      {row.render(r)}
                    </td>
                  ))}
                  {selected.length < MAX && <td />}
                </tr>
              ))}
              <tr>
                <td className="p-3" />
                {selected.map(r => (
                  <td key={r.id} className="p-3">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/races/${r.slug || r.id}`}>View race</Link>
                    </Button>
                  </td>
                ))}
                {selected.length < MAX && <td />}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
