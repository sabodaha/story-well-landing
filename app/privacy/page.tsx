import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Privacy Policy — Story Well
          </h1>
          <p className="text-gray-600 mb-8">Last updated: November 24, 2025</p>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              This Privacy Policy explains how Story Well ("we", "us", "our") collects, uses, and protects your 
              information when you use our mobile application and website{" "}
              <a href="https://dartim-media.com/" className="text-purple-600 hover:text-purple-700">
                https://dartim-media.com/
              </a>{" "}
              and any related services (collectively, the "Service").
            </p>

            <p className="text-gray-700 leading-relaxed mb-8">
              We are committed to ensuring that your privacy is protected and that all data is handled in 
              accordance with applicable laws, including the GDPR.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.1. Information You Provide</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may collect information that you voluntarily provide when you:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>contact us via email (for example, admin@dartim-media.com),</li>
              <li>submit feedback or support requests.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">This information may include:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>your name,</li>
              <li>email address,</li>
              <li>any message content you include.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              We do not ask children to provide personal information.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.2. Automatically Collected Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you visit our website or use the app, we may automatically collect:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>device type and operating system,</li>
              <li>browser type (for the website),</li>
              <li>language settings,</li>
              <li>usage data (such as navigation, screens viewed, session duration).</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">We do not collect:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>precise location,</li>
              <li>contacts,</li>
              <li>photos,</li>
              <li>microphone or camera data,</li>
              <li>advertising IDs (unless explicitly enabled in the future).</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.3. Cookies (Website Only)</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Our website may use cookies or similar technologies to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>improve performance,</li>
              <li>remember your settings,</li>
              <li>analyze usage.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              You can disable cookies through your browser settings.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We may use the information we collect for:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>improving and optimizing the Service,</li>
              <li>providing customer support,</li>
              <li>maintaining security of the app and website,</li>
              <li>internal analytics,</li>
              <li>sending important updates (only if you contact us first).</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">We do not use your information for:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>targeted advertising,</li>
              <li>selling data to third parties.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Story Well is designed for families and children, but we do not knowingly collect personal data from children.
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>The app does not require children to enter names, emails, or other identifying information.</li>
              <li>Any contact must be initiated by an adult through our support email.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              If you believe a child has provided personal information, please contact us, and we will delete it immediately.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Storage and Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We take reasonable technical and organizational measures to protect your information from:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>unauthorized access,</li>
              <li>accidental loss,</li>
              <li>misuse,</li>
              <li>alteration.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use secure hosting providers and encrypted data transmission (HTTPS).
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              However, no online service is 100% secure, and we cannot guarantee absolute protection.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your data only for as long as necessary to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>provide the Service,</li>
              <li>comply with legal obligations,</li>
              <li>resolve disputes.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              If you contact us, we store your email and message history as long as needed for support purposes. 
              You may request deletion at any time.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Sharing Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share your information only in the following cases:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">✔️ 6.1. Service Providers</h3>
            <p className="text-gray-700 leading-relaxed mb-4">With trusted third-party providers who help us:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>host the website,</li>
              <li>measure analytics,</li>
              <li>store feedback emails.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              All providers comply with GDPR-level security and do not use data for their own purposes.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">✔️ 6.2. Legal Requirements</h3>
            <p className="text-gray-700 leading-relaxed mb-4">We may disclose information if required by:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>law,</li>
              <li>legal process,</li>
              <li>government request.</li>
            </ul>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-gray-900 font-semibold mb-2">❌ We DO NOT share information with:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>advertisers,</li>
                <li>marketing agencies,</li>
                <li>data brokers.</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our service providers may operate globally. When data is transferred outside the EU/EEA, we ensure:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>GDPR-compliant safeguards,</li>
              <li>Standard Contractual Clauses (SCCs),</li>
              <li>equivalent protection measures.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Your Rights (GDPR)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you are located in the EU/EEA, you have the right to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Access your data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion</li>
              <li>Restrict processing</li>
              <li>Object to processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              To exercise any rights, contact us at:{" "}
              <a href="mailto:admin@dartim-media.com" className="text-purple-600 hover:text-purple-700">
                📩 admin@dartim-media.com
              </a>
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Links to Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our website or app may contain links to external sites (for example, App Store or Google Play pages). 
              We are not responsible for their content or privacy practices.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              We encourage you to review their privacy policies.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. Updates will be posted on this page with the 
              "Last updated" date.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              We recommend checking it periodically to stay informed.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about this Privacy Policy or want to exercise your rights, contact us:
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <p className="text-gray-700 mb-2">
                📩 Email:{" "}
                <a href="mailto:admin@dartim-media.com" className="text-purple-600 hover:text-purple-700 font-semibold">
                  admin@dartim-media.com
                </a>
              </p>
              <p className="text-gray-700">
                🌍 Website:{" "}
                <a href="https://dartim-media.com/" className="text-purple-600 hover:text-purple-700 font-semibold">
                  https://dartim-media.com/
                </a>
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              We will respond as soon as possible.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}





