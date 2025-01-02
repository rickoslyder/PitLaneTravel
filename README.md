# PitLane Travel

A comprehensive Formula 1 race weekend planning and travel management platform.

## Overview

PitLane Travel simplifies Formula 1 race weekend planning by providing:

### Core Features
- **Smart Trip Planning**
  - AI-powered trip planning assistant
  - Customizable itineraries
  - Budget optimization
  - Travel checklists
  - Calendar integration

- **Race Information**
  - Comprehensive race details and schedules
  - Circuit information and track maps
  - Grandstand comparisons
  - Supporting series schedules (F2, F3, F1 Academy)
  - Real-time weather and track conditions

- **Travel Management**
  - Real-time flight search and booking via Duffel API
  - Multi-airport search for each circuit
  - Local transport navigation
  - Walking routes to/from circuits
  - Parking information

- **Community Features**
  - User-generated travel tips
  - Race weekend meetups
  - Shared itineraries
  - Circuit-specific discussion forums
  - Travel buddy finder

### Data Integration
- **OpenF1 API Integration**
  - Real-time session schedules
  - Track conditions
  - Weather data
  - Circuit information

- **Duffel API Integration**
  - Global flight search
  - Real-time pricing
  - Booking management
  - Airport information

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI
- **Animations**: Framer Motion

### Backend
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle
- **API**: Server Actions
- **External APIs**: 
  - Duffel (Flights)
  - OpenF1 (Race Data)
  - Google Places (Location Data)

### Infrastructure
- **Authentication**: Clerk
- **Payments**: Stripe
- **Analytics**: PostHog
- **Deployment**: Vercel

## Project Structure

- `actions` - Server actions
  - `db` - Database related actions
  - Other actions
- `app` - Next.js app router
  - `api` - API routes
  - `route` - An example route
    - `_components` - One-off components for the route
    - `layout.tsx` - Layout for the route
    - `page.tsx` - Page for the route
- `components` - Shared components
  - `ui` - UI components
  - `utilities` - Utility components
- `db` - Database
  - `schema` - Database schemas
- `lib` - Library code
  - `hooks` - Custom hooks
- `prompts` - Prompt files
- `public` - Static assets
- `types` - Type definitions

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in the environment variables
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the development server

## Environment Variables

```bash
# DB (Supabase)
DATABASE_URL=

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup

# Payments (Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PORTAL_LINK=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY=

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Flight Search (Duffel)
DUFFEL_ACCESS_TOKEN=

# Maps & Places (Google)
GOOGLE_MAPS_API_KEY=
```

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
