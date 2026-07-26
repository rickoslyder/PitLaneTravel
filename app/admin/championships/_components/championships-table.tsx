"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Pencil } from "lucide-react"
import { SeriesFormDialog } from "./series-form-dialog"
import type { SelectSeries } from "@/db/schema/series-schema"

export function ChampionshipsTable({ series }: { series: SelectSeries[] }) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SelectSeries | undefined>()

  const openCreate = () => {
    setEditing(undefined)
    setDialogOpen(true)
  }

  const openEdit = (s: SelectSeries) => {
    setEditing(s)
    setDialogOpen(true)
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          New championship
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3">Series</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Event noun</th>
              <th className="p-3">Data provider</th>
              <th className="p-3">Active</th>
              <th className="p-3">Accent</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {series.map(s => (
              <tr key={s.id} className="border-t">
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3 font-mono text-xs">{s.slug}</td>
                <td className="p-3">{s.eventNoun}</td>
                <td className="p-3">
                  <span
                    className={
                      s.dataProvider === "openf1"
                        ? "rounded bg-green-100 px-2 py-0.5 text-xs text-green-800"
                        : "rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800"
                    }
                  >
                    {s.dataProvider}
                  </span>
                </td>
                <td className="p-3">{s.isActive ? "Yes" : "No"}</td>
                <td className="p-3">
                  {s.accentColor && (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block size-4 rounded-full border"
                        style={{ backgroundColor: s.accentColor }}
                      />
                      <span className="font-mono text-xs">{s.accentColor}</span>
                    </span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(s)}
                    aria-label={`Edit ${s.name}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SeriesFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        series={editing}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}
