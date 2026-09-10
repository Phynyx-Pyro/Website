import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description: 'How PhynyxPro collects, uses, and protects your information.',
  path: '/privacy-policy',
})

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-ivory grain-subtle min-h-screen pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto max-w-[800px] px-6 lg:px-10">
        <h1 className="text-[36px] font-bold text-ink">Privacy Policy</h1>
        <p className="mt-2 text-[14px] text-warm">Last updated: September 7, 2026</p>

        <div className="mt-10 space-y-8 text-[16px] leading-[1.7] text-ink/80">
          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Information We Collect</h2>
            <p>When you submit a Growth Snapshot, contact form, or otherwise interact with PhynyxPro, we may collect your name, email address, phone number, business name, industry, acquisition metrics, business-performance estimates, and other information you voluntarily provide.</p>
            <p className="mt-3">When you choose to continue from the contact-details step, we save those details so we can help you complete your growth snapshot and coordinate a diagnostic by email. Our assessment forms offer separate, optional choices for marketing texts, appointment texts, and automated or AI-generated voice calls. We record your selections, the disclosure version, the submission time, and the source page. Submitting a form alone does not grant permission for texts or AI calls.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">How We Use Your Information</h2>
            <p>We use the information you provide to assess business fit, respond to inquiries, help complete requested assessments and bookings, deliver our services, and coordinate appointments. With your separate permission, we may send marketing texts, appointment texts, or make automated and AI-generated voice calls through Ember, our AI assistant. We do not sell your personal information. Mobile information and text-message opt-in data or consent are not shared with third parties or affiliates for their own marketing or promotional purposes.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Data Storage & Security</h2>
            <p>Assessment and support submissions are processed through our website infrastructure and protected with access controls and encrypted network connections. We retain information only as long as reasonably necessary to provide our services, operate our business, or meet legal obligations.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Third-Party Services</h2>
            <p>PhynyxPro uses Cloudflare and OpenAI Sites for website infrastructure and GoHighLevel for customer relationship management, communications, AI-assisted conversations, website attribution, and appointment booking. Contact and qualification details saved during your growth snapshot are passed to our CRM and, when you book, to the calendar. Submitted KPI answers and calculated results are stored with the website assessment record. Service providers process information as needed to operate these services, subject to applicable contractual and privacy obligations. AI conversations may be transcribed and summarized for the team. Please do not provide patient records or sensitive health information.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Cookies & Analytics</h2>
            <p>We use cookies and analytics tools to understand how visitors interact with our website. This data helps us improve the experience and measure marketing effectiveness.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal information by submitting an inquiry through our support page. Requests are handled subject to applicable law and any necessary identity verification.</p>
            <p className="mt-3">Reply STOP to stop text messages, or HELP for assistance. You may revoke call consent by asking the caller to stop or emailing craig@phynyxpro.com. Declining these optional channels does not prevent you from requesting a diagnostic.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Contact</h2>
            <p>For privacy-related inquiries, please visit our <a href="/support" className="text-phoenix hover:underline">support page</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
