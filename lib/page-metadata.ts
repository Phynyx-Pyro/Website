import type { Metadata } from 'next'

type PageMetadataInput = {
  title: string
  description: string
  path: `/${string}` | '/'
  index?: boolean
}

export function buildPageMetadata({
  title,
  description,
  path,
  index = true,
}: PageMetadataInput): Metadata {
  const socialTitle = title.includes('PhynyxPro')
    ? title
    : `${title} — PhynyxPro`

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: index ? undefined : { index: false, follow: false },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      images: [{ url: '/og-image-v2.png', width: 1200, height: 630 }],
      type: 'website',
      siteName: 'PhynyxPro',
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: ['/og-image-v2.png'],
    },
  }
}
