import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fulfillment Policy — PhynyxPro',
  description: 'Service fulfillment, cancellation, and refund policies for PhynyxPro services and the PYRO platform.',
}

export default function FulfillmentPage() {
  return (
    <main className="bg-ivory grain-subtle min-h-screen pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto max-w-[800px] px-6 lg:px-10">
        <h1 className="text-[36px] font-bold text-ink">Fulfillment Policy</h1>
        <p className="mt-2 text-[14px] text-warm">Last updated: September 1, 2026</p>

        <div className="mt-10 space-y-8 text-[16px] leading-[1.7] text-ink/80">
          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Service Delivery</h2>
            <p>PhynyxPro services are delivered digitally. Upon engagement, clients receive access to the PYRO platform, onboarding materials, and their assigned account team. Onboarding typically begins within 5 business days of agreement execution.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">PYRO Platform Access</h2>
            <p>PYRO platform access is provided on a monthly subscription basis. Access is activated upon the first payment and continues for the duration of the subscription period.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Cancellation</h2>
            <p>Clients may cancel services with 30 days written notice. PYRO platform subscriptions can be cancelled at the end of any billing period. Managed service engagements follow the cancellation terms outlined in the individual service agreement.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Refunds</h2>
            <p>PYRO platform fees are non-refundable for the current billing period. Managed service fees may be eligible for prorated refunds based on work completed, at PhynyxPro&apos;s discretion. Advertising spend passed through to platforms (Google, Meta, etc.) is non-refundable once spent.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Data Export</h2>
            <p>Upon cancellation, clients may request an export of their data from the PYRO platform. We will provide data export within 30 days of the request. After 60 days post-cancellation, client data may be permanently deleted.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Contact</h2>
            <p>For fulfillment or refund inquiries, visit our <a href="/support" className="text-phoenix hover:underline">support page</a>.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
