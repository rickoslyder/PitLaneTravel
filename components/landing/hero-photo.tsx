import { HOME_HERO_MOBILE_AVIF_HREF } from "@/lib/home-hero-image"

const HOME_HERO_SRC = "/images/home-hero.jpg"
const HOME_HERO_ALT =
  "Spectators in red shirts cheering from a grandstand as an open-wheel race car runs down the front straight under a bright sky"

/**
 * Supabase image transformations are not enabled on this project, so the
 * storage render URL returns 403 and next/image reports a 502. The public
 * object is an 8.5MB 5824×3264 JPEG. This is that photo resized to 2400px.
 * The painted scene underneath shows if the file fails to load.
 * Mobile LCP uses the prebuilt AVIF/WebP sources; the JPEG is the fallback.
 * The picture stays raw HTML so fetchpriority on the img survives React 18.
 * The matching preload is a link on the home server page, hoisted into <head>.
 * This file is a server component so the LCP image is not part of the hero
 * client bundle. decoding stays at the default so it can paint on the
 * critical path.
 */
const HOME_HERO_MARKUP = `<picture><source media="(max-width: 828px)" srcset="${HOME_HERO_MOBILE_AVIF_HREF}" type="image/avif"><source media="(max-width: 828px)" srcset="/images/home-hero-828.webp" type="image/webp"><source srcset="/images/home-hero-1600.avif" type="image/avif"><source srcset="/images/home-hero-1600.webp" type="image/webp"><img alt="${HOME_HERO_ALT}" src="${HOME_HERO_SRC}" fetchpriority="high" width="2400" height="1346" class="absolute size-full object-cover" sizes="100vw" onerror="this.remove()"></picture>`

export function HeroPhoto() {
  return (
    <>
      <div
        className="absolute inset-0 overflow-hidden bg-[#16324f]"
        data-hero-fallback=""
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-[#1e4d78] via-[#7eb6dc] to-[#d5e4f0]" />
        <div className="absolute right-[16%] top-[10%] size-28 rounded-full bg-[#ffe7a3] blur-2xl" />
        <div className="absolute bottom-0 left-0 h-[70%] w-[46%] origin-bottom-left -skew-x-[8deg] bg-gradient-to-br from-[#5c1218] via-[#9b1c24] to-[#c4232c]" />
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-b from-[#3c4046] to-[#121316]" />
        <div className="absolute bottom-[22%] left-[28%] right-[6%] h-px bg-white/80" />
        <div className="absolute bottom-[24%] right-[18%] h-3 w-20 rounded-sm bg-[#e10600] shadow-[0_0_28px_rgba(225,6,0,0.85)]" />
      </div>
      <div
        className="absolute inset-0"
        dangerouslySetInnerHTML={{ __html: HOME_HERO_MARKUP }}
      />
    </>
  )
}
