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
        <p className="mt-2 text-[14px] text-warm">Last updated: September 4, 2026</p>

        <div className="mt-10 space-y-8 text-[16px] leading-[1.7] text-ink/80">
          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Information We Collect</h2>
            <p>When you submit an Acquisition Diagnostic fit-check form, contact form, or otherwise interact with PhynyxPro, we may collect your name, email address, phone number, business name, industry, and other information you voluntarily provide.</p>
            <p className="mt-3">The assessment and support forms record a fit-check or inquiry, not marketing consent. They do not contain a marketing-consent opt-in. Any marketing consent must be collected separately for the relevant channel and purpose.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">How We Use Your Information</h2>
            <p>We use the information you provide to assess business fit, process and respond to inquiries, deliver our services, and send transactional communications related to your submission or account. An assessment or support submission is not treated as a marketing opt-in. We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Data Storage & Security</h2>
            <p>Assessment and support submissions are processed through our website infrastructure and protected with access controls and encrypted network connections. We retain information only as long as reasonably necessary to provide our services, operate our business, or meet legal obligations.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Third-Party Services</h2>
            <p>PhynyxPro uses Cloudflare and OpenAI Sites for website infrastructure and GoHighLevel for customer relationship management, website attribution, and appointment booking. When you submit an assessment and continue to scheduling, the contact information you provided is securely passed to the GoHighLevel calendar so you do not need to enter it a second time. These providers process information under their own privacy terms. We share only the information needed for these functions.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Cookies & Analytics</h2>
            <p>We use cookies and analytics tools to understand how visitors interact with our website. This data helps us improve the experience and measure marketing effectiveness.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal information by submitting an inquiry through our support page. Requests are handled subject to applicable law and any necessary identity verification.</p>
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
