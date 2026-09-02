'use client'

import { useRef, useEffect, useState, type ReactNode } from 'react'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedSection({ children, className = '', delay = 0 }: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref?.current
    if (!el) return
    const prefersReduced = window?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (prefersReduced) {
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer?.unobserve?.(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer?.disconnect?.()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
    >
      {children}
    </div>
  )
}
