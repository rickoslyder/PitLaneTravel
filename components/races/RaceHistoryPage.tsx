"use client"

import { RaceWithDetails } from "@/types/race"
import { SelectRaceHistory } from "@/db/schema/race-history-schema"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface RaceHistoryPageProps {
  race: RaceWithDetails
  history: SelectRaceHistory
}

export function RaceHistoryPage({ race, history }: RaceHistoryPageProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <Link href={`/races/${race.id}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to Race Details
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">{race.name}: A Rich History</h1>
          <p className="text-muted-foreground mt-2">
            Explore the fascinating history and memorable moments of this iconic
            Formula 1 race.
          </p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {history.fullHistory}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
