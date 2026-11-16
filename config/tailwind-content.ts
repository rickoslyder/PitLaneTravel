/*
<ai_context>
Content globs for the split Tailwind builds.

The global sheet is what every public page downloads. It must not scan
admin-only modules, unreferenced modules, or React Email templates.
Those class strings are real utilities, but they never apply on the
public pages. Typography is a separate sheet (styles/prose.css) because
the plugin emits a full prose ruleset, not a handful of utilities.
</ai_context>
*/

const appGlobs = [
  "./pages/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  "./app/**/*.{ts,tsx}",
  "./src/**/*.{ts,tsx}"
]

const testGlobs = [
  "!./app/**/*.test.ts",
  "!./app/**/*.test.tsx",
  "!./components/**/*.test.ts",
  "!./components/**/*.test.tsx",
  "!./app/**/*.spec.ts",
  "!./app/**/*.spec.tsx",
  "!./components/**/*.spec.ts",
  "!./components/**/*.spec.tsx"
]

/**
 * Imported only from app/admin. Their utilities ship in styles/admin.css.
 * confirm-dialog, data-table, and race-select import other entries here.
 */
export const adminOnlyModules = [
  "./components/circuit-select.tsx",
  "./components/page-header.tsx",
  "./components/ui/alert-dialog.tsx",
  "./components/ui/confirm-dialog.tsx",
  "./components/ui/data-table.tsx",
  "./components/ui/form.tsx",
  "./components/ui/page-header.tsx",
  "./components/ui/switch.tsx",
  "./components/ui/table.tsx",
  "./components/utilities/race-select.tsx"
]

/**
 * No production importer. Scanning them only adds utilities to the
 * public sheet. FlightSearchForm is the only importer of date-picker,
 * and nothing imports FlightSearchForm.
 */
export const unreferencedModules = [
  "./app/components/ui/circuit-select.tsx",
  "./components/Footer.tsx",
  "./components/HeroSectionFromV0.tsx",
  "./components/PerformanceMonitor.tsx",
  "./components/flight-search.tsx",
  "./components/magicui/animated-gradient-text.tsx",
  "./components/magicui/hero-video-dialog.tsx",
  "./components/races/race-countdown/RaceCountdown.tsx",
  "./components/races/similar-races/SimilarRaces.tsx",
  "./components/races/travel/BookingConfirmation.tsx",
  "./components/races/travel/FlightSearchForm.tsx",
  "./components/races/travel/PassengerForm.tsx",
  "./components/races/travel/SeatMap.tsx",
  "./components/sidebar/team-switcher.tsx",
  "./components/skeletons/testimonial-section-skeleton.tsx",
  "./components/trip-planner-button.tsx",
  "./components/ui/aspect-ratio.tsx",
  "./components/ui/carousel.tsx",
  "./components/ui/chart.tsx",
  "./components/ui/coming-soon.tsx",
  "./components/ui/context-menu.tsx",
  "./components/ui/data-table-with-filters.tsx",
  "./components/ui/date-picker.tsx",
  "./components/ui/drawer.tsx",
  "./components/ui/hover-card.tsx",
  "./components/ui/input-otp.tsx",
  "./components/ui/menubar.tsx",
  "./components/ui/navigation-menu.tsx",
  "./components/ui/pagination.tsx",
  "./components/ui/progress.tsx",
  "./components/ui/radio-group.tsx",
  "./components/ui/resizable.tsx",
  "./components/ui/sonner.tsx",
  "./components/ui/toggle-group.tsx"
]

/**
 * Rendered through @react-email/tailwind, which inlines its own styles.
 * The website sheet does not style these messages.
 */
export const emailModules = ["./components/emails/**/*.{ts,tsx}"]

const excludedFromGlobal = [
  "!./app/admin/**/*.{ts,tsx}",
  ...adminOnlyModules.map(path => `!${path}`),
  ...unreferencedModules.map(path => `!${path}`),
  ...emailModules.map(path => `!${path}`)
]

export const globalContent = [...appGlobs, ...testGlobs, ...excludedFromGlobal]

export const adminContent = [
  "./app/admin/**/*.{ts,tsx}",
  ...adminOnlyModules,
  "!./app/admin/**/*.test.ts",
  "!./app/admin/**/*.test.tsx"
]

export const proseContentFiles = [
  "./pages/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  "./app/**/*.{ts,tsx}"
]
