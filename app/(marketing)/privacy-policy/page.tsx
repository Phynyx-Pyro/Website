import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — PhynyxPro',
  description: 'How PhynyxPro collects, uses, and protects your information.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-ivory grain-subtle min-h-screen pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto max-w-[800px] px-6 lg:px-10">
        <h1 className="text-[36px] font-bold text-ink">Privacy Policy</h1>
        <p className="mt-2 text-[14px] text-warm">Last updated: September 1, 2026</p>

        <div className="mt-10 space-y-8 text-[16px] leading-[1.7] text-ink/80">
          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Information We Collect</h2>
            <p>When you submit a Growth Assessment form, contact form, or otherwise interact with PhynyxPro, we may collect your name, email address, phone number, business name, industry, and other information you voluntarily provide.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">How We Use Your Information</h2>
            <p>We use the information you provide to assess business fit, respond to inquiries, deliver our services, and communicate with you about your account. We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Data Storage & Security</h2>
            <p>Your information is stored securely using industry-standard encryption and access controls. We retain your data only as long as necessary to provide our services or as required by law.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Third-Party Services</h2>
            <p>PhynyxPro uses third-party platforms for CRM, advertising, analytics, and communication. These services have their own privacy policies. We share only the information necessary to deliver our services.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Cookies & Analytics</h2>
            <p>We use cookies and analytics tools to understand how visitors interact with our website. This data helps us improve the experience and measure marketing effectiveness.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal information by contacting us through our support page. We will respond within a reasonable timeframe.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Contact</h2>
            <p>For privacy-related inquiries, please visit our <a href="/support" className="text-phoenix hover:underline">support page</a>.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
