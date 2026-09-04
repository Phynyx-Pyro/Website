import { SiteHeader } from '@/app/(marketing)/_components/site-header'
import { SiteFooter } from '@/app/(marketing)/_components/site-footer'
import { AssessmentPrefillProvider } from '@/app/(marketing)/_components/assessment-prefill-provider'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AssessmentPrefillProvider>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </AssessmentPrefillProvider>
  )
}
