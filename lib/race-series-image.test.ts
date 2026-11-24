import { existsSync } from "node:fs"
import path from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { RACE_CARD_PHOTOS } from "@/data/race-card-photos"
import { RacePhotoCredit } from "@/components/races/race-photo-credit"
import {
  RACE_SERIES_IMAGE_OVERRIDES,
  raceCardImage,
  raceImageAlt,
  resolveRaceImage,
  type RaceSeriesImageOverride
} from "@/lib/race-series-image"

const F1_PHOTO = "https://cdn.example/circuit-images/mexico.webp"
const FE_PHOTO = "https://cdn.example/series/formula-e/mexico.webp"
const MOTO_PHOTO = "https://cdn.example/series/motogp/lusail.webp"

const mexico = {
  name: "Mexico City E-Prix 2027",
  slug: "mexico-city-e-prix-2027-formula-e-2027",
  country: "Mexico",
  date: "2027-01-16T00:00:00.000Z",
  series: { slug: "formula-e", short_name: "FE", accent_color: "#00b1eb" },
  circuit: {
    name: "Autódromo Hermanos Rodríguez",
    country: "Mexico",
    image_url: F1_PHOTO,
    timezone_id: "America/Mexico_City"
  }
}

const VENUE_WORDS =
  /austin|tokyo|americas|miami|sanya|jeddah|monaco|shanghai|brands|excel|london/i

