import { useEffect } from 'react'
import Lenis from 'lenis'

// Плавный инерционный скролл (выключается при «уменьшить движение»)
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, anchors: { offset: -72 } })
    let id
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf) }
    id = requestAnimationFrame(raf)
    window.__lenis = lenis
    return () => { cancelAnimationFrame(id); lenis.destroy() }
  }, [])
  return null
}
