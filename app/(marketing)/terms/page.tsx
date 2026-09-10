import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata = buildPageMetadata({
  title: 'Terms of Service',
  description: 'Terms and conditions for using PhynyxPro services and the PYRO platform.',
  path: '/terms',
})

export default function TermsPage() {
  return (
    <div className="bg-ivory grain-subtle min-h-screen pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto max-w-[800px] px-6 lg:px-10">
        <h1 className="text-[36px] font-bold text-ink">Terms of Service</h1>
        <p className="mt-2 text-[14px] text-warm">Last updated: September 7, 2026</p>

        <div className="mt-10 space-y-8 text-[16px] leading-[1.7] text-ink/80">
          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Agreement to Terms</h2>
            <p>By accessing or using the PhynyxPro website, PYRO platform, or any services provided by PhynyxPro, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Services</h2>
            <p>PhynyxPro provides growth marketing services, CRM and automation tools (through the PYRO platform), AI-powered communication (Ember), and related consulting and strategy services for appointment-driven businesses.</p>
            <p className="mt-3">Unless otherwise stated in the client agreement, service descriptions on this website are illustrative, and the signed client agreement controls scope, deliverables, access, timing, and service levels.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Optional Texts and AI Calls</h2>
            <p>PhynyxPro offers optional marketing texts about its services, growth snapshots, and diagnostic bookings; separate appointment texts for confirmations, reminders, and schedule changes; and automated or AI-generated voice calls with Ember. Each channel requires the relevant form selection. Consent is not required to purchase services or submit a growth snapshot. Message frequency varies; message and data rates may apply.</p>
            <p className="mt-3">Reply STOP to unsubscribe from texts. Reply HELP for help or email craig@phynyxpro.com. To stop calls, ask the caller or contact us. Carriers are not liable for delayed or undelivered messages. See our <a href="/privacy-policy" className="text-phoenix underline">Privacy Policy</a> for information about how we handle your data.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Client Obligations</h2>
            <p>Clients agree to provide accurate business information, maintain appropriate licenses for their industry, and use our platform and services in compliance with all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Payment Terms</h2>
            <p>Service fees are outlined in individual client agreements. Unless otherwise stated in the client agreement, billing intervals, payment timing, and managed-service fees follow the scope of work agreed upon during onboarding.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Intellectual Property</h2>
            <p>All content, branding, software, and materials on this website and platform are the property of PhynyxPro unless otherwise stated. Clients retain ownership of their business data and content.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Limitation of Liability</h2>
            <p>PhynyxPro provides marketing and technology services but does not guarantee specific results. Marketing outcomes depend on many factors including market conditions, competition, and client participation.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Contact</h2>
            <p>Questions about these terms? Visit our <a href="/support" className="text-phoenix hover:underline">support page</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
