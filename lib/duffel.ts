import { Duffel } from "@duffel/api"

export const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN || ""
})
