import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const emberHeroUrl = new URL(
  '../app/(marketing)/pyro-ember/_components/pyro-ember-client.tsx',
  import.meta.url,
)
const homepagePyroUrl = new URL(
  '../app/(marketing)/(home)/_components/pyro-section.tsx',
  import.meta.url,
)

test('Ember is centered, faded, and responsive above the SMS workflow', async () => {
  const source = await readFile(emberHeroUrl, 'utf8')

  for (const layoutContract of [
    'relative flex justify-center',
    'relative w-full max-w-[320px] sm:max-w-[380px]',
    'relative z-10 mx-auto -mt-10 w-full max-w-[300px] sm:max-w-[340px]',
    'aspect-square w-full max-w-[360px]',
    'aspect-square w-full max-w-[300px]',
  ]) {
    assert.ok(source.includes(layoutContract), `Missing Ember layout contract: ${layoutContract}`)
  }

  assert.match(
    source,
    /WebkitMaskImage: 'linear-gradient\(to bottom, black 0%, black 78%, transparent 100%\)'/,
  )
  assert.match(
    source,
    /\n\s+maskImage: 'linear-gradient\(to bottom, black 0%, black 78%, transparent 100%\)'/,
  )

  assert.doesNotMatch(source, /relative flex justify-end/)
  assert.doesNotMatch(source, /relative -mt-6 w-/)
})

test('homepage workflow disclosure belongs to the horizontal workflow figure', async () => {
  const source = await readFile(homepagePyroUrl, 'utf8')
  const disclosure =
    'Illustrative workflow. Scripts, escalation rules, and calendar logic are configured for the practice.'

  assert.equal(source.split(disclosure).length - 1, 1)
  assert.ok(source.indexOf('<figure') < source.indexOf('<figcaption'))
  assert.ok(source.indexOf('<ol') < source.indexOf('<figcaption'))
  assert.match(
    source,
    /<figcaption className="[^"]*order-1[^"]*lg:order-2[^"]*lg:text-center[^"]*">/,
  )
  assert.doesNotMatch(source, /Example workflow shown for explanation/)
})
