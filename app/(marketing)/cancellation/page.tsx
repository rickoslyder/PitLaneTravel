"use server"

export default function CancellationPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="prose prose-gray dark:prose-invert mx-auto max-w-4xl">
        <h1>Cancellation Policy</h1>
        <p className="lead">
          This policy explains how cancellations are handled for bookings made
          through PitLane Travel's F1 planning platform.
        </p>

        <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          <p className="font-semibold">Important Notice:</p>
          <p>
            As a travel planning platform, we do not set or control cancellation
            policies. Each service provider (such as ticket vendors, hotels, and
            transport companies) has their own cancellation policy.
          </p>
        </div>

        <h2>Understanding Cancellation Policies</h2>
        <p>
          When you make a booking through our platform, you'll be shown the
          specific cancellation policy for each service before confirmation.
          These policies may vary significantly between providers.
        </p>

        <h2>Common Cancellation Scenarios</h2>
        <h3>Race Tickets</h3>
        <ul>
          <li>Often non-refundable or have strict cancellation terms</li>
          <li>May offer resale options through official channels</li>
          <li>Insurance might be available at time of purchase</li>
        </ul>

        <h3>Accommodation</h3>
        <ul>
          <li>Policies vary by property and rate type</li>
          <li>May offer free cancellation up to a certain date</li>
          <li>Premium rates might have more flexible terms</li>
        </ul>

        <h3>Transportation</h3>
        <ul>
          <li>Airlines have their own cancellation policies</li>
          <li>Ground transport terms vary by provider</li>
          <li>Some tickets may be transferable</li>
        </ul>

        <h2>How to Cancel</h2>
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
          <p className="font-semibold">Cancellation Process:</p>
          <ol>
            <li>Review the cancellation policy in your booking confirmation</li>
            <li>
              Contact the service provider directly using their provided contact
              methods
            </li>
            <li>Follow the provider's specific cancellation procedure</li>
            <li>Keep all communication and confirmation numbers</li>
          </ol>
        </div>

        <h2>Our Role</h2>
        <p>While we cannot process cancellations directly, we can:</p>
        <ul>
          <li>Help you locate your booking information</li>
          <li>Provide provider contact details</li>
          <li>Explain general cancellation procedures</li>
          <li>Answer questions about the platform</li>
        </ul>

        <h2>Refunds</h2>
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-200">
          <p className="font-semibold">Important:</p>
          <ul>
            <li>All refunds are processed by the service provider</li>
            <li>Refund timeframes vary by provider</li>
            <li>Partial refunds may apply based on cancellation timing</li>
            <li>Some bookings may be non-refundable</li>
          </ul>
        </div>

        <h2>Contact Information</h2>
        <p>
          For platform-related questions about cancellations:
          <br />
          Email:{" "}
          <a href="mailto:support@pitlanetravel.com">
            support@pitlanetravel.com
          </a>
          <br />
          For specific booking cancellations, please contact your service
          provider directly.
        </p>

        <div className="mt-8 text-sm">
          <p>Last updated: January 2025</p>
        </div>
      </div>
    </div>
  )
}
