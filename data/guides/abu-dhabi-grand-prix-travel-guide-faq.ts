type FaqAnswer = {
  "@type": "Answer"
  text: string
}

type FaqQuestion = {
  "@type": "Question"
  name: string
  acceptedAnswer: FaqAnswer
}

type NineQuestions = readonly [
  FaqQuestion,
  FaqQuestion,
  FaqQuestion,
  FaqQuestion,
  FaqQuestion,
  FaqQuestion,
  FaqQuestion,
  FaqQuestion,
  FaqQuestion
]

/**
 * Schema.org FAQPage. The nine-question tuple is the stand-in for a
 * schema-dts FAQPage type: TypeScript rejects a different count or shape.
 */
export type AbuDhabiGuideFaqPage = {
  "@context": "https://schema.org"
  "@type": "FAQPage"
  mainEntity: NineQuestions
}

export const abuDhabiGrandPrixTravelGuideFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "When is the Abu Dhabi Grand Prix?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The 2026 Abu Dhabi Grand Prix runs Friday 4 to Sunday 6 December at Yas Marina Circuit, with the race at 17:00 local time (13:00 UTC) on Sunday 6 December, as the final round of the season. The 2027 race is scheduled for 10–12 December 2027 and will be a Sprint weekend. Dates were checked against formula1.com on 31 Oct 2026; check there before you book."
      }
    },
    {
      "@type": "Question",
      name: "Where should I stay for the Abu Dhabi Grand Prix?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stay on Yas Island if you can afford it and find a room. You're closest to the circuit and avoid the worst of the post-race traffic. Downtown Abu Dhabi is the middle option, with more choice and a taxi or bus 190 ride to Yas. Dubai usually has the most hotel choice, but it adds a much longer transfer each day, which matters after a late-finishing race."
      }
    },
    {
      "@type": "Question",
      name: "How do I get to Yas Marina Circuit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "By taxi or ride-hail, by bus 190 from Abu Dhabi Bus Station, or by car to Yas Mall (paid parking) and then the race-weekend shuttle, which the transport authority ran from there in 2025. From Dubai, take the bus from Al Ghubaiba to Abu Dhabi Bus Station, then route 190, or go by road."
      }
    },
    {
      "@type": "Question",
      name: "How much are Abu Dhabi GP tickets?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "As of 16 November 2026, most F1 Tickets grandstands are sold out, including West, North Straight, West Straight and Abu Dhabi Hill. Sunset Lounge and Shams Suite were still listed on F1 Tickets. The official promoter site lists the South Grandstand from AED 2,095. Other promoter starting prices were last checked 31 October 2026 and may have changed. Prices change, so recheck them on the official sites."
      }
    },
    {
      "@type": "Question",
      name: "Is the Abu Dhabi Grand Prix good for a first race?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It can be, if you want an easy, warm-weather weekend where the hotels, circuit and evening concerts are close together on one island. The trade-offs are a long-haul flight from the UK, prices at the top end of the calendar, and a championship that is sometimes already settled by the final round. If you want a cheaper first race closer to home, see our guide to choosing your first race."
      }
    },
    {
      "@type": "Question",
      name: "Is the 2026 race definitely going ahead?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "As of 31 Oct 2026, it's on the official F1 calendar with unchanged dates, and dates are subject to that calendar. Media report an unconfirmed Imola contingency. Check formula1.com and book flexible or refundable travel."
      }
    },
    {
      "@type": "Question",
      name: "How do I get back from Yas Marina after the race?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Fan reports from 2024–2025 describe long waits at Yas Mall for taxis and ride-hail. Plan your exit in advance: stay for the concert, eat on the island, or agree a pick-up point away from the main gates."
      }
    },
    {
      "@type": "Question",
      name: "Can I do the Abu Dhabi GP as a day trip from Dubai?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Fans report roughly 1 to 1.5 hours each way by car (2024–2025); we found no official time. Expect a late return, and keep bookings refundable."
      }
    },
    {
      "@type": "Question",
      name: "Can I go to Qatar and Abu Dhabi on one trip?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. In 2026 the races are a week apart (29 November and 6 December), and in 2027 they're back to back (3–5 and 10–12 December). Dates are subject to the official F1 calendar, so book flexible or refundable travel."
      }
    }
  ]
} as const satisfies AbuDhabiGuideFaqPage
