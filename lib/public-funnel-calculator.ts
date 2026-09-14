export type PublicFunnelInput = {
  inquiries: string
  booked: string
  attended: string
}

export type PublicFunnelResult = {
  inquiries: number
  booked: number
  attended: number
  bookingRate: number
  attendanceRate: number
  notBooked: number
  didNotAttend: number
  largestGap: 'booking' | 'attendance'
}

function parseCount(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) return null
  const count = Number(value)
  return Number.isSafeInteger(count) && count <= 10_000_000 ? count : null
}

export function calculatePublicFunnel(input: PublicFunnelInput): PublicFunnelResult | null {
  const inquiries = parseCount(input.inquiries)
  const booked = parseCount(input.booked)
  const attended = parseCount(input.attended)
  if (inquiries === null || booked === null || attended === null) return null
  if (inquiries === 0 || booked > inquiries || attended > booked) return null

  const bookingRate = booked / inquiries
  const attendanceRate = booked === 0 ? 0 : attended / booked
  return {
    inquiries,
    booked,
    attended,
    bookingRate,
    attendanceRate,
    notBooked: inquiries - booked,
    didNotAttend: booked - attended,
    largestGap: bookingRate <= attendanceRate ? 'booking' : 'attendance',
  }
}
