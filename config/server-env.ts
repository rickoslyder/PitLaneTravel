export class MissingServerEnvError extends Error {
  readonly key: string

  constructor(key: string) {
    super(`${key} is required`)
    this.name = "MissingServerEnvError"
    this.key = key
  }
}

export function requiredServerEnv(
  name: string,
  env: Record<string, string | undefined> = process.env
): string {
  const value = env[name]?.trim()
  if (!value) {
    throw new MissingServerEnvError(name)
  }
  return value
}
