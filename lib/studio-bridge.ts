import { env } from 'cloudflare:workers'

const MAX_BODY_BYTES = 24 * 1_024
const MAX_CLOCK_SKEW_MS = 60_000
const ACTION_PATHS = {
  intake: '/api/intake-session',
  assessment: '/api/growth-assessment',
  booking: '/api/booking-session',
} as const

export type StudioBridgeAction = keyof typeof ACTION_PATHS

export class StudioBridgeError extends Error {
  constructor(readonly status: number, readonly code: string) {
    super(code)
  }
}

function configuredOrigin(value: string | undefined) {
  if (!value) return ''
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.origin === value ? value : ''
  } catch {
    return ''
  }
}

function hexBytes(value: string) {
  return new Uint8Array(value.match(/.{2}/g)!.map((part) => Number.parseInt(part, 16)))
}

function checkedCookie(header: string | null) {
  if (!header) return ''
  const seen = new Set<string>()
  for (const part of header.split(';')) {
    const match = /^\s*(__Host-phynyx_intake|phynyx_booking)=([0-9a-f]{64})\s*$/.exec(part)
    if (!match || seen.has(match[1])) throw new StudioBridgeError(400, 'INVALID_BRIDGE_COOKIE')
    seen.add(match[1])
  }
  return header
}

async function boundedBody(request: Request) {
  const declared = request.headers.get('content-length')
  if (declared && Number(declared) > MAX_BODY_BYTES) {
    throw new StudioBridgeError(413, 'BRIDGE_BODY_TOO_LARGE')
  }
  if (!request.body) return new Uint8Array()
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > MAX_BODY_BYTES) {
        await reader.cancel()
        throw new StudioBridgeError(413, 'BRIDGE_BODY_TOO_LARGE')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const body = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return body
}

export async function authenticateStudioBridge(request: Request) {
  const secret = env.STUDIO_BRIDGE_SECRET?.trim()
  const allowedOrigin = configuredOrigin(env.STUDIO_BRIDGE_ORIGIN?.trim())
  // Both bindings are required. A partial configuration leaves the route closed.
  if (!secret || new TextEncoder().encode(secret).byteLength < 32 || !allowedOrigin) {
    throw new StudioBridgeError(404, 'BRIDGE_DISABLED')
  }
  if (request.method !== 'POST') throw new StudioBridgeError(405, 'METHOD_NOT_ALLOWED')
  if (new URL(request.url).pathname !== '/api/studio-bridge') {
    throw new StudioBridgeError(404, 'BRIDGE_NOT_FOUND')
  }

  const headers = request.headers
  const action = headers.get('x-phynyx-bridge-action') as StudioBridgeAction | null
  const timestamp = headers.get('x-phynyx-bridge-timestamp') || ''
  const nonce = headers.get('x-phynyx-bridge-nonce') || ''
  const signature = headers.get('x-phynyx-bridge-signature') || ''
  const visitorOrigin = headers.get('x-phynyx-bridge-visitor-origin') || ''
  const clientAddress = headers.get('x-phynyx-bridge-client-address') || ''
  const cookie = checkedCookie(headers.get('cookie'))
  if (!action || !Object.hasOwn(ACTION_PATHS, action) || !/^\d{13}$/.test(timestamp) ||
    Math.abs(Date.now() - Number(timestamp)) > MAX_CLOCK_SKEW_MS ||
    !/^[0-9a-f]{32}$/.test(nonce) || !/^[0-9a-f]{64}$/.test(signature) ||
    visitorOrigin !== allowedOrigin ||
    (headers.has('origin') && headers.get('origin') !== visitorOrigin) ||
    !/^[a-zA-Z0-9:.\-_]{1,128}$/.test(clientAddress) ||
    (action === 'assessment' && !cookie.includes('__Host-phynyx_intake=')) ||
    (action === 'booking' && (!cookie.includes('__Host-phynyx_intake=') || !cookie.includes('phynyx_booking=')))) {
    throw new StudioBridgeError(403, 'BRIDGE_FORBIDDEN')
  }

  const contentType = headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase()
  if ((action !== 'booking' || contentType) && contentType !== 'application/json') {
    throw new StudioBridgeError(415, 'UNSUPPORTED_MEDIA_TYPE')
  }
  const body = await boundedBody(request)
  // The existing browser sends `{}` to claim a booking session. Accept that
  // exact JSON body, or no body, without broadening the claim endpoint.
  if (action === 'booking' && body.byteLength !== 0 &&
    !(contentType === 'application/json' && body.byteLength === 2 &&
      body[0] === 0x7b && body[1] === 0x7d)) {
    throw new StudioBridgeError(400, 'UNEXPECTED_BRIDGE_BODY')
  }
  const bodyHash = await crypto.subtle.digest('SHA-256', body)
  const bodyHashHex = Array.from(new Uint8Array(bodyHash), (byte) => byte.toString(16).padStart(2, '0')).join('')
  const signed = JSON.stringify([
    'phynyx-studio-bridge-v1', timestamp, nonce, action, visitorOrigin,
    clientAddress, cookie, contentType || '', bodyHashHex,
  ])
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
  const valid = await crypto.subtle.verify('HMAC', key, hexBytes(signature), new TextEncoder().encode(signed))
  if (!valid) throw new StudioBridgeError(403, 'BRIDGE_FORBIDDEN')

  // The existing D1 rate-limit table provides an atomic, expiring replay key.
  const now = Date.now()
  const receipt = await env.DB.prepare(
    'INSERT INTO public_form_rate_limits (key, count, expires_at, updated_at) VALUES (?, 1, ?, ?) ON CONFLICT(key) DO NOTHING RETURNING key',
  ).bind(`bridge:nonce:${nonce}`, now + MAX_CLOCK_SKEW_MS * 3, now).first<{ key: string }>()
  if (!receipt) throw new StudioBridgeError(409, 'BRIDGE_REPLAYED')

  // The signature authorizes only this narrowly reconstructed request. The
  // Studio server function must first enforce browser same-origin/CSRF and
  // derive clientAddress from trusted server request metadata, never a browser
  // header. Existing handlers then retain their D1 grants and CRM ordering.
  const url = new URL(ACTION_PATHS[action], request.url)
  const internalHeaders = new Headers({
    Origin: url.origin,
    'CF-Connecting-IP': clientAddress,
  })
  if (cookie) internalHeaders.set('Cookie', cookie)
  if (contentType) internalHeaders.set('Content-Type', contentType)
  return {
    action,
    internalRequest: new Request(url, {
      method: 'POST', headers: internalHeaders,
      body: body.byteLength ? body : undefined,
    }),
  }
}
