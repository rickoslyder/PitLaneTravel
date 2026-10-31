import { subDays } from "date-fns"

export interface RaceWeekendSession {
  date: Date
  description: string
}

/**
 * Session list the travel search already shows. These are day labels, not
 * official start times.
 */
export function raceWeekendSessions(raceDate: Date): RaceWeekendSession[] {
  return [
    {
      date: subDays(raceDate, 3),
      description: "Thursday session — check organizer"
    },
    {
      date: subDays(raceDate, 2),
      description: "Practice Sessions"
    },
    {
      date: subDays(raceDate, 1),
      description: "Qualifying/Sprint"
    },
    {
      date: raceDate,
      description: "Race Day"
    }
  ]
}
