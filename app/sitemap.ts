import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

const LAST_CONTENT_REVIEW = new Date('2026-09-04T00:00:00.000Z')

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    '',
    '/growth-system',
    '/industries',
    '/industries/chiropractic',
    '/industries/home-services',
    '/industries/dental-medspa',
    '/results',
    '/about',
    '/pyro-ember',
    '/growth-assessment',
    '/support',
    '/privacy-policy',
    '/terms',
    '/fulfillment',
  ]

  return pages.map((path: string) => ({
    url: `${SITE_URL}${path}`,
    lastModified: LAST_CONTENT_REVIEW,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path?.includes('/industries/') ? 0.7 : 0.8,
  }))
}
