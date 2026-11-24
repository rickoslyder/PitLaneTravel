"use server"

import "@/app/global-styles"
import NotFoundContent from "@/app/_components/not-found-content"
import { brand } from "@/config/brand"
import type { Metadata } from "next"

const notFoundTitle = `Page not found | ${brand.name}`

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: notFoundTitle,
    description: "That page has moved or does not exist.",
    openGraph: {
      title: notFoundTitle
    }
  }
}

export default async function RacesNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
      <NotFoundContent />
    </div>
  )
}
