import { Metadata } from "next"
import Link from "next/link"
import { Package } from "lucide-react"
import { siteCopy } from "@/config/site-copy"
import { getPackagesAvailability } from "@/lib/packages-availability"

const none = siteCopy(false)

export const metadata: Metadata = {
  title: none.packagesTitle,
  description: none.packagesDescription,
  robots: { index: false, follow: true }
}

export default async function PackagesPage() {
  await getPackagesAvailability()
  const copy = siteCopy(false)

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-8">
      <header className="space-y-2 text-center">
        <Package className="mx-auto size-12 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">{copy.packagesHeading}</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
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
