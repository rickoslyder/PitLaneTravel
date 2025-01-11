"use client"

import { useSearchParams } from "next/navigation"
import { AdminCheck } from "./admin-check-server"

export default function AdminCheckWrapper() {
  const searchParams = useSearchParams()
  const showAdmin = !searchParams.get("noadmin")

  if (!showAdmin) return null

  return <AdminCheck />
}
