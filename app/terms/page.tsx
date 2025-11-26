import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
            Terms of Service — Story Well
          </h1>
          <p className="text-gray-600 mb-8">Last updated: November 24, 2025</p>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              Welcome to Story Well ("we", "us", "our"). These Terms of Service ("Terms") govern your access 
              to and use of our mobile application, website{" "}
              <a href="https://dartim-media.com/" className="text-purple-600 hover:text-purple-700">
                https://dartim-media.com/
              </a>
              , and any other services we operate (collectively, the "Service").
            </p>

            <p className="text-gray-700 leading-relaxed mb-8">
              <strong>By accessing or using the Service, you agree to be bound by these Terms.</strong> If you 
              do not agree, please do not use the Service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Use of the Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may use the Service only in accordance with these Terms and all applicable laws.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>use the Service for unlawful or harmful activities;</li>
              <li>interfere with or disrupt the Service;</li>
              <li>copy, distribute, or reverse-engineer any part of the Service;</li>
              <li>attempt unauthorized access to our systems, accounts, or servers.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              You are responsible for ensuring that your use of the Service is appropriate for your age, local 
              laws, and parental oversight (if the app is used by children).
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Children's Use</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Story Well contains content designed for children, but the Service is intended to be used under 
              adult supervision.
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>We do not knowingly collect personal information from children.</li>
              <li>Any contact or data submission must be initiated by an adult (e.g., via email).</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              If you believe a child has provided personal information, please contact us so we can delete it.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Unless otherwise stated, all content in the Service — including illustrations, characters, stories, 
              text, graphics, and code — is the exclusive property of Story Well / Dartim Media or our licensors.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>reproduce, redistribute, or modify content without permission;</li>
              <li>use any Story Well content for commercial purposes;</li>
              <li>create derivative works based on our illustrations or stories without consent.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              <strong>All rights are reserved.</strong>
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. User Feedback</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you send us feedback, ideas, suggestions, or comments, you agree that:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>we may use them without obligation or compensation;</li>
              <li>they become part of our general product-improvement process.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              You retain ownership of the words you send, but grant us a non-exclusive license to use them for 
              improving the Service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service may contain links to or integrations with third-party platforms, such as:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>App Store</li>
              <li>Google Play</li>
              <li>analytics providers</li>
              <li>external websites</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not control these services and are not responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>their content,</li>
              <li>privacy practices,</li>
              <li>security,</li>
              <li>or availability.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              <strong>You use third-party services at your own risk.</strong>
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Availability of the Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We strive to keep the Service available, but we do not guarantee:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>uninterrupted or error-free operation,</li>
              <li>that defects will be corrected,</li>
              <li>or that the Service is free of viruses or security vulnerabilities.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              We may modify, suspend, or discontinue any part of the Service at any time without prior notice.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the fullest extent permitted by law, the Service is provided <strong>"as is"</strong> and{" "}
              <strong>"as available,"</strong> without warranties of any kind, whether express or implied.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">We disclaim all warranties, including:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>merchantability,</li>
              <li>fitness for a particular purpose,</li>
              <li>accuracy,</li>
              <li>non-infringement.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              <strong>You use the Service at your own discretion and risk.</strong>
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the maximum extent permitted by law, we are not liable for any:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>indirect, incidental, special, or consequential damages,</li>
              <li>loss of data,</li>
              <li>loss of profits,</li>
              <li>loss of business,</li>
              <li>device issues,</li>
              <li>or damages resulting from misuse or inability to use the Service.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              Our total liability is limited to the amount you paid for the Service (if any), or{" "}
              <strong>0 EUR if the Service is free.</strong>
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree to indemnify and hold Story Well harmless from any claims, damages, or losses arising out of:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>your use of the Service,</li>
              <li>violation of these Terms,</li>
              <li>misuse of the app or website,</li>
              <li>or infringement of rights of any third party.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms are governed by and interpreted in accordance with the <strong>laws of Germany</strong>, 
              without regard to its conflict-of-law principles.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Any disputes arising from these Terms must be resolved in the courts of <strong>Hessen, Germany</strong>.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may revise these Terms from time to time. Changes take effect when they are posted on this page, 
              with the "Last updated" date adjusted.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us:
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
              We aim to respond as soon as possible.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}





