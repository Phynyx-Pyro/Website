'use client'

import Image from 'next/image'
import { Counter } from '../../_components/counter'

export function TrustStrip() {
  return (
    <section className="slant-both relative z-20 mt-8 lg:mt-14 bg-ink text-white grain-dark">
      <div className="mx-auto flex flex-col lg:flex-row max-w-[1320px] items-start lg:items-center justify-between px-5 lg:px-10 pb-10 pt-11 gap-6">
        <div className="flex items-center gap-3">
          <div className="relative h-5 w-5">
            <Image src="/images/pyro-icon.png" alt="" fill className="object-contain" style={{ objectFit: 'contain' }} />
          </div>
          <p className="text-[12px] font-bold uppercase tracking-[.18em] text-white/70">
            Documented, not embellished
          </p>
        </div>
        <div className="grid grid-cols-2 lg:flex items-center gap-6 lg:gap-11">
          <div>
            <p className="text-[27px] lg:text-[30px] font-bold leading-none tracking-[-.03em]">
              <Counter end={5} suffix="" className="" /><span className="text-phoenix">+</span>
            </p>
            <p className="mt-1 text-[10.5px] lg:text-[11.5px] uppercase tracking-[.1em] text-white/60">Years operating</p>
          </div>
          <div className="hidden lg:block h-9 w-px bg-white/15" />
          <div>
            <p className="text-[27px] lg:text-[30px] font-bold leading-none tracking-[-.03em]">
              <Counter end={140} className="" /><span className="text-phoenix">+</span>
            </p>
            <p className="mt-1 text-[10.5px] lg:text-[11.5px] uppercase tracking-[.1em] text-white/60">Practices served</p>
          </div>
          <div className="hidden lg:block h-9 w-px bg-white/15" />
          <div>
            <p className="text-[27px] lg:text-[30px] font-bold leading-none tracking-[-.03em]">
              &lt;1<span className="text-phoenix">min</span>
            </p>
            <p className="mt-1 text-[10.5px] lg:text-[11.5px] uppercase tracking-[.1em] text-white/60">Lead response time</p>
          </div>
          <div className="hidden lg:block h-9 w-px bg-white/15" />
          <div>
            <p className="text-[27px] lg:text-[30px] font-bold leading-none tracking-[-.03em]">
              24<span className="text-phoenix">/7</span>
            </p>
            <p className="mt-1 text-[10.5px] lg:text-[11.5px] uppercase tracking-[.1em] text-white/60">Coverage with Ember</p>
          </div>
          <div className="hidden lg:block h-9 w-px bg-white/15" />
          <div className="col-span-2 lg:col-span-1 max-w-[168px] border-t border-white/12 pt-5 lg:pt-0 lg:border-0">
            <p className="text-[13.5px] font-semibold leading-tight">Built by a practicing chiropractor.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
