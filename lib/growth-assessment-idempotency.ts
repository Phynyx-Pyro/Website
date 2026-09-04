import type { AssessmentAttribution } from './assessment-attribution'

const CURRENT_PAYLOAD_HASH_VERSION = 'v2'

type GrowthAssessmentPayloadHashes = {
  current: string
  unversionedCurrent: string
  legacy: string
  legacyCompatible: boolean
}

function legacyAttribution(attribution: AssessmentAttribution) {
  return {
    landingPage: attribution.landingPage,
    referrer: attribution.referrer,
    utmSource: attribution.utmSource,
    utmMedium: attribution.utmMedium,
    utmCampaign: attribution.utmCampaign,
    utmContent: attribution.utmContent,
    utmTerm: attribution.utmTerm,
    gclid: attribution.gclid,
    fbclid: attribution.fbclid,
  }
}

function hasOnlyLegacyAttribution(attribution: AssessmentAttribution) {
  return [
    attribution.entryPoint,
    attribution.dclid,
    attribution.gbraid,
    attribution.wbraid,
    attribution.msclkid,
    attribution.ttclid,
    attribution.twclid,
    attribution.liFatId,
  ].every((value) => !value)
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  )
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

export async function buildGrowthAssessmentPayloadHashes(
  nonAttributionValues: readonly unknown[],
  attribution: AssessmentAttribution,
): Promise<GrowthAssessmentPayloadHashes> {
  const currentDigest = await sha256(
    JSON.stringify([...nonAttributionValues, attribution]),
  )
  const legacyDigest = await sha256(
    JSON.stringify([...nonAttributionValues, legacyAttribution(attribution)]),
  )

  return {
    current: `${CURRENT_PAYLOAD_HASH_VERSION}:${currentDigest}`,
    unversionedCurrent: currentDigest,
    legacy: legacyDigest,
    legacyCompatible: hasOnlyLegacyAttribution(attribution),
  }
}

export function growthAssessmentPayloadHashMatches(
  storedHash: string | null,
  hashes: GrowthAssessmentPayloadHashes,
) {
  if (storedHash === hashes.current || storedHash === hashes.unversionedCurrent) {
    return true
  }

  return hashes.legacyCompatible && storedHash === hashes.legacy
}
