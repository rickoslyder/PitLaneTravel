import { Metadata } from "next"
import Link from "next/link"
import { Package } from "lucide-react"
import { brand } from "@/config/brand"
import { siteCopy } from "@/config/site-copy"
import { getPackagesAvailability } from "@/lib/packages-availability"
import { pageSeo } from "@/lib/site-metadata"

const none = siteCopy(false)
const title = none.packagesTitle
const description = none.packagesDescription
const seo = pageSeo("/packages")

export const metadata: Metadata = {
  title,
  description,
  alternates: seo.alternates,
  openGraph: {
    title,
    description,
    type: "website",
    url: seo.openGraph.url,
    locale: "en_GB",
    siteName: brand.name,
    images: seo.openGraph.images
  },
  twitter: {
    card: "summary",
    title,
    description
  }
}

export default async function PackagesPage() {
  await getPackagesAvailability()
  const copy = siteCopy(false)

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-8">
      <header className="space-y-2 text-center">
        <Package className="text-primary mx-auto size-12" />
        <h1 className="text-4xl font-bold tracking-tight">
          {copy.packagesHeading}
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          {copy.packagesLede}
        </p>
      </header>

      <div className="text-center">
        <Link
          href="/races"
          className="inline-flex rounded-md bg-[#E10600] px-6 py-3 text-white hover:bg-[#FF0800]"
        >
          Find your race
        </Link>
      </div>
    </div>
  )
}
