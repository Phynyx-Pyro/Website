import { POST as intake } from '@/app/api/intake-session/route'
import { POST as assessment } from '@/app/api/growth-assessment/route'
import { POST as booking } from '@/app/api/booking-session/route'
import { POST as support } from '@/app/api/support/route'
import { authenticateStudioBridge, StudioBridgeError } from '@/lib/studio-bridge'

export async function POST(request: Request) {
  try {
    const verified = await authenticateStudioBridge(request)
    const handler = { intake, assessment, booking, support }[verified.action]
    return await handler(verified.internalRequest)
  } catch (error) {
    if (error instanceof StudioBridgeError) {
      return Response.json({ success: false, code: error.code },
        { status: error.status, headers: { 'Cache-Control': 'no-store' } })
    }
    // Never log bridge signatures, cookies, or request bodies.
    return Response.json({ success: false, code: 'BRIDGE_UNAVAILABLE' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
