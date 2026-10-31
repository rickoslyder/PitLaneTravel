"use server"

import NotFoundContent from "@/app/_components/not-found-content"
import { PublicShell } from "@/components/public-shell"

export default async function NotFound() {
  return (
    <PublicShell>
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
        <NotFoundContent />
      </div>
    </PublicShell>
  )
}
