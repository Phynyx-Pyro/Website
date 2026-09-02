import { SiteHeader } from '@/app/(marketing)/_components/site-header'
import { SiteFooter } from '@/app/(marketing)/_components/site-footer'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  )
}
