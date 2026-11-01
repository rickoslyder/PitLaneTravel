export type CopyCard = {
  title: string
  description: string
}

export type WhyCard = CopyCard & {
  details: string
}

export type FaqItem = {
  question: string
  answer: string
}

export type HelpLink = {
  title: string
  description: string
  href: string
}

const aboutLedeNone =
  "The best race weekends go to people who've done it before. They know which stand has the view, which hotel isn't stuck in race traffic and when to leave the circuit. PitLane Travel puts that know-how on the race page for Formula 1, MotoGP, IndyCar, WEC and Formula E, so you can pick your race, your seat and your ticket knowing what you're getting."

const aboutLedeLive =
  "The best race weekends go to people who've done it before. They know which stand has the view, which hotel isn't stuck in race traffic and when to leave the circuit. PitLane Travel puts that know-how on the race page for Formula 1, MotoGP, IndyCar, WEC and Formula E. Then get the ticket to match or, for F1 and MotoGP, book a race package or VIP hospitality through PitLane, flights included if you want them."

const aboutMissionNone =
  "PitLane Travel brings the race weekend together for Formula 1, MotoGP, IndyCar, WEC and Formula E fans: the calendar, the circuit, the seats and the tickets, plus how to get there and back."

const aboutMissionLive =
  "PitLane Travel brings the race weekend together for Formula 1, MotoGP, IndyCar, WEC and Formula E fans: the calendar, the circuit, the seats and the tickets. For F1 and MotoGP, you can also book a race package or VIP hospitality through PitLane. Each package names the travel company that provides it before you book."

const whoBuysNone =
  "Tickets come from the seller named on the button, and you buy from them directly. Their refund terms apply, so check them before you pay."

const whoBuysLive =
  "Tickets come from the seller named on the button, and their refund terms apply. F1 and MotoGP packages and VIP hospitality are booked through PitLane and provided by a specialist travel company. Each package page names that company and shows its financial protection and cancellation terms before you pay."

const canBookLive =
  "Yes, for F1 and MotoGP. Pick your race, choose a package or VIP hospitality, and book through PitLane. Each package names the travel company that provides it, with its financial protection and cancellation terms, before you pay."

const championshipsNone =
  "Formula 1, MotoGP, IndyCar, WEC and Formula E. Every race is on the calendar, with seat guides, tickets and travel on the race page."

const grandstandAnswer =
  "Yes. Our grandstand guides show the view, the shade and what each stand looks onto, plus what fans who sat there said."

const ticketRealAnswer =
  "Buy from the official seller or an authorised agent. Resale tickets can be cancelled or swapped, so check who's selling before you pay."

const raceMovedAnswer =
  "Race dates follow the official calendar for each series. If a race moves or is cancelled, your ticket or package terms decide the refund, so check them before you pay."

const flightsHotelAnswer =
  "Search flights to the right airport from the race page, and find hotels in the circuit's town or city. Check the distance to the track, and book refundable where you can: race-week hotel bookings sometimes get cancelled."

const featureCards = (live: boolean): CopyCard[] => [
  {
    title: "Every race, one calendar",
    description: "Five series, this season and next."
  },
  {
    title: "Compare weekends",
    description: "Dates, cost, weather and travel, side by side."
  },
  {
    title: "Two races, one trip",
    description: "See which weekends across series fit together."
  },
  {
    title: "Know your seat",
    description: "What each grandstand looks onto, before you buy."
  },
  {
    title: "Find tickets",
    description: "Straight to tickets for your race and your stand."
  },
  live
    ? {
        title: "Race packages",
        description:
          "F1 and MotoGP: ticket, hotel and flights in one booking, through PitLane."
      }
    : {
        title: "What you can bring",
        description: "Bag, bottle and camera rules, circuit by circuit."
      },
  live
    ? {
        title: "VIP hospitality",
        description:
          "F1 and MotoGP hospitality: the view, what's included and who provides it, before you book."
      }
    : {
        title: "Buy tickets safely",
        description: "Official sellers versus resale, and how to tell them apart."
      },
  {
    title: "Getting there and back",
    description:
      "The right airport, the right town, and the quickest way out after the flag."
  }
]

