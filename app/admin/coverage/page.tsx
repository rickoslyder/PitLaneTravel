import { getCoverageMatrixAction } from "@/actions/db/coverage-actions"
import { CoverageTable } from "./_components/coverage-table"

export default async function CoveragePage() {
  const result = await getCoverageMatrixAction()

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Coverage</h2>
        <p className="text-muted-foreground">
          Derived coverage depth for every event. Tier is calculated from
          evidence, never stored.
        </p>
      </div>

      {!result.isSuccess ? (
        <div className="text-muted-foreground rounded-md border p-4 text-center">
          Failed to load coverage matrix
        </div>
      ) : (
        <CoverageTable rows={result.data} />
      )}
    </div>
  )
}
