import { env } from 'cloudflare:workers'

const MAX_IDEMPOTENCY_KEY_LENGTH = 80
const IDEMPOTENCY_KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type RateLimitRule = {
  key: string
  limit: number
  windowMs: number
}

export class PublicFormError extends Error {
  readonly status: number
  readonly code: string
  readonly retryAfter?: number

  constructor(status: number, code: string, message: string, retryAfter?: number) {
    super(message)
    this.name = 'PublicFormError'
    this.status = status
    this.code = code
    this.retryAfter = retryAfter
  }
}

export function publicFormErrorResponse(error: PublicFormError) {
  const headers = new Headers({ 'Cache-Control': 'no-store' })
  if (error.retryAfter) headers.set('Retry-After', String(error.retryAfter))

  return Response.json(
    { success: false, code: error.code, message: error.message },
    { status: error.status, headers },
  )
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  const expectedOrigin = new URL(request.url).origin

  if (!origin || origin !== expectedOrigin) {
    throw new PublicFormError(
      403,
      'INVALID_ORIGIN',
      'This form must be submitted from the PhynyxPro website.',
    )
  }
}

export function normalizeSubmissionId(value: unknown) {
  if (typeof value !== 'string') {
    throw new PublicFormError(
      400,
      'INVALID_SUBMISSION_ID',
      'This form session is invalid. Please refresh the page and try again.',
    )
  }
  const normalized = value.trim().slice(0, MAX_IDEMPOTENCY_KEY_LENGTH)
  if (!IDEMPOTENCY_KEY_PATTERN.test(normalized)) {
    throw new PublicFormError(
      400,
      'INVALID_SUBMISSION_ID',
      'This form session is invalid. Please refresh the page and try again.',
    )
  }
  return normalized.toLowerCase()
}

export function normalizePhone(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const digits = trimmed.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length >= 11 && digits.length <= 15) return `+${digits}`
  return ''
}

export function normalizePhoneForComparison(value: string) {
  return normalizePhone(value).replace(/^\+/, '')
}

export async function hashText(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

export async function readBoundedJson(
  request: Request,
  maxBytes: number,
): Promise<Record<string, unknown>> {
  assertSameOrigin(request)

  const contentType =
    request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase() ?? ''
  if (contentType !== 'application/json') {
    throw new PublicFormError(
      415,
      'UNSUPPORTED_MEDIA_TYPE',
      'This form requires a JSON request.',
    )
  }

  const declaredLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new PublicFormError(413, 'PAYLOAD_TOO_LARGE', 'This submission is too large.')
  }

  if (!request.body) {
    throw new PublicFormError(400, 'INVALID_JSON', 'The form submission is empty.')
  }

  const reader = request.body.getReader()
  const decoder = new TextDecoder()
  let received = 0
  let text = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      received += value.byteLength
      if (received > maxBytes) {
        await reader.cancel()
        throw new PublicFormError(
          413,
          'PAYLOAD_TOO_LARGE',
          'This submission is too large.',
        )
      }

      text += decoder.decode(value, { stream: true })
    }
    text += decoder.decode()
  } finally {
    reader.releaseLock()
  }

  try {
    const parsed = JSON.parse(text) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Expected an object.')
    }
    return parsed as Record<string, unknown>
  } catch {
    throw new PublicFormError(400, 'INVALID_JSON', 'The form submission is invalid.')
  }
}

async function incrementRateLimit(rule: RateLimitRule, now: number) {
  const expiresAt = now + rule.windowMs
  const result = await env.DB.prepare(
    `INSERT INTO public_form_rate_limits (key, count, expires_at, updated_at)
     VALUES (?, 1, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN expires_at <= excluded.updated_at THEN 1 ELSE count + 1 END,
       expires_at = CASE WHEN expires_at <= excluded.updated_at THEN excluded.expires_at ELSE expires_at END,
       updated_at = excluded.updated_at
     RETURNING count, expires_at`,
  )
    .bind(rule.key, expiresAt, now)
    .first<{ count: number; expires_at: number }>()

  if (!result) throw new Error('The public form rate limit could not be evaluated.')

  if (result.count > rule.limit) {
    const retryAfter = Math.max(1, Math.ceil((result.expires_at - now) / 1_000))
    throw new PublicFormError(
      429,
      'RATE_LIMITED',
      'Too many submissions were received. Please wait a few minutes and try again.',
      retryAfter,
    )
  }
}

export async function enforcePublicFormRateLimit(options: {
  request: Request
  scope: 'growth-assessment' | 'support' | 'booking-session'
  identity: string
}) {
  const now = Date.now()
  const clientAddress = requestHeadersClientAddress(options.request)
  const identity = options.identity.trim().toLowerCase()
  const scope = options.scope

  const globalLimit =
    scope === 'growth-assessment' ? 200 : scope === 'support' ? 120 : 500
  const clientLimit =
    scope === 'growth-assessment' ? 20 : scope === 'support' ? 12 : 30

  const clientKey = await hashText(`${scope}:client:${clientAddress}`)
  await incrementRateLimit(
    { key: `${scope}:client:${clientKey}`, limit: clientLimit, windowMs: 15 * 60_000 },
    now,
  )

  if (identity) {
    const identityKey = await hashText(
      `${scope}:identity:${clientAddress}:${identity}`,
    )
    await incrementRateLimit(
      { key: `${scope}:identity:${identityKey}`, limit: 5, windowMs: 60 * 60_000 },
      now,
    )
  }

  await incrementRateLimit(
    { key: `${scope}:global`, limit: globalLimit, windowMs: 10 * 60_000 },
    now,
  )

  await env.DB.prepare('DELETE FROM public_form_rate_limits WHERE expires_at <= ?')
    .bind(now)
    .run()
}

function requestHeadersClientAddress(request: Request) {
  return request.headers.get('cf-connecting-ip')?.trim() || 'unknown-client'
}

export function canonicalPayloadHashInput(values: readonly unknown[]) {
  return JSON.stringify(values)
}