const homeFaqs = (live: boolean): FaqItem[] => {
  const items: FaqItem[] = [
    {
      question: "Which championships do you cover?",
      answer: live
        ? `${championshipsNone} Race packages and VIP hospitality are for F1 and MotoGP.`
        : championshipsNone
    },
    {
      question: "Can I see what a grandstand is like before I buy?",
      answer: grandstandAnswer
    }
  ]

  if (live) {
    items.push({
      question: "Can I book a race package or VIP hospitality?",
      answer: canBookLive
    })
  }

  items.push(
    {
      question: "Who am I buying from?",
      answer: live ? whoBuysLive : whoBuysNone
    },
    {
      question: "Is my ticket real?",
      answer: ticketRealAnswer
    },
    {
      question: "What if the race is moved or cancelled?",
      answer: raceMovedAnswer
    },
    {
      question: "How do I sort flights and a hotel?",
      answer: flightsHotelAnswer
    }
  )

  return items
}

export type SiteCopy = {
  heroSubline: string
  heroSecondaryCta: { label: string; href: string }
  featureCards: CopyCard[]
  aboutLede: string
  aboutMission: string
  aboutBudget: CopyCard
  aboutDoCard: CopyCard
  whyChoose: {
    heading: string
    intro: string
    cards: WhyCard[]
  }
  homeFaqs: FaqItem[]
  faqSubtitle: string
  faqCoverage: FaqItem[]
  faqPlanning: FaqItem[]
  faqTravelCategory: string
  faqTravel: FaqItem[]
  helpSubtitle: string
  helpShowPackages: boolean
  helpRoutes: HelpLink[]
  helpFaqsDescription: string
  helpContactDescription: string
  helpAboutDescription: string
  helpTermsDescription: string
  helpCancellationDescription: string
  helpClosing: string
  grandstandLede: string
  packagesTitle: string
  packagesDescription: string
  packagesHeading: string
  packagesLede: string
}

