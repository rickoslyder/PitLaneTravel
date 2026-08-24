import { Resend } from "resend"
import { requiredServerEnv } from "@/config/server-env"

let client: Resend | undefined

function getClient(): Resend {
  if (!client) {
    client = new Resend(requiredServerEnv("RESEND_API_KEY"))
  }
  return client
}

export const resend: Resend = new Proxy({} as Resend, {
  get(_target, prop) {
    const real = getClient()
    const value = Reflect.get(real as object, prop, real)
    return typeof value === "function" ? value.bind(real) : value
  }
})
