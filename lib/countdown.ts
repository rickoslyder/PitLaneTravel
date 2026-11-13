export type CountdownParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export type HeroCountdownSeed = {
  name: string
  date: string
  circuitName: string | null
  /** Digits computed once on the server so the first client render matches. */
  initialTime?: CountdownParts
}

export function emptyCountdown(): CountdownParts {
  return { days: 0, hours: 0, minutes: 0, seconds: 0 }
}

export function timeLeftUntil(
  date: Date | string,
  now = new Date()
): CountdownParts {
  const target = new Date(date).getTime()
  const difference = target - now.getTime()
  if (!Number.isFinite(target) || difference < 0) return emptyCountdown()
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  }
}
