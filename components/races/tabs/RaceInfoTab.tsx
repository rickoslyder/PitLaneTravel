import { RaceWithDetails } from "@/types/race"
import { SelectRaceHistory } from "@/db/schema/race-history-schema"
import {
  TrackOverview,
  trackOverviewHasData
} from "../track-info/TrackOverview"
import { LapRecord, lapRecordHasData } from "../track-info/LapRecord"
import { CircuitHistory } from "../history/CircuitHistory"
import { TrackMap } from "../track-map"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface RaceInfoTabProps {
  race: RaceWithDetails
  history?: SelectRaceHistory
}

export function RaceInfoTab({ race, history }: RaceInfoTabProps) {
  const description = race.description?.trim()
  const showCircuit =
    trackOverviewHasData(race.circuit?.details) ||
    lapRecordHasData(race.circuit?.details)
  const trackMapUrl = race.circuit?.track_map_url

  return (
    <div className="space-y-6 overflow-hidden sm:space-y-8">
      <div className="prose prose-sm sm:prose-base prose-gray dark:prose-invert max-w-none">
        {description && (
          <>
            <h2 className="text-xl font-bold sm:text-2xl">About the Race</h2>
            <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="text-sm sm:text-base">
                <ReactMarkdown
                  className="prose-p:break-words prose-sm sm:prose-base prose-gray dark:prose-invert max-w-none"
                  remarkPlugins={[remarkGfm]}
                >
                  {description}
                </ReactMarkdown>
              </div>
            </div>
          </>
        )}

        {showCircuit && race.circuit && (
          <>
            <h2 className="mt-8 text-xl font-bold sm:text-2xl">
              Circuit Information
            </h2>
            <div className="not-prose -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                <TrackOverview circuit={race.circuit} />
                <LapRecord circuit={race.circuit} />
              </div>
            </div>
          </>
        )}

        {trackMapUrl && (
          <>
            <h2 className="mt-8 text-xl font-bold sm:text-2xl">Track Map</h2>
            <div className="not-prose -mx-4 sm:mx-0">
              <TrackMap
                trackMapUrl={trackMapUrl}
                name={race.circuit?.name || race.name}
              />
            </div>
          </>
        )}

        {history && (
          <>
            <h2 className="mt-8 text-xl font-bold sm:text-2xl">
              Circuit History
            </h2>
            <div className="not-prose -mx-4 sm:mx-0">
              <CircuitHistory
                history={history}
                raceId={race.id}
                raceSlug={race.slug || undefined}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
