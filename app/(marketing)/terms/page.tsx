import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — PhynyxPro',
  description: 'Terms and conditions for using PhynyxPro services and the PYRO platform.',
}

export default function TermsPage() {
  return (
    <main className="bg-ivory grain-subtle min-h-screen pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto max-w-[800px] px-6 lg:px-10">
        <h1 className="text-[36px] font-bold text-ink">Terms of Service</h1>
        <p className="mt-2 text-[14px] text-warm">Last updated: September 1, 2026</p>

        <div className="mt-10 space-y-8 text-[16px] leading-[1.7] text-ink/80">
          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Agreement to Terms</h2>
            <p>By accessing or using the PhynyxPro website, PYRO platform, or any services provided by PhynyxPro, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Services</h2>
            <p>PhynyxPro provides growth marketing services, CRM and automation tools (through the PYRO platform), AI-powered communication (Ember), and related consulting and strategy services for appointment-driven businesses.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Client Obligations</h2>
            <p>Clients agree to provide accurate business information, maintain appropriate licenses for their industry, and use our platform and services in compliance with all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Payment Terms</h2>
            <p>Service fees are outlined in individual client agreements. PYRO platform access is billed monthly. Managed services are quoted and billed based on the scope of work agreed upon during onboarding.</p>
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
    </main>
  )
}
