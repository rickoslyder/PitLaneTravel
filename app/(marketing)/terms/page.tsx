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
            "Platform" refers to PitLane Travel's planning and booking website,
            mobile applications, and related services
          </li>
          <li>
            "Provider" refers to third-party service providers including but not
            limited to ticket vendors, hotels, airlines, and ground transport
            operators
          </li>
          <li>
            "User" refers to anyone accessing or using our platform in any
            capacity
          </li>
          <li>
            "Booking" refers to any reservation, purchase, or transaction made
            through service providers
          </li>
          <li>
            "Content" refers to all information, text, images, data, or other
            materials on our platform
          </li>
        </ul>

        <h2>3. Platform Usage</h2>
        <h3>3.1 Account Requirements</h3>
        <ul>
          <li>Must be at least 18 years old</li>
          <li>Provide accurate personal information</li>
          <li>Maintain account security</li>
          <li>Not share account credentials</li>
        </ul>

        <h3>3.2 Prohibited Activities</h3>
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-200">
          <p className="font-semibold">Users must not:</p>
          <ul>
            <li>Use the platform for any illegal purpose</li>
            <li>Attempt to access restricted areas</li>
            <li>Interfere with platform operation</li>
            <li>Scrape or harvest data</li>
            <li>Share false or misleading information</li>
            <li>Impersonate others</li>
          </ul>
        </div>

        <h2>4. Our Services</h2>
        <h3>4.1 What We Do</h3>
        <ul>
          <li>Provide F1 race weekend planning tools and information</li>
          <li>Connect users with official F1 event and travel providers</li>
          <li>Facilitate secure payment processing</li>
          <li>Offer planning resources and community features</li>
        </ul>

        <h3>4.2 Service Limitations</h3>
        <ul>
          <li>No direct provision of travel services</li>
          <li>No control over provider availability or pricing</li>
          <li>No guarantee of provider performance</li>
          <li>No handling of post-booking service delivery</li>
        </ul>

        <h2>5. Bookings and Payments</h2>
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
          <p className="font-semibold">Important Payment Information:</p>
          <ul>
            <li>All payments are processed securely through Stripe</li>
            <li>Prices are displayed in selected currency</li>
            <li>Additional provider fees may apply</li>
            <li>Exchange rates are indicative only</li>
          </ul>
        </div>

        <h2>6. Cancellations and Refunds</h2>
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
          <p className="font-semibold">Important:</p>
          <ul>
            <li>All cancellation policies are set by service providers</li>
            <li>Refund requests must be made directly to providers</li>
            <li>We cannot override provider decisions</li>
            <li>Processing times vary by provider</li>
          </ul>
        </div>

        <h2>7. Liability and Disclaimers</h2>
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

        <h2>8. Intellectual Property</h2>
        <ul>
          <li>All platform content is protected by copyright</li>
          <li>Trademarks are property of respective owners</li>
          <li>Limited license for personal use only</li>
          <li>No commercial use without permission</li>
        </ul>

        <h2>9. Data & Privacy</h2>
        <ul>
          <li>Subject to our Privacy Policy</li>
          <li>Data sharing with providers as necessary</li>
          <li>Cookie usage for platform functionality</li>
          <li>Marketing communications with consent</li>
        </ul>

        <h2>10. Dispute Resolution</h2>
        <h3>10.1 Platform Issues</h3>
        <ul>
          <li>Contact us for platform-specific problems</li>
          <li>30-day window for raising issues</li>
          <li>Good faith resolution attempts</li>
        </ul>

        <h3>10.2 Provider Issues</h3>
        <ul>
          <li>Contact provider directly</li>
          <li>Follow provider dispute procedures</li>
          <li>Platform assistance limited to facilitation</li>
        </ul>

        <h2>11. Termination</h2>
        <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          <p className="font-semibold">We reserve the right to:</p>
          <ul>
            <li>Suspend or terminate accounts</li>
            <li>Restrict platform access</li>
            <li>Remove content or features</li>
            <li>Modify or discontinue services</li>
          </ul>
        </div>

        <h2>12. Changes to Terms</h2>
        <ul>
          <li>Right to modify terms at any time</li>
          <li>Notice of material changes</li>
          <li>Continued use implies acceptance</li>
          <li>Regular review recommended</li>
        </ul>

        <h2>13. Contact Information</h2>
        <p>
          For platform-related legal inquiries:
          <br />
          Email:{" "}
          <a href="mailto:legal@pitlanetravel.com">legal@pitlanetravel.com</a>
          <br />
          For service issues, please contact your service provider directly.
        </p>

        <div className="mt-8 text-sm">
          <p>Last updated: January 2025</p>
          <p>Effective date: February 1, 2025</p>
          <p>Previous versions available upon request</p>
        </div>
      </div>
    </div>
  )
}
