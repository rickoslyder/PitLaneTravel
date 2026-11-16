import { firstTimersPage } from "./first-timers"
import { whatToBringPage } from "./what-to-bring"
import { withKidsPage } from "./with-kids"

/**
 * Race-hub fan-type and need sub-pages.
 *
 * To add a page:
 * 1. Copy an existing file in this folder and name it after the slug.
 * 2. Set hubSlug to the race guide filename in content/guides, without .mdx.
 * 3. Set slug to a year-free value: first-timers, with-kids (families),
 *    on-a-budget (budget), accessibility, solo-and-groups, hospitality
 *    (premium), what-to-bring, getting-there, or camping.
 * 4. Set hubBreadcrumbLabel (Abu Dhabi uses "Abu Dhabi GP") and a short
 *    breadcrumbLabel. The visible breadcrumb is Guides, that hub label, then
 *    the sub-page label.
 * 5. Write the overview (60–90 words, including "checked {date}"), one-line
 *    verdicts, and 6–10 questions. Mark 4–6 includeInFaqPage: true. FAQPage
 *    JSON-LD copies those question and answer strings with no rewrite. Do not
 *    repeat a question already in the hub FAQ or a sibling FAQPage.
 * 6. Leave published: false until Richard approves publication.
 * 7. Export the object and append it to raceHubSubpages below.
 *
 * Unpublished pages 404 when VERCEL_ENV is "production". On Vercel preview
 * and locally (VERCEL_ENV is not "production"), open
 * /guides/<hubSlug>/<slug> directly. They stay out of the sitemap and out of
 * every Plan by fan type block until published is true.
 *
 * The three Abu Dhabi entries are the approved 16 Nov 2026 copy with
 * published set to true. Merging that change publishes them. Do not link
 * /guides/f1-2027-general-admission-vs-grandstand until that guide file exists.
 */
export const raceHubSubpages = [firstTimersPage, withKidsPage, whatToBringPage]