describe("series-aware race photos", () => {
  it("ships licensed photographs from this site", () => {
    expect(RACE_CARD_PHOTOS).toHaveLength(30)
    expect(RACE_SERIES_IMAGE_OVERRIDES).toHaveLength(44)
    const srcs = new Set(
      RACE_SERIES_IMAGE_OVERRIDES.map(entry => entry.imageUrl)
    )
    expect(srcs.size).toBe(30)
    for (const photo of RACE_CARD_PHOTOS) {
      expect(photo.src.startsWith("/images/race-cards/")).toBe(true)
      expect(photo.src.endsWith(".webp")).toBe(true)
      expect(photo.src).not.toMatch(/^https?:/)
      expect(photo.commonsUrl).toMatch(
        /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/
      )
      expect(photo.author.trim().length).toBeGreaterThan(0)
      expect(photo.alt.trim().length).toBeGreaterThan(0)
      expect(
        photo.licence === "public domain" ||
          /^CC BY(?:-SA)? \d/.test(photo.licence) ||
          photo.licence.startsWith("CC0")
      ).toBe(true)
      if (photo.licence.startsWith("CC BY")) {
        expect(photo.licenceUrl).toMatch(
          /^https:\/\/creativecommons\.org\/licenses\/by/
        )
      }
      if (photo.licence.includes("BY-SA")) {
        expect(photo.licence).toMatch(/CC BY-SA/)
      }
      expect(existsSync(path.join(process.cwd(), "public", photo.src))).toBe(
        true
      )
    }
    const slugs = RACE_SERIES_IMAGE_OVERRIDES.map(entry => entry.raceSlug)
    expect(new Set(slugs).size).toBe(44)
    for (const gap of [
      "spanish-grand-prix-2027-f1-2027",
      "grand-prix-of-japan-2027-motogp-2027",
      "grand-prix-of-malaysia-2027-motogp-2027"
    ]) {
      expect(slugs).not.toContain(gap)
    }
  })

  it("keeps the venue photo for Formula 1 and withholds it from other series", () => {
    expect(
      resolveRaceImage({
        series: { slug: "f1", short_name: "F1" },
        circuit: { image_url: F1_PHOTO, name: "Lusail International Circuit" }
      })
    ).toBe(F1_PHOTO)
    expect(
      resolveRaceImage({
        series: { short_name: "F1" },
        circuit: { image_url: F1_PHOTO }
      })
    ).toBe(F1_PHOTO)
    expect(resolveRaceImage(mexico)).toBe(
      "/images/race-cards/mexico-city-formula-e.webp"
    )
    expect(
      resolveRaceImage({
        name: "Grand Prix of Qatar 2027",
        series: { slug: "motogp", short_name: "MotoGP" },
        circuit: { name: "Lusail International Circuit", image_url: F1_PHOTO }
      })
    ).toBeNull()
    expect(
      resolveRaceImage({
        series: { slug: "wec", short_name: "WEC" },
        circuit: { image_url: F1_PHOTO }
      })
    ).toBeNull()
    expect(
      resolveRaceImage({
        series: { slug: "indycar", short_name: "IndyCar" },
        circuit: { image_url: F1_PHOTO }
      })
    ).toBeNull()
    expect(
      resolveRaceImage({
        circuit: { image_url: F1_PHOTO }
      })
    ).toBeNull()
    expect(
      resolveRaceImage({
        series: { slug: "f1", short_name: "F1" },
        circuit: { image_url: "/assets/placeholder.jpg" }
      })
    ).toBeNull()
  })

  it("prefers a per-race photo, then a race slug, then a series and circuit", () => {
    const overrides: RaceSeriesImageOverride[] = [
      {
        seriesSlug: "formula-e",
        circuitName: "Autodromo Hermanos Rodriguez",
        imageUrl: FE_PHOTO
      },
      {
        raceSlug: "qatar-grand-prix-motogp-2027",
        imageUrl: MOTO_PHOTO
      },
      {
        seriesSlug: "motogp",
        circuitName: "Lusail International Circuit",
        imageUrl: "https://cdn.example/series/motogp/lusail-generic.webp"
      }
    ]

    expect(
      resolveRaceImage({ ...mexico, raceImageUrl: FE_PHOTO }, overrides)
    ).toBe(FE_PHOTO)
    expect(resolveRaceImage(mexico, overrides)).toBe(FE_PHOTO)
    expect(
      resolveRaceImage(
        {
          slug: "qatar-grand-prix-motogp-2027",
          series: { slug: "motogp", short_name: "MotoGP" },
          circuit: {
            name: "Lusail International Circuit",
            image_url: F1_PHOTO
          }
        },
        overrides
      )
    ).toBe(MOTO_PHOTO)
    expect(
      resolveRaceImage(
        {
          series: { slug: "motogp" },
          circuit: { name: "Lusail International Circuit", image_url: F1_PHOTO }
        },
        overrides
      )
    ).toBe("https://cdn.example/series/motogp/lusail-generic.webp")
  })

  it("describes the card without a venue photo for other series", () => {
    const imageless = {
      ...mexico,
      name: "Imageless E-Prix 2027",
      slug: "imageless-e-prix-2027-formula-e-2027"
    }
    const card = raceCardImage(imageless)
    expect(card.src).toBeNull()
    expect(card.credit).toBeNull()
    expect(card.fallback.title).toBe("Imageless E-Prix 2027")
    expect(card.fallback.circuitName).toBe("Autódromo Hermanos Rodríguez")
    expect(card.fallback.series).toBe("FE")
    expect(card.fallback.country).toBe("Mexico")
    expect(card.fallback.dateLabel).toMatch(/2027/)
    expect(card.alt).toBe(
      `FE Imageless E-Prix 2027 at Autódromo Hermanos Rodríguez, Mexico, ${card.fallback.dateLabel}`
    )
    expect(card.alt).not.toMatch(/pit\s*lane|placeholder\.jpg|supabase/i)

    const licensed = raceCardImage(mexico)
    expect(licensed.src).toBe("/images/race-cards/mexico-city-formula-e.webp")
    expect(licensed.alt).toBe(
      "Formula E cars on track at the Autódromo Hermanos Rodríguez"
    )
    expect(licensed.credit?.author).toBe("Eder Lozada")
    expect(licensed.credit?.licence).toBe("CC BY 4.0")
    expect(licensed.fallback.alt).toContain("Mexico City E-Prix 2027")

    const f1 = raceCardImage({
      name: "Mexico City Grand Prix 2027",
      country: "Mexico",
      date: "2027-10-31T00:00:00.000Z",
      series: { slug: "f1", short_name: "F1", accent_color: "#e10600" },
      circuit: {
        name: "Autódromo Hermanos Rodríguez",
        image_url: F1_PHOTO
      }
    })
    expect(f1.src).toBe(F1_PHOTO)
    expect(f1.alt.startsWith("F1 Mexico City Grand Prix 2027 at ")).toBe(true)
  })

  it("keeps a true description when the photograph is not the card's venue", () => {
    const austin = raceCardImage({
      name: "Austin E-Prix 2027",
      slug: "austin-e-prix-2027-formula-e-2027",
      series: { slug: "formula-e", short_name: "FE" },
      circuit: {
        name: "Circuit of The Americas",
        image_url: F1_PHOTO
      }
    })
    expect(austin.src).toBe("/images/race-cards/formula-e-car.webp")
    expect(austin.alt).toBe("A Formula E car on track")
    expect(austin.alt).not.toMatch(VENUE_WORDS)
    expect(austin.credit?.licence).toBe("CC BY-SA 4.0")
    expect(austin.credit?.licenceUrl).toBe(
      "https://creativecommons.org/licenses/by-sa/4.0"
    )

    const zandvoort = raceCardImage({
      name: "Zandvoort E-Prix 2027 (Race 1)",
      slug: "zandvoort-e-prix-2027-race-1-formula-e-2027",
      series: { slug: "formula-e", short_name: "FE" },
      circuit: { name: "Circuit Zandvoort", image_url: F1_PHOTO }
    })
    expect(zandvoort.alt).toBe("Aerial view of Circuit Zandvoort")
    expect(zandvoort.alt).not.toMatch(/formula|e-prix|racing|\brace\b/i)

    const japan = resolveRaceImage({
      slug: "grand-prix-of-japan-2027-motogp-2027",
      series: { slug: "motogp", short_name: "MotoGP" },
      circuit: { name: "Mobility Resort Motegi", image_url: F1_PHOTO }
    })
    expect(japan).toBeNull()

    const credit = renderToStaticMarkup(
      createElement(RacePhotoCredit, {
        credit: {
          author: "Morio",
          licence: "CC BY-SA 4.0",
          licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
          commonsUrl:
            "https://commons.wikimedia.org/wiki/File:Pascal_Wehrlein_2024_Tokyo_Qualify-Duel.jpg"
        }
      })
    )
    expect(credit).toContain("Morio")
    expect(credit).toContain("CC BY-SA 4.0")
    expect(credit).toContain("https://creativecommons.org/licenses/by-sa/4.0")
    expect(credit).toContain("Wikimedia Commons")
    expect(credit).not.toMatch(/\/cursor\/|handoff|series_wrong_circuit/)
  })

  it("does not repeat the series when the race name already contains it", () => {
    expect(
      raceImageAlt({
        name: "Imageless Formula E E-Prix",
        series: "Formula E",
        circuitName: "Imageless Port Circuit",
        country: "Portugal"
      })
    ).toBe("Imageless Formula E E-Prix at Imageless Port Circuit, Portugal")
  })
})
