import type { AssessmentAttribution } from './assessment-attribution'

const CURRENT_PAYLOAD_HASH_VERSION = 'v3'

type GrowthAssessmentPayloadHashes = {
  current: string
  unversionedCurrent: string
  polishedV2: string
  unversionedPolishedV2: string
  polishedV2Compatible: boolean
  productionV1: string
  productionV1Compatible: boolean
  legacy: string
  legacyCompatible: boolean
}

function polishedV2Attribution(attribution: AssessmentAttribution) {
  return {
    landingPage: attribution.landingPage,
    referrer: attribution.referrer,
    entryPoint: attribution.entryPoint,
    utmSource: attribution.utmSource,
    utmMedium: attribution.utmMedium,
    utmCampaign: attribution.utmCampaign,
    utmContent: attribution.utmContent,
    utmTerm: attribution.utmTerm,
    gclid: attribution.gclid,
    dclid: attribution.dclid,
    gbraid: attribution.gbraid,
    wbraid: attribution.wbraid,
    fbclid: attribution.fbclid,
    msclkid: attribution.msclkid,
    ttclid: attribution.ttclid,
    twclid: attribution.twclid,
    liFatId: attribution.liFatId,
  }
}

function productionV1Attribution(attribution: AssessmentAttribution) {
  return {
    conversionPage: attribution.conversionPage,
    landingPage: attribution.landingPage,
    referrer: attribution.referrer,
    ctaOrigin: attribution.ctaOrigin,
    sessionId: attribution.sessionId,
    utmSource: attribution.utmSource,
    utmMedium: attribution.utmMedium,
    utmCampaign: attribution.utmCampaign,
    utmContent: attribution.utmContent,
    utmTerm: attribution.utmTerm,
    gclid: attribution.gclid,
    fbclid: attribution.fbclid,
    msclkid: attribution.msclkid,
  }
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

function polishedV2Compatible(attribution: AssessmentAttribution) {
  return (
    !attribution.conversionPage &&
    !attribution.sessionId &&
    (!attribution.ctaOrigin ||
      attribution.ctaOrigin === attribution.entryPoint)
  )
}

function productionV1Compatible(attribution: AssessmentAttribution) {
  return (
    (!attribution.entryPoint ||
      attribution.entryPoint === attribution.ctaOrigin) &&
    [
    attribution.dclid,
    attribution.gbraid,
    attribution.wbraid,
    attribution.ttclid,
    attribution.twclid,
    attribution.liFatId,
    ].every((value) => !value)
  )
}

function legacyCompatible(attribution: AssessmentAttribution) {
  return [
    attribution.conversionPage,
    attribution.entryPoint,
    attribution.ctaOrigin,
    attribution.sessionId,
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
  const [currentDigest, polishedV2Digest, productionV1Digest, legacyDigest] =
    await Promise.all([
      sha256(JSON.stringify([...nonAttributionValues, attribution])),
      sha256(
        JSON.stringify([
          ...nonAttributionValues,
          polishedV2Attribution(attribution),
        ]),
      ),
      sha256(
        JSON.stringify([
          ...nonAttributionValues,
          productionV1Attribution(attribution),
        ]),
      ),
      sha256(
        JSON.stringify([...nonAttributionValues, legacyAttribution(attribution)]),
      ),
    ])

  return {
    current: `${CURRENT_PAYLOAD_HASH_VERSION}:${currentDigest}`,
    unversionedCurrent: currentDigest,
    polishedV2: `v2:${polishedV2Digest}`,
    unversionedPolishedV2: polishedV2Digest,
    polishedV2Compatible: polishedV2Compatible(attribution),
    productionV1: productionV1Digest,
    productionV1Compatible: productionV1Compatible(attribution),
    legacy: legacyDigest,
    legacyCompatible: legacyCompatible(attribution),
  }
}

export function growthAssessmentPayloadHashMatches(
  storedHash: string | null,
  hashes: GrowthAssessmentPayloadHashes,
) {
  if (storedHash === hashes.current || storedHash === hashes.unversionedCurrent) {
    return true
  }

  if (
    hashes.polishedV2Compatible &&
    (storedHash === hashes.polishedV2 ||
      storedHash === hashes.unversionedPolishedV2)
  ) {
    return true
  }

  if (hashes.productionV1Compatible && storedHash === hashes.productionV1) {
    return true
  }

  return hashes.legacyCompatible && storedHash === hashes.legacy
}
