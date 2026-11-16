/** One listener for every listing photo. A failed URL reveals the designed card. */
export function revealListingPhotoFallback(target: EventTarget | null) {
  if (!(target instanceof HTMLImageElement)) return
  const frame = target.closest(".race-listing-photo")
  if (!(frame instanceof HTMLElement)) return
  if (!frame.closest("[data-race-card]")) return
  frame.setAttribute("data-race-photo-failed", "")
}
