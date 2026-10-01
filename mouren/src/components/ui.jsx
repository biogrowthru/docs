import { motion, useReducedMotion } from 'motion/react'
export const asset = (p) => import.meta.env.BASE_URL + p

export function Section({ id, tone = 'white', className = '', children, label }) {
  const tones = { white: 'bg-white text-ink', blush: 'bg-blush text-wine', wine: 'bg-wine text-white', soft: 'bg-blush-soft text-ink' }
  return <section id={id} aria-label={label} className={`py-14 md:py-28 ${tones[tone]} ${className}`}>{children}</section>
}

export function Fade({ children, className = '', delay = 0, y = 24, as = 'div' }) {
  const reduce = useReducedMotion()
  const M = motion[as] || motion.div
  return (
    <M className={className} initial={reduce ? false : { opacity: 0.35, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay }}>
      {children}
    </M>
  )
}

export function Shield({ className = 'size-5' }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3Z" /><path d="M8.8 12.2l2.2 2.2 4.2-4.6" strokeLinecap="round" /></svg>
}
export function Check({ className = 'size-4' }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
}
export function Cross({ className = 'size-4' }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" /></svg>
}
export function Arrow({ className = 'size-4' }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
}
