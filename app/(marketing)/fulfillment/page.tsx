import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata = buildPageMetadata({
  title: 'Fulfillment Policy',
  description: 'Service fulfillment, cancellation, and refund policies for PhynyxPro services and the PYRO platform.',
  path: '/fulfillment',
})

export default function FulfillmentPage() {
  return (
    <div className="bg-ivory grain-subtle min-h-screen pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto max-w-[800px] px-6 lg:px-10">
        <h1 className="text-[36px] font-bold text-ink">Fulfillment Policy</h1>
        <p className="mt-2 text-[14px] text-warm">Last updated: September 4, 2026</p>

        <div className="mt-10 space-y-8 text-[16px] leading-[1.7] text-ink/80">
          <p>Unless otherwise stated in the client agreement, the following standard fulfillment terms apply. The signed client agreement controls to the extent any provision differs.</p>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Service Delivery</h2>
            <p>PhynyxPro services are delivered digitally according to the scope, prerequisites, and timing in the signed client agreement. Implementation estimates begin after required access, inputs, and approvals have been received; third-party reviews or dependencies may affect live-launch timing.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">PYRO Platform Access</h2>
            <p>Platform access, billing intervals, activation requirements, and access duration are defined in the signed client agreement.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Cancellation</h2>
            <p>Cancellation rights, notice requirements, termination dates, and any continuing obligations are governed by the signed client agreement.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Refunds</h2>
            <p>Refund eligibility is governed by the signed client agreement. Advertising spend and other amounts already paid or committed to third-party platforms may be non-refundable once spent or committed.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Data Export</h2>
            <p>Where provided by the signed client agreement, clients may request an export of eligible data from the PYRO platform. Export format, timing, retention, and deletion are subject to that agreement, platform capabilities, and applicable law.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-ink mb-3">Contact</h2>
            <p>For fulfillment or refund inquiries, visit our <a href="/support" className="text-phoenix hover:underline">support page</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
