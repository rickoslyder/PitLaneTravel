import { sendGTMEvent } from "@next/third-parties/google"
import { RaceWithDetails } from "@/types/race"
export const gtmPixelID = "GTM-PF957G29"
export const gtmServerID = "GTM-5JPSQKB2"

export const RacePageViewEvent = (
  raceWithDetails: RaceWithDetails,
  userId: string
) => {
  return sendGTMEvent({
    event: "view_item",
    value: {
      user_data: {
        external_id: userId
      },
      x_fb_ud_external_id: userId,
      items: [
        {
          item_name: raceWithDetails.name,
          quantity: 1,
          // price: 123.45,
          item_category: "race",
          item_brand: "F1"
        }
      ]
    }
  })
}
