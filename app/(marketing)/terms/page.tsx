"use server"

export default async function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="prose prose-gray dark:prose-invert mx-auto max-w-4xl">
        <h1>Terms and Conditions</h1>
        <p className="lead">
          These terms govern your use of PitLane Travel's F1 travel planning
          platform. We help you plan and book your perfect F1 experience by
          connecting you with official event tickets, travel, and accommodation
          providers.
        </p>

        <h2>1. Platform Role</h2>
        <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          <p className="font-semibold">Important Notice:</p>
          <p>
            While we help you plan your F1 travel experience, please note that
            we do not:
          </p>
          <ul>
            <li>
              Own, operate, or directly provide any F1 events, tickets, or
              travel services
            </li>
            <li>
              Control pricing, availability, or service quality of providers
            </li>
            <li>
              Handle refunds or dispute resolution between users and service
              providers
            </li>
            <li>Guarantee service delivery or provider performance</li>
          </ul>
          <p>
            All services are delivered by independent third-party providers.
            Users must deal directly with these providers for any disputes,
            refunds, or service issues.
          </p>
        </div>

        <h2>2. Definitions</h2>
        <ul>
          <li>
            "Platform" refers to PitLane Travel's planning and booking website
          </li>
          <li>"Provider" refers to third-party service providers</li>
          <li>"User" refers to anyone accessing our platform</li>
          <li>
            "Booking" refers to reservations made through service providers
          </li>
        </ul>

        <h2>3. Our Services</h2>
        <h3>3.1 What We Do</h3>
        <ul>
          <li>Help you plan your F1 race weekend experience</li>
          <li>Connect you with official F1 event and travel providers</li>
          <li>Provide travel planning tools and information</li>
          <li>Process payments on behalf of providers</li>
        </ul>

        <h3>3.2 What We Don't Do</h3>
        <ul>
          <li>Provide any travel services directly</li>
          <li>Control provider policies or practices</li>
          <li>Handle post-booking service delivery</li>
          <li>Manage refunds or cancellations</li>
        </ul>

        <h2>4. Bookings and Payments</h2>
        <h3>4.1 Booking Process</h3>
        <ul>
          <li>Bookings are fulfilled by service providers</li>
          <li>We process payments as a payment facilitator</li>
          <li>Provider terms and conditions apply to all bookings</li>
          <li>Booking confirmations come from providers</li>
        </ul>

        <h2>5. Cancellations and Refunds</h2>
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
          <p className="font-semibold">Important:</p>
          <ul>
            <li>All cancellation policies are set by service providers</li>
            <li>Refund requests must be made directly to providers</li>
            <li>We cannot override provider decisions</li>
            <li>Processing times vary by provider</li>
          </ul>
        </div>

        <h2>6. Liability and Disclaimers</h2>
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-200">
          <p className="font-semibold">Liability Limitations:</p>
          <p>PitLane Travel is not liable for:</p>
          <ul>
            <li>Provider service quality or delivery</li>
            <li>Event cancellations or changes</li>
            <li>Refund or cancellation disputes</li>
            <li>Travel disruptions or issues</li>
            <li>Personal injury or property damage</li>
            <li>Any direct or indirect losses</li>
          </ul>
        </div>

        <h2>7. Dispute Resolution</h2>
        <h3>7.1 Service Issues</h3>
        <ul>
          <li>Contact service provider directly for service issues</li>
          <li>Follow provider's dispute process</li>
          <li>We may assist with provider contact only</li>
          <li>We cannot guarantee dispute outcomes</li>
        </ul>

        <h2>8. User Obligations</h2>
        <ul>
          <li>Read and accept provider terms</li>
          <li>Deal directly with providers for issues</li>
          <li>Provide accurate booking information</li>
          <li>Pay all applicable fees and charges</li>
        </ul>

        <h2>9. Changes to Terms</h2>
        <ul>
          <li>Right to modify platform terms</li>
          <li>Provider terms may change independently</li>
          <li>Notice of material changes</li>
        </ul>

        <h2>10. Contact Information</h2>
        <p>
          For platform-related inquiries only:
          <br />
          Email:{" "}
          <a href="mailto:legal@pitlanetravel.com">legal@pitlanetravel.com</a>
          <br />
          For service issues, please contact your service provider directly.
        </p>

        <div className="mt-8 text-sm">
          <p>Last updated: January 2025</p>
          <p>Effective date: February 1, 2025</p>
        </div>
      </div>
    </div>
  )
}
