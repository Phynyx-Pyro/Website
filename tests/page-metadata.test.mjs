import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import test from 'node:test'
import { importTypeScriptModule } from './helpers/import-typescript.mjs'

const publicPages = new Map([
  ['../app/(marketing)/(home)/page.tsx', '/'],
  ['../app/(marketing)/about/page.tsx', '/about'],
  ['../app/(marketing)/client-login/page.tsx', '/client-login'],
  ['../app/(marketing)/fulfillment/page.tsx', '/fulfillment'],
  ['../app/(marketing)/growth-assessment/page.tsx', '/growth-assessment'],
  ['../app/(marketing)/growth-system/page.tsx', '/growth-system'],
  ['../app/(marketing)/industries/page.tsx', '/industries'],
  [
    '../app/(marketing)/industries/chiropractic/page.tsx',
    '/industries/chiropractic',
  ],
  [
    '../app/(marketing)/industries/dental-medspa/page.tsx',
    '/industries/dental-medspa',
  ],
  [
    '../app/(marketing)/industries/home-services/page.tsx',
    '/industries/home-services',
  ],
  ['../app/(marketing)/privacy-policy/page.tsx', '/privacy-policy'],
  ['../app/(marketing)/pyro-ember/page.tsx', '/pyro-ember'],
  ['../app/(marketing)/results/page.tsx', '/results'],
  ['../app/(marketing)/support/page.tsx', '/support'],
  ['../app/(marketing)/terms/page.tsx', '/terms'],
])

async function findTsxFiles(directoryUrl) {
  const entries = await readdir(directoryUrl, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const url = new URL(
        `${entry.name}${entry.isDirectory() ? '/' : ''}`,
        directoryUrl,
      )
      if (entry.isDirectory()) return findTsxFiles(url)
      return entry.isFile() && entry.name.endsWith('.tsx') ? [url] : []
    }),
  )
  return nested.flat()
}

test('every public page uses route-specific canonical and social metadata', async () => {
  for (const [file, expectedPath] of publicPages) {
    const source = await readFile(new URL(file, import.meta.url), 'utf8')
    const escapedPath = expectedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    assert.match(source, /buildPageMetadata\(\{/)
    assert.match(
      source,
      /title:\s*['"][^'"]+['"]/,
    )
    assert.match(source, /description:\s*(?:['"]|\n\s*['"])/)
    assert.match(
      source,
      new RegExp(`path:\\s*['"]${escapedPath}['"]`),
      `${file} should declare ${expectedPath} as its canonical route`,
    )
  }
})

test('metadata helper builds route-specific canonical cards and noindexes client login', async () => {
  const { buildPageMetadata } = await importTypeScriptModule(
    new URL('../lib/page-metadata.ts', import.meta.url),
  )
  const metadata = buildPageMetadata({
    title: 'Client Login',
    description: 'Private client access.',
    path: '/client-login',
    index: false,
  })

  assert.equal(metadata.title, 'Client Login')
  assert.equal(metadata.alternates.canonical, '/client-login')
  assert.equal(metadata.openGraph.url, '/client-login')
  assert.equal(metadata.openGraph.title, 'Client Login — PhynyxPro')
  assert.deepEqual(metadata.openGraph.images, [
    { url: '/og-image-v2.png', width: 1200, height: 630 },
  ])
  assert.equal(metadata.twitter.title, 'Client Login — PhynyxPro')
  assert.deepEqual(metadata.robots, { index: false, follow: false })

  const publicMetadata = buildPageMetadata({
    title: 'About PhynyxPro',
    description: 'About the company.',
    path: '/about',
  })
  assert.equal(publicMetadata.openGraph.title, 'About PhynyxPro')
  assert.equal(publicMetadata.robots, undefined)
})

test('indexing directives and key public titles do not conflict or duplicate', async () => {
  const robotsSource = await readFile(
    new URL('../app/robots.ts', import.meta.url),
    'utf8',
  )
  assert.doesNotMatch(robotsSource, /client-login/)

  const titleSources = await Promise.all(
    [
      '../app/(marketing)/(home)/page.tsx',
      '../app/(marketing)/industries/chiropractic/page.tsx',
      '../app/(marketing)/support/page.tsx',
    ].map((file) => readFile(new URL(file, import.meta.url), 'utf8')),
  )
  const titles = titleSources.map(
    (source) => source.match(/title:\s*['"]([^'"]+)['"]/)?.[1],
  )
  assert.equal(new Set(titles).size, titles.length)
  assert.equal(titles[2], 'Contact & Support')
})

test('sitemap uses one stable review date and covers every indexable public route', async () => {
  const sitemapUrl = new URL('../app/sitemap.ts', import.meta.url)
  const { default: sitemap } = await importTypeScriptModule(sitemapUrl, [
    ["import { MetadataRoute } from 'next'", ''],
    [
      "import { SITE_URL } from '@/lib/site'",
      "const SITE_URL = 'https://example.test'",
    ],
  ])
  const entries = sitemap()
  const expectedPaths = [...publicPages.values()].filter(
    (path) => path !== '/client-login',
  )

  assert.deepEqual(
    entries.map(({ url }) => new URL(url).pathname).sort(),
    expectedPaths.sort(),
  )
  assert.ok(
    entries.every(
      ({ lastModified }) =>
        lastModified instanceof Date &&
        lastModified.toISOString() === '2026-09-04T00:00:00.000Z',
    ),
  )

  const source = await readFile(sitemapUrl, 'utf8')
  assert.match(
    source,
    /const LAST_CONTENT_REVIEW = new Date\(['"]2026-09-04T00:00:00\.000Z['"]\)/,
  )
  assert.doesNotMatch(source, /new Date\(\s*\)/)
})

test('assessment CTA placement identifiers use the normalized underscore taxonomy', async () => {
  const marketingRoot = new URL('../app/(marketing)/', import.meta.url)
  const files = await findTsxFiles(marketingRoot)
  let ctaCount = 0

  for (const file of files) {
    const source = await readFile(file, 'utf8')
    const tags = source.match(/<AssessmentCtaLink\b[\s\S]*?>/g) ?? []
    ctaCount += tags.length

    for (const tag of tags) {
      const placement = tag.match(/\bplacement=['"]([^'"]+)['"]/)?.[1]
      assert.ok(
        placement,
        `${file.pathname} has a CTA without a literal placement`,
      )
      assert.match(
        placement,
        /^[a-z0-9]+(?:_[a-z0-9]+)*$/,
        `${file.pathname} uses a non-normalized CTA placement: ${placement}`,
      )
    }

    for (const [, placement] of source.matchAll(
      /data-cta-placement=['"]([^'"]+)['"]/g,
    )) {
      assert.match(
        placement,
        /^[a-z0-9]+(?:_[a-z0-9]+)*$/,
        `${file.pathname} uses a non-normalized data attribute: ${placement}`,
      )
    }
  }

  assert.ok(ctaCount >= 15, 'Expected CTA coverage across the marketing routes')
  const componentSource = await readFile(
    new URL(
      '../app/(marketing)/_components/assessment-cta-link.tsx',
      import.meta.url,
    ),
    'utf8',
  )
  assert.match(componentSource, /data-cta-placement=\{placement\}/)
  assert.match(componentSource, /diagnostic_cta_click['"], \{ placement \}/)
})
