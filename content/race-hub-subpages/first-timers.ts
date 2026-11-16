import type { RaceHubSubpage } from "@/lib/race-hub-subpages"

/** Unpublished template sample. Not travel advice. Leave published false. */
export const firstTimersPage = {
  hubSlug: "abu-dhabi-grand-prix-travel-guide",
  slug: "first-timers",
  published: false,
  title: "Abu Dhabi Grand Prix first-timers: template sample",
  breadcrumbLabel: "First-timers",
  description:
    "Unpublished template sample for the Abu Dhabi first-timers sub-page. Not a travel guide.",
  headline: "Abu Dhabi Grand Prix first-timers: template sample",
  hubLinkLabel: "Full Abu Dhabi travel guide",
  hubBreadcrumbLabel: "Abu Dhabi GP guide",
  publishedAt: "2026-11-16",
  updatedAt: "2026-11-16",
  checkedOn: "2026-11-16",
  overview:
    "This first-timers page is an unpublished template sample for the Abu Dhabi hub. It is not a travel guide, and it stays unpublished so the live site never shows it. Three facts matter here: the opening answer comes first, the comparison table gives one verdict on each row, and each question can opt into the FAQ schema. Nothing on this page describes a real race, ticket, or hotel, checked 16 Nov 2026.",
  atAGlance: {
    ticket: "No ticket: this first-timers sample sells nothing.",
    stand: "No stand: this first-timers sample has no circuit.",
    transport: "No transport: this first-timers sample has no route.",
    stay: "No stay: this first-timers sample names no hotel.",
    budget: "No budget: this first-timers sample has no prices."
  },
  questions: [
    {
      question: "What is this first-timers template sample for?",
      answer:
        "It renders the first-timers sub-page template for tests and preview deployments. It is not advice about a race.",
      includeInFaqPage: true
    },
    {
      question:
        "Does this first-timers template sample describe a real grand prix?",
      answer:
        "No. Every statement on this first-timers sample is invented, checked 16 Nov 2026, and is not a fact about tickets, hotels, or transport.",
      includeInFaqPage: true
    },
    {
      question: "Which rows does this first-timers comparison table include?",
      answer:
        "Ticket, stand, transport, stay, and budget. Each cell on this first-timers sample is a one-line verdict.",
      includeInFaqPage: true
    },
    {
      question: "How does this first-timers page build its FAQ schema?",
      answer:
        "The visible first-timers questions and answers are the only source. The schema copies the marked ones character for character, checked 16 Nov 2026.",
      includeInFaqPage: true
    },
    {
      question: "Does this first-timers page include a video?",
      answer:
        "No. The first-timers video area is a placeholder with no player and no video schema.",
      includeInFaqPage: true
    },
    {
      question: "Who can open this first-timers page before publication?",
      answer:
        "Anyone with the preview or local deployment can open the first-timers URL directly. The live site does not list it.",
      includeInFaqPage: false
    },
    {
      question:
        "What does production do with this unpublished first-timers page?",
      answer:
        "A production deployment returns a 404 for this first-timers page and leaves it out of the sitemap.",
      includeInFaqPage: false
    },
    {
      question: "Do hub links include this unpublished first-timers page?",
      answer:
        "No. The Plan by fan type block lists published pages only, so this first-timers page is omitted.",
      includeInFaqPage: false
    }
  ],
  fanTips: ["Treat this first-timers sample as a template, not a trip plan."],
  affiliateLinks: [
    {
      partner: "Fixture Partner",
      href: "https://example.com/fixture-affiliate",
      label: "Fixture partner link (not a real offer)"
    }
  ]
} satisfies RaceHubSubpage
