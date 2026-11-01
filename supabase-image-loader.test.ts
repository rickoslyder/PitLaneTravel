import { describe, expect, it } from "vitest"
import supabaseLoader from "./supabase-image-loader"

describe("supabaseLoader", () => {
  it("serves the homepage hero from the public object, not the disabled render API", () => {
    const url = supabaseLoader({
      src: "assets/homepage/hero.jpeg",
      width: 1920,
      height: 1080,
      quality: 100
    })

    expect(url).toContain("/storage/v1/object/public/assets/homepage/hero.jpeg")
    expect(url).not.toContain("/render/image/")
    expect(url).not.toContain("quality=")
  })
})
