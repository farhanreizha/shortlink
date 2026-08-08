import { useEffect, useRef, useState } from "react"

export function CountUp({
  value,
  suffix = "",
  delay = 0,
}: {
  value: number
  suffix?: string
  delay?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  const raf = useRef(0)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce || started.current) {
      setDisplay(value)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting || started.current) return
        started.current = true
        observer.unobserve(node)
        const start = performance.now() + delay * 1000
        const tick = (now: number) => {
          const t = Math.min(1, Math.max(0, (now - start) / 1000))
          const eased = 1 - (1 - t) ** 3
          setDisplay(t < 1 ? Math.round(value * eased) : value)
          if (t < 1) raf.current = requestAnimationFrame(tick)
        }
        raf.current = requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf.current)
    }
  }, [value, delay])

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  )
}
