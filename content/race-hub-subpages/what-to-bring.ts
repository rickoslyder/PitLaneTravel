import type { RaceHubSubpage } from "@/lib/race-hub-subpages"

/** Unpublished template sample. Not travel advice. Leave published false. */
export const whatToBringPage = {
  hubSlug: "abu-dhabi-grand-prix-travel-guide",
  slug: "what-to-bring",
  published: false,
  title: "Abu Dhabi Grand Prix what you can bring: template sample",
  breadcrumbLabel: "What to bring",
  description:
    "Unpublished template sample for the Abu Dhabi what-to-bring sub-page. Not a travel guide.",
  headline: "Abu Dhabi Grand Prix what you can bring: template sample",
  hubLinkLabel: "Full Abu Dhabi travel guide",
  hubBreadcrumbLabel: "Abu Dhabi GP guide",
  publishedAt: "2026-11-16",
  updatedAt: "2026-11-16",
  checkedOn: "2026-11-16",
  overview:
    "This what-to-bring page is an unpublished template sample for the Abu Dhabi hub. It is not a travel guide, and it stays unpublished so the live site never shows it. Three facts matter here: the opening answer comes first, the comparison table gives one verdict on each row, and each question can opt into the FAQ schema. Nothing on this page describes a real race, ticket, or hotel, checked 16 Nov 2026.",
  atAGlance: {
    ticket: "No ticket: this what-to-bring sample sells nothing.",
    stand: "No stand: this what-to-bring sample has no circuit.",
    transport: "No transport: this what-to-bring sample has no route.",
    stay: "No stay: this what-to-bring sample names no hotel.",
    budget: "No budget: this what-to-bring sample has no prices."
  },
  questions: [
    {
      question: "What is this what-to-bring template sample for?",
      answer:
        "It renders the what-to-bring sub-page template for tests and preview deployments. It is not advice about a race.",
      includeInFaqPage: true
    },
    {
      question:
        "Does this what-to-bring template sample describe a real grand prix?",
      answer:
        "No. Every statement on this what-to-bring sample is invented, checked 16 Nov 2026, and is not a fact about tickets, hotels, or transport.",
      includeInFaqPage: true
    },
    {
      question: "Which rows does this what-to-bring comparison table include?",
      answer:
        "Ticket, stand, transport, stay, and budget. Each cell on this what-to-bring sample is a one-line verdict.",
      includeInFaqPage: true
    },
    {
      question: "How does this what-to-bring page build its FAQ schema?",
      answer:
        "The visible what-to-bring questions and answers are the only source. The schema copies the marked ones character for character, checked 16 Nov 2026.",
      includeInFaqPage: true
    },
    {
      question: "Does this what-to-bring page include a video?",
      answer:
        "No. The what-to-bring video area is a placeholder with no player and no video schema.",
      includeInFaqPage: true
    },
    {
      question: "Who can open this what-to-bring page before publication?",
      answer:
        "Anyone with the preview or local deployment can open the what-to-bring URL directly. The live site does not list it.",
      includeInFaqPage: false
    },
    {
      question:
        "What does production do with this unpublished what-to-bring page?",
      answer:
        "A production deployment returns a 404 for this what-to-bring page and leaves it out of the sitemap.",
      includeInFaqPage: false
    },
    {
      question: "Do hub links include this unpublished what-to-bring page?",
      answer:
        "No. The Plan by fan type block lists published pages only, so this what-to-bring page is omitted.",
      includeInFaqPage: false
    }
  ],
  fanTips: ["Treat this what-to-bring sample as a template, not a trip plan."]
} satisfies RaceHubSubpage
