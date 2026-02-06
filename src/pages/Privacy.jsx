import React from 'react';

/**
 * Privacy Policy Page
 * Required for Google AdSense compliance
 */
const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Privacy Policy
          </h1>
          
          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Information We Collect
              </h2>
              <p className="text-gray-600 mb-4">
                PipeForge Exam Prep collects information to provide and improve our educational services. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Account information (email, name)</li>
                <li>Study progress and quiz results</li>
                <li>Usage patterns and learning analytics</li>
                <li>Technical information (browser, device type)</li>
                <li>Authentication method (Google OAuth or email)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                How We Use Your Information
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Service Delivery:</strong> To provide access to Steamfitter/Pipefitter exam preparation materials, track progress, and administer quizzes.
                </p>
                <p>
                  <strong>Personalization:</strong> To customize learning experience based on your progress and preferences.
                </p>
                <p>
                  <strong>Communication:</strong> To send important updates about your account and service changes.
                </p>
                <p>
                  <strong>Analytics:</strong> To understand how our service is used and improve educational content.
                </p>
                <p>
                  <strong>Advertising:</strong> To display relevant advertisements through Google AdSense to keep our service free.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Information Sharing
              </h2>
              <p className="text-gray-600 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties, except:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>With your consent for specific purposes</li>
                <li>To comply with legal obligations</li>
                <li>To protect rights and property</li>
                <li>With trusted service providers who assist in operating our service</li>
                <li>In connection with business transfers (with privacy protections)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Google Authentication
              </h2>
              <p className="text-gray-600 mb-4">
                When you choose to sign in with Google, we receive:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Your Google account email address</li>
                <li>Your basic profile information (name)</li>
                <li>Authentication tokens to maintain your session</li>
              </ul>
              <p className="text-gray-600">
                We do not access your Google account beyond what's necessary for authentication and do not store your Google password.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Data Security
              </h2>
              <p className="text-gray-600 mb-4">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Secure HTTPS connections</li>
                <li>Encrypted data storage with Supabase</li>
                <li>Row Level Security (RLS) for data access control</li>
                <li>Regular security audits and updates</li>
                <li>Limited data access to authorized personnel only</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Cookies and Tracking
              </h2>
              <p className="text-gray-600 mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Remember your login preferences</li>
                <li>Track study progress</li>
                <li>Analyze service usage</li>
                <li>Display relevant advertisements</li>
                <li>Improve user experience</li>
              </ul>
              <p className="text-gray-600">
                You can control cookies through your browser settings. Disabling cookies may affect some features of our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Google AdSense
              </h2>
              <p className="text-gray-600 mb-4">
                This service uses Google AdSense to display advertisements:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Ads are based on your interests and browsing behavior</li>
                <li>Google may use cookies for ad personalization</li>
                <li>Ad data is collected by Google, not directly by us</li>
                <li>You can opt out of personalized ads through Google's Ad Settings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Your Rights
              </h2>
              <p className="text-gray-600 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
                <li>Disable cookies (though this may affect service functionality)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Children's Privacy
              </h2>
              <p className="text-gray-600">
                Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13. 
                If we become aware that we have collected information from a child under 13, we will take steps to delete such information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Changes to This Policy
              </h2>
              <p className="text-gray-600">
                We may update this privacy policy from time to time. We will notify you of any changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Posting the updated policy on our website</li>
                <li>Sending email notifications for significant changes</li>
                <li>Updating the effective date at the top of this policy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-600">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@pipeforge-exam-prep.com<br />
                  <strong>Response Time:</strong> Within 7 business days
                </p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}<br />
                <strong>Effective Date:</strong> February 5, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
