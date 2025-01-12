"use server"

export default async function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="prose prose-gray dark:prose-invert mx-auto max-w-4xl">
        <h1>Privacy Policy</h1>
        <p className="lead">
          At PitLane Travel, we take your privacy seriously. This policy
          explains how we collect, use, and protect your personal information
          when you use our F1 travel planning platform.
        </p>

        <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          <p className="font-semibold">
            Important Notice About Service Providers:
          </p>
          <p>
            To help plan your F1 experience, we connect you with official event
            and travel service providers. When you make a booking:
          </p>
          <ul>
            <li>
              Your booking information will be shared with the relevant service
              providers
            </li>
            <li>
              Each provider has their own privacy policies and data practices
            </li>
            <li>We are not responsible for provider data handling</li>
            <li>Please review provider privacy policies before booking</li>
          </ul>
        </div>

        <h2>1. Information We Collect</h2>
        <h3>1.1 Platform Information</h3>
        <ul>
          <li>Name and contact details</li>
          <li>Login credentials</li>
          <li>Profile preferences</li>
          <li>Payment information (processed by Stripe)</li>
        </ul>

        <h3>1.2 Booking Information</h3>
        <ul>
          <li>Race and travel preferences</li>
          <li>Passport/ID for booking requirements</li>
          <li>Travel companion details</li>
          <li>Special requirements</li>
        </ul>

        <h2>2. Information Sharing</h2>
        <h3>2.1 Service Provider Data Sharing</h3>
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
          <p className="font-semibold">When you make a booking:</p>
          <ul>
            <li>
              Required booking information is shared with service providers
            </li>
            <li>Providers become independent data controllers</li>
            <li>Provider privacy policies will apply</li>
            <li>We cannot control provider data usage</li>
          </ul>
        </div>

        <h3>2.2 Platform Partners</h3>
        <p>We work with essential service partners:</p>
        <ul>
          <li>Stripe (payment processing)</li>
          <li>Clerk (authentication)</li>
          <li>PostHog (analytics)</li>
          <li>Supabase (database)</li>
        </ul>

        <h2>3. Data Usage</h2>
        <h3>3.1 Platform Operations</h3>
        <ul>
          <li>Help plan your F1 experience</li>
          <li>Process payments</li>
          <li>Provide customer support</li>
          <li>Improve platform features</li>
        </ul>

        <h3>3.2 Communication</h3>
        <ul>
          <li>Booking confirmations</li>
          <li>Travel planning updates</li>
          <li>Marketing (with consent)</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>We protect your platform data through:</p>
        <ul>
          <li>SSL/TLS encryption</li>
          <li>Access controls</li>
          <li>Regular security audits</li>
        </ul>

        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-200">
          <p className="font-semibold">Security Limitations:</p>
          <p>
            While we secure your platform data, we cannot guarantee the security
            of:
          </p>
          <ul>
            <li>Data after transfer to service providers</li>
            <li>Provider systems and practices</li>
            <li>Third-party services used by providers</li>
          </ul>
        </div>

        <h2>5. Your Rights</h2>
        <h3>5.1 Platform Data</h3>
        <p>For data we control, you can:</p>
        <ul>
          <li>Access your data</li>
          <li>Request corrections</li>
          <li>Delete your account</li>
          <li>Opt-out of marketing</li>
        </ul>

        <h3>5.2 Provider Data</h3>
        <p>For data shared with service providers:</p>
        <ul>
          <li>Contact providers directly</li>
          <li>Review provider privacy policies</li>
          <li>Follow provider data procedures</li>
        </ul>

        <h2>6. Data Retention</h2>
        <ul>
          <li>Account data: Until deletion</li>
          <li>Transaction records: 7 years</li>
          <li>Analytics: 26 months</li>
          <li>Provider data: Per provider policies</li>
          <li>Marketing preferences: Until updated</li>
          <li>Communication history: 3 years</li>
        </ul>

        <h2>7. Cookies & Tracking</h2>
        <h3>7.1 Essential Cookies</h3>
        <ul>
          <li>Authentication status</li>
          <li>Session management</li>
          <li>Security features</li>
          <li>Basic functionality</li>
        </ul>

        <h3>7.2 Analytics Cookies</h3>
        <ul>
          <li>Usage patterns (PostHog)</li>
          <li>Feature interaction</li>
          <li>Performance monitoring</li>
          <li>Error tracking</li>
        </ul>

        <h3>7.3 Marketing Cookies</h3>
        <p>Only set with explicit consent:</p>
        <ul>
          <li>Personalization preferences</li>
          <li>Marketing campaign tracking</li>
          <li>Social media integration</li>
        </ul>

        <h2>8. International Data Transfers</h2>
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
          <p className="font-semibold">Data Transfer Notice:</p>
          <ul>
            <li>Data may be processed in different jurisdictions</li>
            <li>We use EU-approved standard contractual clauses</li>
            <li>Partners maintain adequate data protection standards</li>
            <li>You can request information about data locations</li>
          </ul>
        </div>

        <h2>9. Legal Basis (GDPR)</h2>
        <h3>9.1 We process data based on:</h3>
        <ul>
          <li>Contract fulfillment (bookings, accounts)</li>
          <li>Legal obligations (financial records)</li>
          <li>Legitimate interests (platform improvement)</li>
          <li>Consent (marketing, cookies)</li>
        </ul>

        <h3>9.2 Your GDPR Rights</h3>
        <ul>
          <li>Right to be informed</li>
          <li>Right of access</li>
          <li>Right to rectification</li>
          <li>Right to erasure</li>
          <li>Right to restrict processing</li>
          <li>Right to data portability</li>
          <li>Right to object</li>
        </ul>

        <h2>10. California Privacy Rights (CCPA)</h2>
        <p>California residents have additional rights:</p>
        <ul>
          <li>Right to know what personal information is collected</li>
          <li>Right to know if personal information is sold or disclosed</li>
          <li>Right to say no to the sale of personal information</li>
          <li>Right to access personal information</li>
          <li>Right to equal service and price</li>
        </ul>

        <h2>11. Social Media Integration</h2>
        <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          <p className="font-semibold">Social Media Notice:</p>
          <ul>
            <li>Social login data usage</li>
            <li>Social sharing functionality</li>
            <li>Platform interaction tracking</li>
            <li>Third-party social widgets</li>
          </ul>
        </div>

        <h2>12. Children's Privacy</h2>
        <p>Our platform is not intended for children under 16:</p>
        <ul>
          <li>We do not knowingly collect data from children</li>
          <li>Parent/guardian consent required for users under 16</li>
          <li>Contact us to remove underage user data</li>
        </ul>

        <h2>13. Contact Us</h2>
        <p>
          For platform privacy inquiries only:
          <br />
          Email:{" "}
          <a href="mailto:privacy@pitlanetravel.com">
            privacy@pitlanetravel.com
          </a>
          <br />
          Data Protection Officer:{" "}
          <a href="mailto:privacy@pitlanetravel.com">
            privacy@pitlanetravel.com
          </a>
          <br />
          For provider data inquiries, please contact your service provider
          directly.
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
