'use client'

import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'
import { CONSENT_DISCLOSURES, type ContactConsent } from '@/lib/contact-consent'

export function ContactConsentFields({ value, onChange }: {
  value: ContactConsent
  onChange: (value: ContactConsent) => void
}) {
  return (
    <fieldset className="mt-5 space-y-3 text-left">
      <legend className="mb-2 text-[13px] font-semibold text-ink">Contact preferences (optional)</legend>
      {(Object.keys(CONSENT_DISCLOSURES) as Array<keyof ContactConsent>).map((key) => (
        <label key={key} className="flex cursor-pointer items-start gap-3 text-[11px] leading-[1.6] text-warm">
          <Checkbox checked={value[key]} onCheckedChange={(checked) => onChange({ ...value, [key]: checked === true })} className="mt-1 shrink-0" />
          <span>{CONSENT_DISCLOSURES[key]}</span>
        </label>
      ))}
      <p className="text-[11px] leading-[1.6] text-warm">
        Continuing saves your contact details so we can email you about your requested fit check and diagnostic.
        {' '}<Link href="/privacy-policy" className="underline">Privacy Policy</Link>
        {' '}&middot;{' '}<Link href="/terms" className="underline">Terms</Link>
      </p>
    </fieldset>
  )
}
