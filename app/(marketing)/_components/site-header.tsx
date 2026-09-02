'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown } from 'lucide-react'

const navLinks = [
  { label: 'Growth System', href: '/growth-system' },
  {
    label: 'Industries',
    href: '/industries',
    children: [
      { label: 'Chiropractic', href: '/industries/chiropractic' },
      { label: 'Home Services', href: '/industries/home-services' },
      { label: 'Dental & Medspa', href: '/industries/dental-medspa' },
    ],
  },
  { label: 'Results', href: '/results' },
  { label: 'PYRO & Ember', href: '/pyro-ember' },
  { label: 'About', href: '/about' },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window?.scrollY > 20)
    window?.addEventListener?.('scroll', handleScroll)
    return () => window?.removeEventListener?.('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ivory backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
          : 'bg-ivory backdrop-blur-sm'
      }`}
    >
      <nav className="mx-auto flex h-[84px] max-w-[1320px] items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="relative h-[26px] w-[132px] lg:h-[30px] lg:w-[150px]">
            <Image src="/images/phynyx-logo-black.png" alt="PhynyxPro" fill className="object-contain object-left" priority />
          </div>
          <span className="h-5 w-px bg-ink/20" />
          <span className="text-[11px] font-bold uppercase tracking-[.3em] text-warm">Pro</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8 text-[14.5px] font-medium text-ink/80">
          {navLinks?.map((link: any) => (
            <div key={link?.href} className="relative">
              {link?.children ? (
                <div
                  className="relative"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <button className="flex items-center gap-1.5 hover:text-phoenix transition-colors">
                    {link?.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 pt-2">
                      <div className="bg-white rounded-xl border border-black/10 py-2 px-1 min-w-[200px] lift-sm">
                        {link?.children?.map((child: any) => (
                          <Link
                            key={child?.href}
                            href={child?.href}
                            className="block px-4 py-2.5 rounded-lg text-[14px] hover:bg-ivory hover:text-phoenix transition-colors"
                          >
                            {child?.label}
                          </Link>
                        ))}
                        <div className="border-t border-black/5 mt-1 pt-1 mx-1">
                          <Link
                            href="/industries"
                            className="block px-4 py-2.5 rounded-lg text-[13px] text-warm hover:bg-ivory hover:text-phoenix transition-colors"
                          >
                            View all industries →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href={link?.href} className="hover:text-phoenix transition-colors">
                  {link?.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Desktop CTA */}
        <Link
          href="/growth-assessment"
          className="hidden lg:flex items-center gap-2.5 rounded-lg bg-phoenix px-5 py-3.5 text-[14px] font-semibold text-white shadow-[0_12px_28px_-12px_rgba(212,85,42,.95)] hover:bg-ember transition-colors group"
        >
          Book a Growth Assessment
          <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-black/10"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>
    </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[84px] z-40 bg-ivory overflow-y-auto lg:hidden">
          <div className="px-6 py-8 space-y-2">
            {navLinks?.map((link: any) => (
              <div key={link?.href}>
                <Link
                  href={link?.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-[18px] font-semibold text-ink hover:text-phoenix transition-colors"
                >
                  {link?.label}
                </Link>
                {link?.children && (
                  <div className="pl-4 space-y-1">
                    {link?.children?.map((child: any) => (
                      <Link
                        key={child?.href}
                        href={child?.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-2 text-[16px] text-warm hover:text-phoenix transition-colors"
                      >
                        {child?.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-6">
              <Link
                href="/growth-assessment"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-phoenix py-4 text-[15px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(212,85,42,.95)]"
              >
                Book a Growth Assessment
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
