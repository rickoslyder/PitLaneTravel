import { getAllSeriesAction } from "@/actions/db/series-actions"
import { ChampionshipsTable } from "./_components/championships-table"

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

      <ChampionshipsTable series={series ?? []} />
    </div>
  )
}
