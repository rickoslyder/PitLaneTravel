import { describe, expect, it } from "vitest"
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

describe("series-aware race photos", () => {
  it("ships no stand-in photos", () => {
    expect(RACE_SERIES_IMAGE_OVERRIDES).toEqual([])
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
    expect(resolveRaceImage(mexico)).toBeNull()
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
    const card = raceCardImage(mexico)
    expect(card.src).toBeNull()
    expect(card.fallback.title).toBe("Mexico City E-Prix 2027")
    expect(card.fallback.circuitName).toBe("Autódromo Hermanos Rodríguez")
    expect(card.fallback.series).toBe("FE")
    expect(card.fallback.country).toBe("Mexico")
    expect(card.fallback.dateLabel).toMatch(/2027/)
    expect(card.alt).toBe(
      `FE Mexico City E-Prix 2027 at Autódromo Hermanos Rodríguez, Mexico, ${card.fallback.dateLabel}`
    )
    expect(card.alt).not.toMatch(/pit\s*lane|placeholder\.jpg|supabase/i)

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
