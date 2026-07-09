import { getAllSeriesAction } from "@/actions/db/series-actions"

export default async function ChampionshipsAdminPage() {
  const { data: series } = await getAllSeriesAction(true)

  return (
    <div className="container space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Championships</h2>
        <p className="text-muted-foreground">
          Top-level racing series (F1, Formula E, MotoGP, IndyCar, WEC). Distinct
          from &ldquo;Supporting Series&rdquo;, which are support races within a
          race weekend.
        </p>
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
            </tr>
          </thead>
          <tbody>
            {(series ?? []).map(s => (
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
              </tr>
            ))}
            {(!series || series.length === 0) && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No series yet. Run <code>scripts/seed-series.ts</code> to seed
                  F1, Formula E, MotoGP, IndyCar and WEC.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground">
        Series records are managed via <code>actions/db/series-actions.ts</code>{" "}
        (admin-guarded create/update/delete). Assign a race to a series on the
        race edit form.
      </p>
    </div>
  )
}