export function siteCopy(live: boolean): SiteCopy {
  return {
    heroSubline: live
      ? "Race packages and VIP hospitality for Formula 1 and MotoGP, plus tickets and race guides for IndyCar, WEC and Formula E. The seat, the hotel and the way home, already worked out."
      : "Tickets and race guides for Formula 1, MotoGP, IndyCar, WEC and Formula E. The seat, the hotel and the way home, already worked out.",
    heroSecondaryCta: live
      ? { label: "See F1 & MotoGP packages", href: "/packages" }
      : { label: "Compare races", href: "/races/compare" },
    featureCards: featureCards(live),
    aboutLede: live ? aboutLedeLive : aboutLedeNone,
    aboutMission: live ? aboutMissionLive : aboutMissionNone,
    aboutBudget: live
      ? {
          title: "Every budget",
          description: "From general admission to VIP hospitality."
        }
      : {
          title: "Every budget",
          description: "From general admission to the best seat at the circuit."
        },
    aboutDoCard: live
      ? {
          title: "Packages and VIP for F1 and MotoGP",
          description:
            "Ticket, hotel and flights in one booking, or VIP hospitality, through PitLane."
        }
      : {
          title: "Getting there and back",
          description:
            "The right airport, the right town, and the quickest way out after the flag."
        },
    whyChoose: {
      heading: "Why go with PitLane Travel",
      intro: "The race, the seat and the way home, in one place.",
      cards: [
        {
          title: "Five series, one place",
          description:
            "F1, MotoGP, IndyCar, WEC and Formula E on one calendar.",
          details:
            "Compare weekends across series, this season and next, and see which two fit in one trip."
        },
        {
          title: "See your seat before you buy",
          description: "The view, the shade and what each stand looks onto.",
          details: "Every line is dated and sourced, so you know how current it is."
        },
        live
          ? {
              title: "F1 and MotoGP packages and VIP hospitality",
              description:
                "Ticket, hotel and flights in one booking, or go VIP, through PitLane.",
              details:
                "Each package names the travel company that provides it before you book."
            }
          : {
              title: "Get out on time",
              description: "The quickest way back after the flag.",
              details:
                "Exit routes, last trains and when to leave, checked for each race."
            }
      ]
    },
    homeFaqs: homeFaqs(live),
    faqSubtitle: "Common questions before a race weekend.",
    faqCoverage: [
      {
        question: "Which championships do you cover?",
        answer: live
          ? `${championshipsNone} Race packages and VIP hospitality are for F1 and MotoGP.`
          : championshipsNone
      },
      {
        question: "Can I see what a grandstand is like before I buy?",
        answer: grandstandAnswer
      }
    ],
    faqPlanning: [
      {
        question: "What can I do on PitLane Travel?",
        answer: live
          ? "Find your race, compare weekends, choose your seat and get tickets. For F1 and MotoGP, book a race package or VIP hospitality through PitLane."
          : "Find your race, compare weekends, choose your seat and get tickets, then sort flights and a hotel for the weekend."
      },
      {
        question: "Where do I get tickets?",
        answer: live
          ? "On each race page. The button shows who's selling. For F1 and MotoGP, tickets also come as part of a race package booked through PitLane."
          : "On each race page. The button shows who's selling."
      },
      {
        question: "Who am I buying from?",
        answer: live ? whoBuysLive : whoBuysNone
      },
      {
        question: "Is my ticket real?",
        answer: ticketRealAnswer
      },
      {
        question: "What if the race is moved or cancelled?",
        answer: raceMovedAnswer
      },
      {
        question: "How do I contact someone?",
        answer: "Use the contact form and tell us which race you're asking about."
      }
    ],
    faqTravelCategory: live
      ? "Packages, VIP, flights and hotels"
      : "Tickets, flights and hotels",
    faqTravel: [
      ...(live
        ? [
            {
              question: "Can I book a race package or VIP hospitality?",
              answer: canBookLive
            }
          ]
        : []),
      {
        question: "Can I get flights?",
        answer: "Search flights to the right airport from the race page."
      },
      {
        question: "Where should I stay?",
        answer:
          "Each race page links to hotels in the circuit's town or city. Check the distance to the track, and book refundable where you can."
      }
    ],
    helpSubtitle:
      "How to find your race and plan the weekend with PitLane Travel.",
    helpShowPackages: live,
    helpRoutes: [
      {
        title: "Race calendar",
        description:
          "Dates and venues for every Formula 1, MotoGP, IndyCar, WEC and Formula E race.",
        href: "/races"
      },
      {
        title: "Compare races",
        description:
          "Put race weekends side by side on dates, cost, weather and travel.",
        href: "/races/compare"
      },
      {
        title: "Hotels",
        description:
          "Find somewhere to stay in the circuit's town or city. Check the distance to the track and book refundable where you can.",
        href: "/hotels"
      },
      ...(live
        ? [
            {
              title: "Packages and VIP",
              description:
                "Race packages and VIP hospitality for F1 and MotoGP, booked through PitLane.",
              href: "/packages"
            }
          ]
        : [])
    ],
    helpFaqsDescription: live
      ? "Tickets, packages, VIP, flights and hotels, answered."
      : "Tickets, seats, flights and hotels, answered.",
    helpContactDescription: "Questions about a race? Send us a message.",
    helpAboutDescription: "Who we are and what we do.",
    helpTermsDescription: live
      ? "The terms for using PitLane Travel and booking with us."
      : "The terms for using PitLane Travel.",
    helpCancellationDescription: live
      ? "How cancellations and refunds work for packages and other bookings."
      : "How cancellations and refunds work, and when the seller's own terms apply.",
    helpClosing:
      "Send us a message and tell us which race you're asking about.",
    grandstandLede: live
      ? "Choose your seat before you buy. Compare the view, the shade, the price and what each stand looks onto, then get tickets for that stand or, at F1 and MotoGP races, a package."
      : "Choose your seat before you buy. Compare the view, the shade, the price and what each stand looks onto, then get tickets for that stand.",
    packagesTitle: "Race Packages | PitLane Travel",
    packagesDescription:
      "Race packages for F1 and MotoGP are on the way. Find your race and get tickets in the meantime.",
    packagesHeading: "Race packages",
    packagesLede:
      "Race packages for F1 and MotoGP are on the way. In the meantime, find your race and get tickets."
  }
}
