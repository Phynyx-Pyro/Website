import Link from 'next/link'
import Image from 'next/image'

export function SiteFooter() {
  return (
    <footer className="bg-night text-white grain-dark">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 px-6 lg:px-10 py-16">
        {/* Brand */}
        <div className="lg:col-span-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-9 w-9">
              <Image src="/images/pyro-icon.png" alt="PhynyxPro" fill className="object-contain" />
            </div>
            <div className="relative h-7 w-[140px]">
              <Image src="/images/phynyx-logo-white.png" alt="PhynyxPro" fill className="object-contain object-left" />
            </div>
          </Link>
          <p className="mt-5 max-w-[300px] text-[14.5px] leading-[1.6] text-white/60">
            More booked appointments. Fewer missed opportunities. A proof-led growth system for appointment-driven businesses.
          </p>
        </div>

        {/* System */}
        <div className="lg:col-span-2">
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">System</p>
          <div className="mt-4 space-y-2.5 text-[14.5px] text-white/75">
            <Link href="/growth-system" className="block hover:text-flame transition-colors">Growth System</Link>
            <Link href="/results" className="block hover:text-flame transition-colors">Results</Link>
            <Link href="/pyro-ember" className="block hover:text-flame transition-colors">PYRO & Ember</Link>
          </div>
        </div>

        {/* Industries */}
        <div className="lg:col-span-2">
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Industries</p>
          <div className="mt-4 space-y-2.5 text-[14.5px] text-white/75">
            <Link href="/industries/chiropractic" className="block hover:text-flame transition-colors">Chiropractic</Link>
            <Link href="/industries/home-services" className="block hover:text-flame transition-colors">Home Services</Link>
            <Link href="/industries/dental-medspa" className="block hover:text-flame transition-colors">Dental & Medspa</Link>
          </div>
        </div>

        {/* Company */}
        <div className="lg:col-span-2">
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Company</p>
          <div className="mt-4 space-y-2.5 text-[14.5px] text-white/75">
            <Link href="/about" className="block hover:text-flame transition-colors">About</Link>
            <Link href="/client-login" className="block hover:text-flame transition-colors">Client Login</Link>
            <Link href="/support" className="block hover:text-flame transition-colors">Support</Link>
          </div>
        </div>

        {/* Technology */}
        <div className="lg:col-span-2">
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Technology</p>
          <p className="mt-4 text-[16px] font-bold">PYRO <span className="font-normal text-white/60">by PhynyxPro</span></p>
          <p className="mt-2 text-[13.5px] leading-[1.55] text-white/60">
            The revenue-operations engine. Ember is a PYRO AI Employee.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex flex-col sm:flex-row max-w-[1320px] items-center justify-between px-6 lg:px-10 py-6 text-[12.5px] text-white/50 gap-4">
          <p>© 2026 PhynyxPro. PhynyxPro is the agency brand. PYRO by PhynyxPro powers your revenue operations.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-flame transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-flame transition-colors">Terms</Link>
            <Link href="/fulfillment" className="hover:text-flame transition-colors">Fulfillment Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
