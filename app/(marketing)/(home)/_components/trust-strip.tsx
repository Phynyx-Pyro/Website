'use client'

import Image from 'next/image'

const trustPoints = [
  ['Chiropractic-first', 'Built around the new-patient journey'],
  ['Full-funnel view', 'From campaign source to start of care'],
  ['Operator-led', 'A system shaped by practice reality'],
  ['Human handoff', 'Your team steps in when it should'],
]

export function TrustStrip() {
  return (
    <section className="slant-both relative z-20 bg-ink text-white grain-dark">
      <div className="mx-auto grid max-w-[1320px] gap-6 px-5 pb-11 pt-12 lg:grid-cols-[1.25fr_3fr] lg:items-center lg:px-10">
        <div className="flex items-center gap-3">
          <div className="relative h-6 w-6 shrink-0">
            <Image src="/images/pyro-icon.png" alt="" fill className="object-contain" />
          </div>
          <p className="max-w-[250px] text-[12px] font-bold uppercase leading-[1.45] tracking-[.16em] text-white/75">
            Designed around the handoffs that decide patient acquisition
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-5 gap-y-6 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-white/12">
          {trustPoints.map(([term, description]) => (
            <div key={term} className="lg:px-6 first:lg:pl-0 last:lg:pr-0">
              <dt className="text-[14px] font-bold text-white lg:text-[15px]">{term}</dt>
              <dd className="mt-1 text-[11.5px] leading-[1.45] text-white/55 lg:text-[12px]">{description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
