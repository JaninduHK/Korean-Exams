import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-10 h-10 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Terms & Conditions</h1>
          </div>

          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing and using KoreanExams.com, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 mb-4">
                KoreanExams.com provides online practice exams, study materials, and progress tracking tools for individuals preparing for the Employment Permit System - Test of Proficiency in Korean (EPS-TOPIK) examination.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-600 mb-4">To use our services, you must:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Be at least 18 years old or have parental consent</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Subscription and Payments</h2>
              <p className="text-gray-600 mb-4">
                Certain features require a paid subscription. By subscribing, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Pay all applicable fees as described at the time of purchase</li>
                <li>Provide valid payment information</li>
                <li>Accept that subscriptions may auto-renew unless cancelled</li>
                <li>Understand that refunds are subject to our refund policy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Refund Policy</h2>
              <p className="text-gray-600 mb-4">
                Refund requests must be made within 7 days of purchase. Refunds will not be granted if you have accessed more than 20% of the subscribed content. Processing of refunds may take 5-10 business days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Acceptable Use</h2>
              <p className="text-gray-600 mb-4">You agree NOT to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Share your account credentials with others</li>
                <li>Copy, distribute, or reproduce any content from the platform</li>
                <li>Use automated systems to access the platform</li>
                <li>Attempt to hack, disrupt, or damage our systems</li>
                <li>Use the platform for any illegal purposes</li>
                <li>Impersonate others or provide false information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-600 mb-4">
                All content on the platform, including questions, audio files, images, and text, is the property of KoreanExams.com or its licensors. You are granted a limited, non-exclusive license to access and use the content for personal, non-commercial purposes only.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Disclaimer</h2>
              <p className="text-gray-600 mb-4">
                Our platform is designed to help you prepare for the EPS-TOPIK exam but does not guarantee exam success. We are not affiliated with the Human Resources Development Service of Korea or any official EPS-TOPIK administration body. Practice questions are for educational purposes and may differ from actual exam content.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-600 mb-4">
                To the maximum extent permitted by law, KoreanExams.com shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Service Availability</h2>
              <p className="text-gray-600 mb-4">
                We strive to maintain uninterrupted service but do not guarantee 100% availability. We reserve the right to modify, suspend, or discontinue any part of the service at any time with reasonable notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-600 mb-4">
                We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-600 mb-4">
                We may modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or platform notification.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-600 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of Sri Lanka. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Sri Lanka.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-600 mb-4">
                For questions about these Terms & Conditions, please contact us:
              </p>
              <p className="text-gray-600">
                Email: <a href="mailto:support@koreanexams.com" className="text-primary-600 hover:text-primary-700">support@koreanexams.com</a>
              </p>
              <p className="text-gray-600 mt-2">
                Or visit our <Link to="/contact" className="text-primary-600 hover:text-primary-700">Contact Page</Link>
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          &copy; {new Date().getFullYear()} KoreanExams.com. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
