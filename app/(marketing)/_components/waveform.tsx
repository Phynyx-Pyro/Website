'use client'

const heights = [5,9,6,13,8,18,11,26,15,36,22,52,30,74,44,102,58,126,72,112,50,88,38,66,28,48,20,34,14,25,10,18,7,12,5]
const smallHeights = [5,9,6,14,9,22,13,34,20,52,30,74,44,96,56,84,38,64,26,46,18,32,12,22,9,16,7,11,5,8]

export function Waveform({ size = 'large', className = '' }: { size?: 'large' | 'small'; className?: string }) {
  const bars = size === 'large' ? heights : smallHeights
  return (
    <div className={`flex items-center gap-[3px] overflow-hidden ${className}`}>
      {bars.map((h: number, i: number) => (
        <span key={i} className="wave-bar" style={{ height: `${h}px` }} />
      ))}
    </div>
  )
}

export function SmallWaveform({ className = '' }: { className?: string }) {
  const bars = [5,10,16,9,20,12,22,8,15,19,7,13,18,9,21,11,6,14,17,8,12,20,10,5]
  return (
    <div className={`flex items-center gap-[2px] overflow-hidden ${className}`}>
      {bars.map((h: number, i: number) => (
        <span key={i} className="wave-bar" style={{ height: `${h}px` }} />
      ))}
    </div>
  )
}
