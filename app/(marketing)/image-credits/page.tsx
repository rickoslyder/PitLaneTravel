import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { RacePhotoCredit } from "@/components/races/race-photo-credit"
import { RACE_CARD_PHOTOS } from "@/data/race-card-photos"

export const metadata: Metadata = {
  title: "Photograph credits",
  description:
    "Photographers and licences for the race photographs on this site."
}

export default function ImageCreditsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold">Photograph credits</h1>
      <p className="text-muted-foreground mt-4 text-lg">
        These photographs appear on race cards. Each credit names the
        photographer and the licence, and links to the licence and the file
        page.
      </p>
      <ul className="mt-10 space-y-10">
        {RACE_CARD_PHOTOS.map(photo => (
          <li key={photo.src}>
            <figure className="space-y-3">
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 48rem"
                  quality={65}
                  className="object-cover"
                />
              </div>
              <figcaption className="space-y-2">
                <RacePhotoCredit
                  credit={{
                    author: photo.author,
                    licence: photo.licence,
                    licenceUrl: photo.licenceUrl,
                    commonsUrl: photo.commonsUrl
                  }}
                />
                <p className="text-sm">
                  Used on{" "}
                  {photo.races.map((race, index) => (
                    <span key={race.slug}>
                      {index > 0 ? ", " : null}
                      <Link
                        href={`/races/${race.slug}`}
                        className="underline underline-offset-2"
                      >
                        {race.name}
                      </Link>
                    </span>
                  ))}
                  .
                </p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  )
}
