import type { RaceHubSubpage } from "@/lib/race-hub-subpages"

/** Unpublished template sample. Not travel advice. Leave published false. */
export const withKidsPage = {
  hubSlug: "abu-dhabi-grand-prix-travel-guide",
  slug: "with-kids",
  published: false,
  title: "Abu Dhabi Grand Prix with kids: template sample",
  breadcrumbLabel: "With kids",
  description:
    "Unpublished template sample for the Abu Dhabi with-kids sub-page. Not a travel guide.",
  headline: "Abu Dhabi Grand Prix with kids: template sample",
  hubLinkLabel: "Full Abu Dhabi travel guide",
  hubBreadcrumbLabel: "Abu Dhabi GP guide",
  publishedAt: "2026-11-16",
  updatedAt: "2026-11-16",
  checkedOn: "2026-11-16",
  overview:
    "This with-kids page is an unpublished template sample for the Abu Dhabi hub. It is not a travel guide, and it stays unpublished so the live site never shows it. Three facts matter here: the opening answer comes first, the comparison table gives one verdict on each row, and each question can opt into the FAQ schema. Nothing on this page describes a real race, ticket, or hotel, checked 16 Nov 2026.",
  atAGlance: {
    ticket: "No ticket: this with-kids sample sells nothing.",
    stand: "No stand: this with-kids sample has no circuit.",
    transport: "No transport: this with-kids sample has no route.",
    stay: "No stay: this with-kids sample names no hotel.",
    budget: "No budget: this with-kids sample has no prices."
  },
  questions: [
    {
      question: "What is this with-kids template sample for?",
      answer:
        "It renders the with-kids sub-page template for tests and preview deployments. It is not advice about a race.",
      includeInFaqPage: true
    },
    {
      question:
        "Does this with-kids template sample describe a real grand prix?",
      answer:
        "No. Every statement on this with-kids sample is invented, checked 16 Nov 2026, and is not a fact about tickets, hotels, or transport.",
      includeInFaqPage: true
    },
    {
      question: "Which rows does this with-kids comparison table include?",
      answer:
        "Ticket, stand, transport, stay, and budget. Each cell on this with-kids sample is a one-line verdict.",
      includeInFaqPage: true
    },
    {
      question: "How does this with-kids page build its FAQ schema?",
      answer:
        "The visible with-kids questions and answers are the only source. The schema copies the marked ones character for character, checked 16 Nov 2026.",
      includeInFaqPage: true
    },
    {
      question: "Does this with-kids page include a video?",
      answer:
        "No. The with-kids video area is a placeholder with no player and no video schema.",
      includeInFaqPage: true
    },
    {
      question: "Who can open this with-kids page before publication?",
      answer:
        "Anyone with the preview or local deployment can open the with-kids URL directly. The live site does not list it.",
      includeInFaqPage: false
    },
    {
      question: "What does production do with this unpublished with-kids page?",
      answer:
        "A production deployment returns a 404 for this with-kids page and leaves it out of the sitemap.",
      includeInFaqPage: false
    },
    {
      question: "Do hub links include this unpublished with-kids page?",
      answer:
        "No. The Plan by fan type block lists published pages only, so this with-kids page is omitted.",
      includeInFaqPage: false
    }
  ],
  fanTips: ["Treat this with-kids sample as a template, not a trip plan."]
} satisfies RaceHubSubpage
