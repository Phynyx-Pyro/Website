'use client'

import { useEffect, useRef, useState } from 'react'

export function Counter({
  end,
  prefix = '',
  suffix = '',
  duration = 1500,
  className = '',
}: {
  end: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref?.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started) {
          setStarted(true)
          observer?.unobserve?.(el)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer?.disconnect?.()
  }, [started])

  useEffect(() => {
    if (!started) return
    const step = end / (duration / 16)
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= end) {
        current = end
        clearInterval(timer)
      }
      setValue(Math.round(current))
    }, 16)
    return () => clearInterval(timer)
  }, [started, end, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{value?.toLocaleString?.('en-US') ?? '0'}{suffix}
    </span>
  )
}
